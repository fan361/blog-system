// 博客核心逻辑 - 加载和渲染 Markdown 文章

// 文章列表（从 index.json 动态加载）
let POSTS = [];

// 加载文章列表
async function loadPostsList() {
  try {
    const response = await fetch('posts/index.json');
    const files = await response.json();
    POSTS = files.map(f => `posts/${f}`);
    return POSTS;
  } catch (e) {
    console.error('Failed to load posts index:', e);
    return [];
  }
}

// 解析 Markdown front matter
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content };
  
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      meta[key.trim()] = values.join(':').trim();
    }
  });
  
  return { meta, content: match[2] };
}

// 简单的 Markdown 转 HTML
function markdownToHtml(md) {
  return md
    // 代码块 - 保留语言标识
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const langClass = lang ? `language-${lang}` : '';
      return `<pre><code class="${langClass}">${escapeHtml(code.trim())}</code></pre>`;
    })
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 标题
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // 引用块
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // 无序列表
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    // 有序列表
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    // 水平线
    .replace(/^---$/gm, '<hr>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // 段落 - 双换行变段落
    .replace(/\n\n+/g, '</p><p>')
    // 单换行变 br（在列表外）
    .replace(/([^>])\n([^<])/g, '$1<br>$2')
    // 包装成段落
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith('<')) return match;
      return match;
    });
}

// HTML 转义，防止 XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 加载单篇文章
async function loadPost(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const text = await response.text();
    return parseFrontMatter(text);
  } catch (e) {
    console.error('Failed to load post:', path, e);
    return null;
  }
}

// 加载所有文章
async function loadAllPosts() {
  if (POSTS.length === 0) {
    await loadPostsList();
  }
  const posts = await Promise.all(POSTS.map(loadPost));
  return posts.filter(p => p !== null);
}

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

// 获取标签颜色
function getTagColor(tag) {
  const colors = {
    '精选': 'bg-purple-100 text-purple-700',
    '技术': 'bg-blue-100 text-blue-700',
    '设计': 'bg-pink-100 text-pink-700',
    '生活': 'bg-teal-100 text-teal-700',
    '效率': 'bg-orange-100 text-orange-700',
    'AI': 'bg-sky-100 text-sky-700',
    '思考': 'bg-indigo-100 text-indigo-700'
  };
  return colors[tag] || 'bg-slate-100 text-slate-700';
}

// 生成卡片封面 HTML（支持图片或渐变色 fallback）
function renderCover(meta, aspectClass = 'aspect-[4/3]') {
  const hasCover = meta.cover && meta.cover.trim() !== '';
  
  if (hasCover) {
    return `
      <div class="${aspectClass} relative overflow-hidden">
        <img src="${meta.cover}" alt="${meta.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>
    `;
  } else {
    // 使用渐变色 fallback
    const gradient = meta.color || 'from-slate-400 to-slate-500';
    return `
      <div class="${aspectClass} bg-gradient-to-br ${gradient} relative overflow-hidden">
        <div class="absolute inset-0 bg-black/10"></div>
      </div>
    `;
  }
}

// 生成精选卡片 HTML
function renderFeaturedCard(post, path, delayClass = '') {
  const { meta } = post;
  const cover = renderCover(meta, 'aspect-[4/3]');
  
  return `
    <a href="article.html?post=${path}" class="group bg-white rounded-2xl overflow-hidden shadow-lg card-3d cursor-pointer reveal ${delayClass} block">
      ${cover}
      <div class="absolute bottom-4 left-4 z-10">
        <span class="px-3 py-1 bg-white/90 ${getTagColor(meta.tag).replace('bg-', 'text-').split(' ')[1]} text-xs font-semibold rounded-full">${meta.tag}</span>
      </div>
      <div class="p-5">
        <p class="text-slate-400 text-sm mb-2">${formatDate(meta.date)} · ${meta.readTime}分钟</p>
        <h3 class="font-serif text-lg font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2">
          ${meta.title}
        </h3>
      </div>
    </a>
  `;
}

// 生成文章列表卡片 HTML
function renderArticleCard(post, path, delayClass = '') {
  const { meta } = post;
  const hasCover = meta.cover && meta.cover.trim() !== '';
  const gradient = meta.color || 'from-slate-400 to-slate-500';
  
  const coverHtml = hasCover 
    ? `<img src="${meta.cover}" alt="${meta.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">`
    : '';
  
  const bgClass = hasCover ? '' : `bg-gradient-to-br ${gradient}`;
  
  return `
    <a href="article.html?post=${path}" class="group bg-slate-50 rounded-xl overflow-hidden card-3d cursor-pointer border border-slate-100 reveal ${delayClass} block">
      <div class="aspect-[3/2] ${bgClass} relative overflow-hidden">
        ${coverHtml}
        <div class="absolute bottom-3 left-3 z-10">
          <span class="px-2 py-1 bg-white/90 ${getTagColor(meta.tag).replace('bg-', 'text-').split(' ')[1]} text-xs font-semibold rounded-full">${meta.tag}</span>
        </div>
      </div>
      <div class="p-4">
        <p class="text-slate-400 text-xs mb-1">${formatDate(meta.date)}</p>
        <h3 class="font-serif text-base font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2">
          ${meta.title}
        </h3>
      </div>
    </a>
  `;
}

// 导出供页面使用
window.BlogEngine = {
  loadPostsList,
  loadAllPosts,
  loadPost,
  markdownToHtml,
  formatDate,
  getTagColor,
  renderCover,
  renderFeaturedCard,
  renderArticleCard,
  get POSTS() { return POSTS; }
};
