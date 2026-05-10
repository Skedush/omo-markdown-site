# Markdown 静态文档站点生成器 — 实现计划

**日期**：2026-05-10
**基于**：2026-05-10-markdown-static-site-design.md

---

## 文件结构

```
omo/
├── src/                          # Markdown 源文件
│   ├── index.md
│   ├── guide/
│   │   ├── getting-started.md
│   │   └── configuration.md
│   └── api/
│       └── reference.md
├── scripts/
│   └── build.js                  # 编译脚本（核心逻辑）
├── template/
│   └── page.html                 # HTML 模板
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions
├── docs/                         # 编译输出（部署用）
├── package.json
└── SPEC.md                       # 设计文档（复制）
```

---

## 任务分解

### 任务 1：初始化项目结构
- 创建目录结构
- 创建 package.json（dependencies: markdown-it, gray-matter）
- 复制 SPEC.md 到根目录

### 任务 2：创建 HTML 模板
- Tailwind CSS v4 CDN
- 深色极客主题样式
- Prism.js 代码高亮
- 侧边栏容器 + 主内容区
- 菜单 JSON 嵌入脚本

### 任务 3：创建 markdown-it 编译脚本
- 递归读取 src/ 目录
- 解析 front matter
- markdown-it 配置（代码高亮、锚点、表格）
- 渲染 HTML 并输出到 docs/

### 任务 4：创建菜单生成逻辑
- 遍历 src/ 目录结构
- 提取每个 md 的 h1 标题
- 按 order 排序
- 生成 menu.json

### 任务 5：创建 GitHub Actions workflow
- push 到 main 时触发
- checkout → npm install → node build.js
- 自动 commit docs/ 目录

### 任务 6：创建示例文件并测试
- 创建示例 md 文件
- 运行编译
- 验证输出

---

## 技术要点

- markdown-it 配置：highlight、anchor、table
- front matter 解析：title、order、hidden
- 目录遍历：fs.readdirSync 递归
- 模板渲染：正则替换
