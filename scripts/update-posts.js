// 自动扫描 posts 文件夹并更新 index.json
// 运行方式: node scripts/update-posts.js

const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'posts');
const indexFile = path.join(postsDir, 'index.json');

// 读取所有 .md 文件
const files = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .sort()
  .reverse(); // 按日期倒序（文件名以日期开头）

// 写入 index.json
fs.writeFileSync(indexFile, JSON.stringify(files, null, 2));

console.log(`✅ 已更新 posts/index.json，共 ${files.length} 篇文章：`);
files.forEach(f => console.log(`   - ${f}`));
