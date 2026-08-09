const VERTEX_SOURCE = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT_SOURCE = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_energy;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.,0.)), f.x),
             mix(hash21(i + vec2(0.,1.)), hash21(i + vec2(1.,1.)), f.x), f.y);
}

float fbm(vec2 p){
  float value = 0.;
  float amp = .5;
  mat2 rot = mat2(.87758,-.47943,.47943,.87758);
  for(int i=0;i<5;i++){
    value += noise(p) * amp;
    p = rot * p * 2.03 + 17.17;
    amp *= .5;
  }
  return value;
}

float starLayer(vec2 uv, float scale, float t, float threshold){
  vec2 gv = fract(uv * scale) - .5;
  vec2 id = floor(uv * scale);
  float rnd = hash21(id);
  vec2 offset = vec2(hash21(id + 13.7), hash21(id + 41.9)) - .5;
  float d = length(gv - offset * .58);
  float core = smoothstep(.065, 0., d);
  float halo = smoothstep(.18, 0., d) * .18;
  float twinkle = .55 + .45 * sin(t * (1.2 + rnd * 2.7) + rnd * 31.4);
  return (core + halo) * smoothstep(threshold, 1., rnd) * twinkle;
}

void main(){
  vec2 frag = v_uv * u_resolution;
  vec2 p = (frag - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 pointerPx = u_pointer * u_resolution;
  vec2 mp = (pointerPx - .5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time;

  vec3 color = vec3(0.0);

  vec2 drift = vec2(t * .0035, -t * .0022);
  float dust = fbm(p * 2.8 + drift);
  float filaments = fbm(p * 5.2 - drift * 1.7 + vec2(dust * .7));
  float nebula = smoothstep(.58, .91, dust * .66 + filaments * .5);
  float pointerAura = exp(-2.6 * length(p - mp));
  vec3 cold = vec3(.08,.33,.52);
  vec3 violet = vec3(.20,.10,.45);
  vec3 nebulaColor = mix(violet, cold, smoothstep(.38,.78,dust));
  color += nebulaColor * nebula * (.055 + pointerAura * .035) * u_energy;

  float s1 = starLayer(v_uv + drift * .11, 46., t, .965);
  float s2 = starLayer(v_uv - drift * .07, 83., t * 1.17, .982);
  float s3 = starLayer(v_uv + drift * .035, 133., t * .78, .991);
  color += vec3(.50,.72,1.0) * s1 * .44 * u_energy;
  color += vec3(.72,.64,1.0) * s2 * .42 * u_energy;
  color += vec3(.88,.94,1.0) * s3 * .58 * u_energy;

  float r = length(p - mp * .25);
  float ring = abs(fract(r * 4.2 - t * .018) - .5);
  ring = smoothstep(.032, .0, ring) * exp(-1.5 * r) * .12;
  color += vec3(.18,.50,.78) * ring * u_energy;

  float scan = sin((frag.y + t * 17.) * .11) * .5 + .5;
  color += vec3(.05,.08,.12) * scan * .008 * u_energy;

  float vignette = smoothstep(1.22, .34, length(p));
  color *= vignette;
  outColor = vec4(color, 1.0);
}`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compile error';
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Unknown program link error';
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function initCanvas2DFallback(canvas, root, reducedMotion) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return () => {};
  let width = 0;
  let height = 0;
  let raf = 0;
  let visible = true;
  const stars = Array.from({ length: 110 }, (_, index) => ({
    x: ((index * 73) % 997) / 997,
    y: ((index * 193) % 991) / 991,
    r: .35 + ((index * 29) % 100) / 100 * 1.1,
    a: .18 + ((index * 47) % 100) / 100 * .58,
    s: .25 + ((index * 17) % 100) / 100 * .75
  }));

  const resize = () => {
    const rect = root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = Math.max(1, Math.round(rect.width * dpr));
    height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const draw = (now = 0) => {
    resize();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    const time = now * .001;
    for (const star of stars) {
      const pulse = reducedMotion ? 1 : .68 + Math.sin(time * star.s + star.x * 17) * .32;
      ctx.globalAlpha = star.a * pulse;
      ctx.fillStyle = '#dbeeff';
      ctx.beginPath();
      ctx.arc(star.x * width, star.y * height, star.r * Math.min(window.devicePixelRatio || 1, 1.75), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reducedMotion && visible && !document.hidden) raf = requestAnimationFrame(draw);
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reducedMotion && !raf) raf = requestAnimationFrame(draw);
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '180px' });
  observer.observe(root);
  resize();
  draw();
  return () => { observer.disconnect(); if (raf) cancelAnimationFrame(raf); };
}

export function initMain10Space(root) {
  const canvas = root?.querySelector('[data-main10-space]');
  if (!canvas) return () => {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let gl = null;
  try { gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance' }); } catch {}
  if (!gl) return initCanvas2DFallback(canvas, root, reducedMotion);

  let program;
  try { program = createProgram(gl); } catch (error) {
    console.warn('Main10 WebGL fallback:', error);
    return initCanvas2DFallback(canvas, root, reducedMotion);
  }

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const pointerLocation = gl.getUniformLocation(program, 'u_pointer');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const energyLocation = gl.getUniformLocation(program, 'u_energy');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(program);

  let raf = 0;
  let active = true;
  let visible = true;
  let pointer = { x: .5, y: .35 };
  let target = { x: .5, y: .35 };
  let energy = reducedMotion ? .55 : .85;

  const resize = () => {
    const rect = root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const draw = (now = 0) => {
    resize();
    pointer.x += (target.x - pointer.x) * .055;
    pointer.y += (target.y - pointer.y) * .055;
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(pointerLocation, pointer.x, 1 - pointer.y);
    gl.uniform1f(timeLocation, now * .001);
    gl.uniform1f(energyLocation, energy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reducedMotion && active && visible && !document.hidden) raf = requestAnimationFrame(draw);
    else raf = 0;
  };

  const onPointerMove = (event) => {
    const rect = root.getBoundingClientRect();
    target.x = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(1, rect.width)));
    target.y = Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(1, rect.height)));
  };
  const onPointerLeave = () => { target = { x: .5, y: .35 }; };
  const onVisibility = () => {
    active = !document.hidden;
    if (active && visible && !reducedMotion && !raf) raf = requestAnimationFrame(draw);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    energy = visible ? (reducedMotion ? .55 : .9) : .3;
    if (visible && !reducedMotion && active && !raf) raf = requestAnimationFrame(draw);
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '220px' });

  observer.observe(root);
  root.addEventListener('pointermove', onPointerMove, { passive: true });
  root.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  draw(0);

  return () => {
    observer.disconnect();
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('pointerleave', onPointerLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    if (raf) cancelAnimationFrame(raf);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
  };
}
