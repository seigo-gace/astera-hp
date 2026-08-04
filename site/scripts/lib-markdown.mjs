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
    .replace(/<\/table>/i, '</table></div>');
}

export function renderSourceMarkdown(source, options = {}) {
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
  let sectionOpen = false;
  let sectionIndex = 0;

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
  const closeSection = () => { if (sectionOpen) { html.push('</section>'); sectionOpen = false; } };

  for (const line of lines) {
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
      const rawTitle = heading[2].trim();
      const explicit = rawTitle.match(/^(.*?)\s*\{#([A-Za-z0-9_-]+)\}$/);
      const title = (explicit ? explicit[1] : rawTitle).trim();
      if (level === 1) continue;
      let id;
      if (explicit) {
        id = explicit[2];
        if (usedSlugs.has(id)) throw new Error(`DUPLICATE_HEADING_ID ${id}`);
        usedSlugs.add(id);
      } else {
        id = slugify(title, usedSlugs);
      }
      if (level === 2) {
        closeSection();
        sectionIndex += 1;
        toc.push({id, title});
        const qa = options.qaItems ? ' data-qa-item' : '';
        html.push(`<section class="content-section source-section" id="${id}"${qa} data-reveal><p class="section-number">${String(sectionIndex).padStart(2, '0')}</p><h2>${inlineMarkdown(title)}</h2>`);
        sectionOpen = true;
      } else {
        html.push(`<h${level} id="${id}">${inlineMarkdown(title)}</h${level}>`);
      }
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
  closeSection();
  if (code !== null) throw new Error('UNCLOSED_MARKDOWN_FENCE');
  if (table !== null) throw new Error('UNCLOSED_NOTION_TABLE');
  if (!toc.length) throw new Error('SOURCE_MARKDOWN_HAS_NO_H2');
  return {html: html.join('\n'), toc};
}
