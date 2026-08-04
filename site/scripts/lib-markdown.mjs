const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

export function slugify(value, used = new Set()) {
  const base = String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section';
  let slug = base;
  let index = 2;
  while (used.has(slug)) slug = `${base}-${index++}`;
  used.add(slug);
  return slug;
}

function inlineMarkdown(value) {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*|#[^\s)]*)\)/g, (_match, label, href) => {
    const external = /^https?:\/\//.test(href) ? ' rel="external noopener"' : '';
    return `<a href="${escapeHtml(href)}"${external}>${label}</a>`;
  });
  return text;
}

function sanitizeTrustedTable(block) {
  return block
    .replace(/<table[^>]*>/i, '<div class="source-table"><table>')
    .replace(/<\/table>/i, '</table></div>')
    .replace(/<td>/g, '<td>')
    .replace(/<\/td>/g, '</td>')
    .replace(/<tr>/g, '<tr>')
    .replace(/<\/tr>/g, '</tr>');
}

export function renderSourceMarkdown(source) {
  const lines = String(source).replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
  const html = [];
  const toc = [];
  const usedSlugs = new Set();
  let paragraph = [];
  let listType = null;
  let listItems = [];
  let code = null;
  let codeLanguage = '';
  let table = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!listItems.length || !listType) return;
    html.push(`<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listType}>`);
    listItems = [];
    listType = null;
  };
  const flushAll = () => { flushParagraph(); flushList(); };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (table !== null) {
      table.push(line);
      if (line.trim() === '</table>') {
        html.push(sanitizeTrustedTable(table.join('\n')));
        table = null;
      }
      continue;
    }
    if (line.trim().startsWith('<table')) {
      flushAll();
      table = [line];
      continue;
    }

    const fence = line.match(/^```\s*(.*)$/);
    if (fence) {
      if (code === null) {
        flushAll();
        code = [];
        codeLanguage = fence[1].trim();
      } else {
        html.push(`<pre><code${codeLanguage ? ` class="language-${escapeHtml(codeLanguage.replace(/\s+/g, '-'))}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
        code = null;
        codeLanguage = '';
      }
      continue;
    }
    if (code !== null) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const title = heading[2].trim();
      if (level === 1) continue;
      const id = slugify(title, usedSlugs);
      if (level === 2) toc.push({id, title});
      html.push(`<h${level} id="${id}">${inlineMarkdown(title)}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push((unordered || ordered)[1]);
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushAll();
      html.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      flushAll();
      html.push('<hr>');
      continue;
    }

    paragraph.push(line.trim());
  }

  flushAll();
  if (code !== null) throw new Error('UNCLOSED_MARKDOWN_FENCE');
  if (table !== null) throw new Error('UNCLOSED_NOTION_TABLE');
  return {html: html.join('\n'), toc};
}
