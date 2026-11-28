/* ============================================================
 * AI Agent 全能开发实战 —— 站点交互脚本
 * 说明：本文件负责数据加载、Markdown 渲染、目录生成、
 *      思维导图绘制与页面导航。所有逻辑均在前端完成，
 *      因此整站可作为纯静态站点部署。
 * ============================================================ */

const LEVEL_CLASS = { 1: "lv1", 2: "lv2", 3: "lv3", 4: "lv4" };
const COURSE_DATA_URL = "data/chapters.json";
const SYLLABUS_DATA_URL = "data/syllabus.json";
const LESSONS_DATA_URL = "data/lessons.json";

/* ---------- 基础工具 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str, max) {
  const s = String(str);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function badgeHtml(chapter) {
  return `<span class="badge ${LEVEL_CLASS[chapter.level] || "lv1"}">${esc(chapter.difficulty)}</span>`;
}

let courseCache = null;
async function loadCourse() {
  if (courseCache) return courseCache;
  const res = await fetch(COURSE_DATA_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error("课程数据加载失败");
  courseCache = await res.json();
  return courseCache;
}

let syllabusCache = null;
async function loadSyllabus() {
  if (syllabusCache) return syllabusCache;
  const res = await fetch(SYLLABUS_DATA_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error("课程大纲加载失败");
  syllabusCache = await res.json();
  return syllabusCache;
}

let lessonsCache = null;
async function loadLessons() {
  if (lessonsCache) return lessonsCache;
  const res = await fetch(LESSONS_DATA_URL, { cache: "no-cache" });
  if (!res.ok) throw new Error("教材数据加载失败");
  lessonsCache = await res.json();
  return lessonsCache;
}

/* ---------- 公共顶栏 ---------- */
function renderTopbar(active) {
  const el = $("#topbar");
  if (!el) return;
  const links = [
    ["index.html", "首页", "home"],
    ["syllabus.html", "课程大纲", "syllabus"],
    ["lessons.html", "教材同步", "lessons"],
    ["chapters.html", "专题精讲", "chapters"],
    ["mindmap.html", "思维导图", "mindmap"],
    ["search.html", "资料检索", "search"]
  ];
  el.innerHTML = `
    <div class="container">
      <a class="brand" href="index.html">
        <span class="brand-mark">A</span>
        <span>AI Agent 全能开发</span>
      </a>
      <nav class="nav-links">
        ${links.map(([href, text, key]) =>
          `<a href="${href}" class="${active === key ? "active" : ""}">${text}</a>`).join("")}
      </nav>
    </div>`;
}

/* ============================================================
 * 思维导图渲染器
 * 结构：根节点 → 一级分支 → 二级叶子节点
 * 特点：每个节点都可点击，用于跳转到对应知识点
 * ============================================================ */
function renderMindmap(svg, { root, branches, compact = false }) {
  const ROW = compact ? 30 : 34;
  const GAP = compact ? 10 : 14;
  const COL = compact ? [8, 178, 388] : [8, 214, 470];
  const W_ROOT = compact ? 156 : 190;
  const W_NODE = compact ? 196 : 238;
  const H = compact ? 22 : 26;

  let cursor = 10;
  branches.forEach((b) => {
    b._h = Math.max(1, b.children?.length || 1) * ROW;
    b._cy = cursor + b._h / 2;
    cursor += b._h + GAP;
  });
  const height = Math.max(cursor + 4, 160);
  const rootCy = height / 2;
  const width = compact ? 600 : 720;

  const palette = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed"];

  let out = `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="知识思维导图">`;

  // 根节点
  out += `
    <g class="mm-node" data-href="${esc(root.href || "")}">
      <rect x="${COL[0]}" y="${rootCy - 22}" rx="10" ry="10" width="${W_ROOT}" height="44"
            fill="#0f172a" stroke="#0f172a" />
      <text x="${COL[0] + W_ROOT / 2}" y="${rootCy + 5}" text-anchor="middle"
            font-size="13" font-weight="700" fill="#ffffff">${esc(truncate(root.text, compact ? 10 : 14))}</text>
    </g>`;

  branches.forEach((b, i) => {
    const color = palette[i % palette.length];
    const bx = COL[1];
    const by = b._cy - H / 2;

    // 曲线连接：根 → 分支
    const x1 = COL[0] + W_ROOT, y1 = rootCy;
    const x2 = bx, y2 = b._cy;
    out += `<path d="M${x1},${y1} C${x1 + 50},${y1} ${x2 - 50},${y2} ${x2},${y2}"
              fill="none" stroke="${color}" stroke-opacity="0.45" stroke-width="1.6" />`;

    // 分支节点
    out += `
      <g class="mm-node" data-href="${esc(b.href || "")}">
        <rect x="${bx}" y="${by}" rx="9" ry="9" width="${W_NODE}" height="${H}"
              fill="#ffffff" stroke="${color}" stroke-width="1.4" />
        <rect x="${bx}" y="${by}" rx="9" ry="9" width="5" height="${H}" fill="${color}" />
        <text x="${bx + 14}" y="${b._cy + 4}" font-size="${compact ? 12 : 12.5}" font-weight="600"
              fill="#0f172a">${esc(truncate(b.text, compact ? 12 : 15))}</text>
      </g>`;

    const children = b.children || [];
    const startY = b._cy - (children.length * ROW) / 2 + ROW / 2;
    children.forEach((c, j) => {
      const cy = startY + j * ROW;
      const cx = COL[2];
      const lx1 = bx + W_NODE, ly1 = b._cy;
      out += `<path d="M${lx1},${ly1} C${lx1 + 30},${ly1} ${cx - 24},${cy} ${cx},${cy}"
                fill="none" stroke="${color}" stroke-opacity="0.3" stroke-width="1.3" />`;
      out += `
        <g class="mm-node" data-href="${esc(c.href || "")}">
          <rect x="${cx}" y="${cy - H / 2 + 1}" rx="7" ry="7" width="${W_NODE - 30}" height="${H - 2}"
                fill="#f8fafc" stroke="#e2e8f0" />
          <circle cx="${cx + 11}" cy="${cy}" r="3" fill="${color}" />
          <text x="${cx + 21}" y="${cy + 4}" font-size="11.5" fill="#334155">${esc(truncate(c.text, compact ? 11 : 13))}</text>
        </g>`;
    });
  });

  out += `</svg>`;
  svg.innerHTML = out;

  // 节点点击跳转
  $$(".mm-node", svg).forEach((node) => {
    node.addEventListener("click", () => {
      const href = node.getAttribute("data-href");
      if (href) window.location.href = href;
    });
  });
}

/* ============================================================
 * Markdown 渲染与后处理
 * ============================================================ */
function slugify(text, used) {
  let base = text.trim().toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!base) base = "section";
  let id = base, n = 2;
  while (used.has(id)) { id = `${base}-${n++}`; }
  used.add(id);
  return id;
}

/* 读取地址栏锚点：浏览器会把中文锚点编码成 %XX，需要解码后再查找元素 */
function readHashAnchor() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return "";
  try { return decodeURIComponent(raw); } catch (e) { return raw; }
}

function renderMarkdown(mdText, container) {
  const html = marked.parse(mdText, { gfm: true, breaks: false });
  container.innerHTML = html;

  // 为标题生成锚点 id
  const used = new Set();
  const headings = $$("h1, h2, h3, h4", container).filter((h) => h.tagName !== "H1");
  headings.forEach((h) => {
    const id = slugify(h.textContent, used);
    h.id = id;
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.className = "anchor-link";
    a.textContent = "#";
    a.style.cssText = "margin-left:8px;color:#cbd5e1;font-size:.8em;text-decoration:none";
    h.appendChild(a);
  });

  // 代码块：语法高亮 + 语言标签 + 复制按钮
  $$("pre > code", container).forEach((code) => {
    if (window.hljs) {
      try { hljs.highlightElement(code); } catch (e) { /* 忽略高亮失败 */ }
    }
  });
  $$("pre", container).forEach((pre) => {
    const code = pre.querySelector("code");
    const cls = code ? Array.from(code.classList).find((c) => c.startsWith("language-")) : null;
    const lang = cls ? cls.replace("language-", "") : "code";
    const wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const tag = document.createElement("span");
    tag.className = "code-tag";
    tag.textContent = lang;
    wrap.appendChild(tag);

    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "复制";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code ? code.innerText : "");
        btn.textContent = "已复制";
        setTimeout(() => (btn.textContent = "复制"), 1500);
      } catch (e) { btn.textContent = "失败"; }
    });
    wrap.appendChild(btn);
  });

  $$("img", container).forEach((img) => { img.loading = "lazy"; });

  return headings;
}

/* ---------- 从标题生成页内思维导图 ---------- */
function buildChapterMindmap(headings, svg) {
  const branches = [];
  headings.forEach((h) => {
    if (h.tagName === "H2") {
      branches.push({ text: h.textContent.replace(/#$/, ""), href: `#${h.id}`, children: [] });
    } else if (h.tagName === "H3" && branches.length) {
      branches[branches.length - 1].children.push({
        text: h.textContent.replace(/#$/, ""),
        href: `#${h.id}`
      });
    }
  });
  const rootText = $(".doc-head h1")?.textContent || "本章知识点";
  renderMindmap(svg, { root: { text: rootText, href: "#top" }, branches });
}

/* ---------- 目录与滚动高亮 ---------- */
function buildToc(headings, tocEl) {
  const items = headings.filter((h) => h.tagName === "H2" || h.tagName === "H3");
  tocEl.innerHTML = items.map((h) => `
    <li class="${h.tagName === "H3" ? "depth-3" : "depth-2"}">
      <a href="#${h.id}">${esc(h.textContent.replace(/#$/, ""))}</a>
    </li>`).join("");

  const links = $$("a", tocEl);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${id}`));
    });
  }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });

  items.forEach((h) => observer.observe(h));
}

/* ============================================================
 * 页面初始化
 * ============================================================ */
async function initHome() {
  const course = await loadCourse();
  const syl = await loadSyllabus();
  const grid = $("#chapter-grid");
  grid.innerHTML = course.chapters.map((c) => `
    <a class="chapter-card" href="chapter.html?id=${c.id}">
      <span class="no">CH ${c.no}</span>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.summary)}</p>
      <div class="meta">
        ${badgeHtml(c)}
        <span class="chip">${c.minutes} 分钟</span>
        ${c.tags.slice(0, 2).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
      </div>
    </a>`).join("");

  const road = $("#roadmap");
  road.innerHTML = course.chapters.map((c, i) => `
    <div class="road-item">
      <span class="dot">${i + 1}</span>
      <h4><a href="chapter.html?id=${c.id}">第 ${c.no} 章 · ${esc(c.title)}</a></h4>
      <p>${esc(c.summary)}</p>
    </div>`).join("");

  // 首页阶段卡片（大纲主线）
  const stageGrid = $("#home-stage-grid");
  if (stageGrid) {
    stageGrid.innerHTML = syl.stages.slice(0, 6).map((s) => `
      <a class="chapter-card" href="stage.html?id=${s.id}">
        <span class="no">阶段 ${s.no}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.subtitle)}</p>
        <div class="meta">${badgeHtml(s)}<span class="chip">${esc(s.weeks)}</span></div>
      </a>`).join("");
  }

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  const totalMin = course.chapters.reduce((s, c) => s + c.minutes, 0);
  const totalProjects = syl.stages.reduce((s, st) => s + st.projects.length, 0);
  setText("stat-stages", syl.stages.length);
  setText("stat-chapters", course.chapters.length);
  setText("stat-projects", totalProjects);
  setText("stat-hours", (totalMin / 60).toFixed(1));
}

async function initChaptersPage() {
  const course = await loadCourse();
  const grid = $("#all-chapters");
  const filters = $("#filters");
  const levels = ["全部", "入门", "进阶", "难点", "综合"];
  filters.innerHTML = levels.map((l, i) =>
    `<button class="filter ${i === 0 ? "on" : ""}" data-level="${l}">${l}</button>`).join("");

  const draw = (level) => {
    const list = level === "全部" ? course.chapters : course.chapters.filter((c) => c.difficulty === level);
    grid.innerHTML = list.map((c) => `
      <a class="chapter-card" href="chapter.html?id=${c.id}">
        <span class="no">CH ${c.no} · ${esc(c.module)}</span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.summary)}</p>
        <div class="meta">
          ${badgeHtml(c)}
          <span class="chip">${c.minutes} 分钟</span>
          ${c.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
        </div>
      </a>`).join("");
  };
  draw("全部");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    $$(".filter", filters).forEach((b) => b.classList.remove("on"));
    btn.classList.add("on");
    draw(btn.dataset.level);
  });
}

async function initChapterPage() {
  const course = await loadCourse();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || course.chapters[0].id;
  const index = course.chapters.findIndex((c) => c.id === id);
  if (index === -1) { window.location.href = "chapters.html"; return; }
  const chapter = course.chapters[index];

  // 侧边课程目录
  const side = $("#side-course");
  side.innerHTML = course.chapters.map((c) => `
    <li><a href="chapter.html?id=${c.id}" class="${c.id === id ? "active" : ""}">
      <span class="num">${c.no}</span><span>${esc(c.title)}</span>
    </a></li>`).join("");

  document.title = `${chapter.title} · AI Agent 全能开发实战`;

  const md = await (await fetch(`chapters/${id}.md`, { cache: "no-cache" })).text();
  const prose = $("#prose");
  const headings = renderMarkdown(md, prose);

  // 章节头部
  $("#doc-head").innerHTML = `
    <div class="crumb">第 ${chapter.no} 章 · ${esc(chapter.module)}模块</div>
    <h1>${esc(chapter.title)}</h1>
    <div class="meta">
      ${badgeHtml(chapter)}
      <span class="chip">建议 ${chapter.minutes} 分钟</span>
      ${chapter.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
    </div>`;

  buildChapterMindmap(headings, $("#chapter-mindmap"));
  buildToc(headings, $("#toc"));

  // 标注本章对应的大纲阶段，便于主线与专题互相跳转
  try {
    const syl = await loadSyllabus();
    const owner = syl.stages.find((s) => (s.related || []).includes(id));
    if (owner) {
      const row = document.createElement("div");
      row.className = "meta related-row";
      row.innerHTML = `<span class="related-label">对应大纲：</span>
        <a class="chip link" href="stage.html?id=${owner.id}">阶段${owner.no} · ${esc(owner.title)}</a>`;
      $("#doc-head").appendChild(row);
    }
  } catch (e) { /* 大纲数据缺失时不影响正文阅读 */ }

  // 上一篇 / 下一篇
  const prev = course.chapters[index - 1];
  const next = course.chapters[index + 1];
  $("#pager").innerHTML = `
    ${prev ? `<a href="chapter.html?id=${prev.id}"><small>上一篇</small>${esc(prev.title)}</a>` : `<span></span>`}
    ${next ? `<a class="next" href="chapter.html?id=${next.id}"><small>下一篇</small>${esc(next.title)}</a>` : `<a class="next" href="chapters.html"><small>完成</small>回到章节目录</a>`}`;

  // 支持 ?id=xx&anchor=yy 或直接 #hash
  const anchor = params.get("anchor") || readHashAnchor();
  if (anchor) {
    const target = document.getElementById(anchor);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "instant", block: "start" }), 120);
  }
  document.body.classList.add("ready");
}

async function initMindmapPage() {
  const course = await loadCourse();
  const modules = {};
  course.chapters.forEach((c) => {
    if (!modules[c.module]) modules[c.module] = [];
    modules[c.module].push(c);
  });

  const branches = Object.entries(modules).map(([mod, list]) => ({
    text: `${mod}模块`,
    href: "#",
    children: list.map((c) => ({
      text: `CH${c.no} ${c.title}`,
      href: `chapter.html?id=${c.id}`
    }))
  }));

  renderMindmap($("#global-mindmap"), {
    root: { text: "AI Agent 全能开发", href: "index.html" },
    branches
  }, {});
}

/* ============================================================
 * 资料检索页
 * 索引由 scripts/build_search_index.py 生成，
 * 锚点算法与上面的 slugify() 保持一致。
 * ============================================================ */
let searchIndexCache = null;

async function loadSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  const res = await fetch("data/search-index.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("检索索引加载失败");
  searchIndexCache = await res.json();
  return searchIndexCache;
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightTerms(text, tokens) {
  const safe = esc(text);
  if (!tokens.length) return safe;
  const re = new RegExp("(" + tokens.map(escapeRegExp).join("|") + ")", "gi");
  return safe.replace(re, "<mark>$1</mark>");
}

function matchSections(data, query) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const hits = [];

  data.items.forEach((item) => {
    const lesson = data.lessons[item.l] || {};
    const head = (item.h || "").toLowerCase();
    const body = (item.x || "").toLowerCase();
    const title = (lesson.t || "").toLowerCase();
    const tags = (lesson.tg || []).join(" ").toLowerCase();
    const group = (lesson.g || "").toLowerCase();
    const haystack = `${head} ${body} ${title} ${tags} ${group}`;
    if (!tokens.every((t) => haystack.includes(t))) return;

    let score = 0;
    tokens.forEach((t) => {
      if (head === t) score += 30;
      else if (head.includes(t)) score += 12;
      if (title.includes(t)) score += 6;
      if (tags.includes(t)) score += 5;
      if (group.includes(t)) score += 2;
      if (body.includes(t)) score += 2;
    });
    if (item.lv === 2) score += 2;
    hits.push({ item, lesson, score });
  });

  return hits.sort((a, b) =>
    b.score - a.score || a.item.h.length - b.item.h.length);
}

function buildSnippet(text, tokens, max = 150) {
  const src = String(text || "");
  if (!src) return "";
  let pos = -1;
  tokens.forEach((t) => {
    const i = src.toLowerCase().indexOf(t);
    if (i >= 0 && (pos < 0 || i < pos)) pos = i;
  });
  const start = pos > 50 ? pos - 40 : 0;
  let snippet = src.slice(start, start + max);
  if (start > 0) snippet = "…" + snippet;
  if (start + max < src.length) snippet += "…";
  return highlightTerms(snippet, tokens);
}

function renderSearchResults(container, meta, hits, tokens, query) {
  if (!query) {
    meta.textContent = `索引已加载，共 ${hits.total} 个知识点小节，输入关键词开始检索。`;
    container.innerHTML = `<div class="search-empty">试试搜索：HyDE、断崖截断、任务栈、条件边、Rerank</div>`;
    return;
  }
  if (!hits.length) {
    meta.textContent = "";
    container.innerHTML = `<div class="search-empty">没有找到与「${esc(query)}」相关的小节，试试换个关键词或减少关键词数量。</div>`;
    return;
  }
  meta.textContent = `找到 ${hits.length} 个相关小节`;
  container.innerHTML = hits.map(({ item, lesson }) => {
    const href = `lesson.html?id=${encodeURIComponent(item.l)}#${encodeURIComponent(item.a)}`;
    return `
      <a class="search-hit" href="${href}">
        <div class="search-hit-top">
          <span class="chip soft">${esc(lesson.g || "")}</span>
          <span class="search-lesson">${esc(lesson.t || "")}</span>
          <span class="search-lv">H${item.lv}</span>
        </div>
        <h3>${highlightTerms(item.h, tokens)}</h3>
        ${item.x ? `<p>${buildSnippet(item.x, tokens)}</p>` : ""}
        <span class="search-anchor">#${esc(item.a)}</span>
      </a>`;
  }).join("");
}

async function initSearchPage() {
  const form = $("#search-form");
  const input = $("#search-input");
  const container = $("#search-results");
  const meta = $("#search-meta");
  let data;
  try {
    data = await loadSearchIndex();
  } catch (err) {
    container.innerHTML = `<div class="search-empty">检索索引加载失败，请刷新重试。</div>`;
    return;
  }

  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";

  let timer = null;
  const run = () => {
    const query = input.value.trim();
    const hits = matchSections(data, query).slice(0, 80);
    hits.total = data.count;
    renderSearchResults(container, meta, hits, query.toLowerCase().split(/\s+/).filter(Boolean), query);
    const url = query ? `search.html?q=${encodeURIComponent(query)}` : "search.html";
    history.replaceState(null, "", url);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    run();
    input.blur();
  });
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, 160);
  });

  container.innerHTML = "";
  run();
}

/* ============================================================
 * 课程大纲页 / 阶段详情页
 * ============================================================ */
function stageCardHtml(s) {
  const moduleNames = s.modules.map((m) => m.name.replace(/^项目.*：/, "")).slice(0, 5);
  return `
    <a class="chapter-card" href="stage.html?id=${s.id}">
      <span class="no">阶段 ${s.no}</span>
      <h3>${esc(s.title)}</h3>
      <p class="stage-sub">${esc(s.subtitle)}</p>
      <p>${esc(s.summary)}</p>
      <div class="meta">
        ${badgeHtml(s)}
        <span class="chip">${esc(s.weeks)}</span>
        <span class="chip">${s.modules.length} 个模块</span>
        ${s.projects.length ? `<span class="chip">${s.projects.length} 个项目</span>` : ""}
      </div>
      <div class="meta module-chips">
        ${moduleNames.map((m) => `<span class="chip soft">${esc(m)}</span>`).join("")}
      </div>
    </a>`;
}

async function initSyllabusPage() {
  const data = await loadSyllabus();

  $("#syllabus-stats").innerHTML = `
    <div class="stat"><b>${data.stages.length}</b><span>教学阶段</span></div>
    <div class="stat"><b>${data.duration}</b><span>课程周期</span></div>
    <div class="stat"><b>${data.stages.reduce((n, s) => n + s.modules.length, 0)}</b><span>课程模块</span></div>
    <div class="stat"><b>${data.stages.reduce((n, s) => n + s.projects.length, 0)}</b><span>实战项目</span></div>`;

  $("#stage-list").innerHTML = data.stages.map(stageCardHtml).join("");

  // 大纲思维导图：阶段 → 核心模块
  renderMindmap($("#syllabus-mindmap"), {
    root: { text: "AI 全能开发", href: "syllabus.html" },
    branches: data.stages.map((s) => ({
      text: `阶段${s.no} ${s.title}`,
      href: `stage.html?id=${s.id}`,
      children: s.modules.slice(0, 3).map((m) => ({
        text: m.name.replace(/^项目.*：/, ""),
        href: `stage.html?id=${s.id}`
      }))
    }))
  }, { compact: true });
}

async function initStagePage() {
  const data = await loadSyllabus();
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || data.stages[0].id;
  const index = data.stages.findIndex((s) => s.id === id);
  if (index === -1) { window.location.href = "syllabus.html"; return; }
  const stage = data.stages[index];

  // 侧边阶段列表
  $("#side-stage").innerHTML = data.stages.map((s) => `
    <li><a href="stage.html?id=${s.id}" class="${s.id === id ? "active" : ""}">
      <span class="num">${s.no}</span><span>${esc(s.title)}</span>
    </a></li>`).join("");

  document.title = `阶段${stage.no} ${stage.title} · AI Agent 全能开发实战`;

  // 关联的专题精讲章节
  let relatedHtml = "";
  if (stage.related && stage.related.length) {
    const course = await loadCourse();
    const links = stage.related
      .map((cid) => course.chapters.find((c) => c.id === cid))
      .filter(Boolean)
      .map((c) => `<a class="chip link" href="chapter.html?id=${c.id}">专题 · ${esc(c.title)}</a>`)
      .join("");
    relatedHtml = `<div class="meta related-row"><span class="related-label">配套专题精讲：</span>${links}</div>`;
  }

  $("#stage-head").innerHTML = `
    <div class="crumb">课程大纲 · 第 ${stage.no} 阶段（${esc(stage.weeks)}）</div>
    <h1>${esc(stage.title)}</h1>
    <p class="stage-sub">${esc(stage.subtitle)}</p>
    <div class="meta">
      ${badgeHtml(stage)}
      <span class="chip">${stage.modules.length} 个模块</span>
      ${stage.exam ? `<span class="chip">${esc(stage.exam)}</span>` : ""}
    </div>
    ${relatedHtml}`;

  const md = await (await fetch(`stages/${id}.md`, { cache: "no-cache" })).text();
  const headings = renderMarkdown(md, $("#stage-prose"));
  buildChapterMindmap(headings, $("#stage-mindmap"));
  buildToc(headings, $("#stage-toc"));

  const prev = data.stages[index - 1];
  const next = data.stages[index + 1];
  $("#stage-pager").innerHTML = `
    ${prev ? `<a href="stage.html?id=${prev.id}"><small>上一阶段</small>阶段${prev.no} ${esc(prev.title)}</a>` : `<a href="syllabus.html"><small>返回</small>课程大纲</a>`}
    ${next ? `<a class="next" href="stage.html?id=${next.id}"><small>下一阶段</small>阶段${next.no} ${esc(next.title)}</a>` : `<a class="next" href="mindmap.html"><small>完成</small>查看知识思维导图</a>`}`;
}

/* ============================================================
 * 教材同步：列表页 / 详情页
 * 内容来自课程原始课件，保留原文结构、代码、表格与截图
 * ============================================================ */
function lessonFlatList(data) {
  const flat = [];
  data.groups.forEach((g) => g.items.forEach((it) => flat.push({ ...it, group: g })));
  return flat;
}

async function initLessonsPage() {
  const data = await loadLessons();
  const flat = lessonFlatList(data);
  const totalMin = flat.reduce((s, i) => s + i.minutes, 0);

  $("#lesson-stats").innerHTML = `
    <div class="stat"><b>${data.groups.length}</b><span>教材分组</span></div>
    <div class="stat"><b>${flat.length}</b><span>同步篇章</span></div>
    <div class="stat"><b>${Math.round(totalMin / 60)}</b><span>预计学时</span></div>
    <div class="stat"><b>100%</b><span>保留原始课件</span></div>`;

  $("#lesson-groups").innerHTML = data.groups.map((g) => `
    <section class="lesson-group" id="group-${esc(g.id)}">
      <div class="group-head">
        <div class="group-title">
          <h3>${esc(g.name)}</h3>
          <p>${esc(g.desc)}</p>
        </div>
        <span class="chip soft">来源：${esc(g.source)}</span>
      </div>
      <div class="grid cols-3">
        ${g.items.map((it) => `
          <a class="chapter-card" href="lesson.html?id=${esc(it.id)}">
            <span class="no">${esc(g.name)} · ${esc(it.no)}</span>
            <h3>${esc(it.title)}</h3>
            <div class="meta">
              <span class="chip">${it.minutes} 分钟</span>
              ${it.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
            </div>
          </a>`).join("")}
      </div>
    </section>`).join("");
}

/* 基于本篇真实目录生成学习路径与重点关注（不是模板套话） */
function buildLessonGuide(headings, mdText, target) {
  if (!target) return;
  const tops = headings.filter((h) => h.tagName === "H2");
  const subs = headings.filter((h) => h.tagName === "H3");
  const codeCount = Math.floor((mdText.match(/^```/gm) || []).length / 2);
  const hotRe = /(注意|区别|为什么|原理|错误|异常|陷阱|坑|难点|重点|对比|容易混淆)/;
  const hot = headings
    .filter((h) => hotRe.test(h.textContent))
    .slice(0, 5)
    .map((h) => `<li><a href="#${h.id}">${esc(h.textContent.replace(/#$/, ""))}</a></li>`)
    .join("");

  const steps = tops.slice(0, 4).map((h) =>
    `<li><b>${esc(h.textContent.replace(/#$/, ""))}</b>先读原文讲解，再对照下面的示例亲手敲一遍。</li>`
  ).join("");

  target.innerHTML = `
    <div class="callout path">
      <span class="tag">本篇学习路径</span>
      <p>本篇共 <b>${tops.length}</b> 个一级知识点、<b>${subs.length}</b> 个细分小节、<b>${codeCount}</b> 段示例代码。建议按下面的顺序推进：</p>
      <ol class="path-steps">${steps || "<li><b>通读全文</b>先建立整体印象，再回到代码逐段运行。</li>"}</ol>
    </div>
    ${hot ? `<div class="callout warn">
      <span class="tag">容易卡住的点</span>
      <p>标题里出现「注意 / 区别 / 原理 / 异常」等字样的位置，通常是考试和实际开发中最容易出问题的地方，建议重点看：</p>
      <ul>${hot}</ul>
    </div>` : ""}`;
}

async function initLessonPage() {
  const data = await loadLessons();
  const flat = lessonFlatList(data);
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || flat[0].id;
  const index = flat.findIndex((x) => x.id === id);
  if (index === -1) { window.location.href = "lessons.html"; return; }

  const cur = flat[index];
  const group = cur.group;

  // 左侧：同组教材
  const nameEl = $("#side-group-name");
  if (nameEl) nameEl.textContent = group.name;
  $("#side-lesson").innerHTML = group.items.map((it) => `
    <li><a href="lesson.html?id=${esc(it.id)}" class="${it.id === id ? "active" : ""}">
      <span class="num">${esc(it.no)}</span><span>${esc(it.title)}</span>
    </a></li>`).join("");

  document.title = `${cur.title} · ${group.name} · 教材同步`;

  $("#doc-head").innerHTML = `
    <div class="crumb">教材同步 · ${esc(group.name)}</div>
    <h1>${esc(cur.title)}</h1>
    <div class="meta">
      <span class="chip">建议 ${cur.minutes} 分钟</span>
      ${cur.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join("")}
    </div>
    <div class="meta related-row">
      <span class="related-label">来源课件：</span>
      <span class="chip soft">${esc(group.source)}</span>
      <a class="chip link" href="lessons.html">教材目录</a>
    </div>`;

  const res = await fetch(cur.file, { cache: "no-cache" });
  if (!res.ok) throw new Error(`教材文件加载失败：${cur.file}`);
  const md = await res.text();
  const headings = renderMarkdown(md, $("#prose"));

  buildLessonGuide(headings, md, $("#lesson-guide"));
  buildChapterMindmap(headings, $("#lesson-mindmap"));
  buildToc(headings, $("#toc"));

  const prev = flat[index - 1];
  const next = flat[index + 1];
  $("#pager").innerHTML = `
    ${prev ? `<a href="lesson.html?id=${esc(prev.id)}"><small>上一篇</small>${esc(prev.title)}</a>` : `<a href="lessons.html"><small>返回</small>教材目录</a>`}
    ${next ? `<a class="next" href="lesson.html?id=${esc(next.id)}"><small>下一篇</small>${esc(next.title)}</a>` : `<a class="next" href="chapters.html"><small>完成</small>去看专题精讲</a>`}`;

  const anchor = params.get("anchor") || readHashAnchor();
  if (anchor) {
    const target = document.getElementById(anchor);
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "instant", block: "start" }), 120);
  }
  document.body.classList.add("ready");
}

/* ---------- 入口 ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  renderTopbar(page);
  try {
    if (page === "home") await initHome();
    else if (page === "chapters") await initChaptersPage();
    else if (page === "chapter") await initChapterPage();
    else if (page === "lessons") await initLessonsPage();
    else if (page === "lesson") await initLessonPage();
    else if (page === "mindmap") await initMindmapPage();
    else if (page === "syllabus") await initSyllabusPage();
    else if (page === "stage") await initStagePage();
    else if (page === "search") await initSearchPage();
  } catch (err) {
    console.error(err);
    const target = $("#prose") || $("#chapter-grid") || $("#all-chapters") || $("#global-mindmap");
    if (target) target.innerHTML = `<div class="loading">内容加载失败：${esc(err.message)}<br>请刷新页面重试。</div>`;
  }
});
