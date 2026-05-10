# Markdown 静态文档站点生成器 — 设计文档

**日期**：2026-05-10
**方案**：A（Node.js + markdown-it）

---

## 1. 项目概述

### 目标
本地编辑 Markdown 文件，push 到 GitHub 时自动编译生成静态 HTML 网站，并根据文件目录结构生成侧边栏导航菜单。

### 技术栈
- **Node.js**（构建脚本）
- **markdown-it**（MD → HTML 编译）
- **gray-matter**（提取 front matter）
- **GitHub Actions**（CI/CD 自动构建）

---

## 2. 功能需求

### 2.1 Markdown 编译
- 读取 `src/` 目录下的所有 `.md` 文件
- 解析 front matter（标题、顺序、是否隐藏）
- 编译为 HTML，保留基本样式（代码高亮、表格、图片）
- 输出到 `docs/` 目录，保持目录结构

### 2.2 菜单生成
- **层级一**：目录结构 → 顶级菜单（如 `guide/`、`api/`）
- **层级二**：每个 md 文件的 `h1` 标题 → 子菜单
- 菜单数据以 JSON 形式嵌入或独立文件输出
- 支持隐藏特定页面（front matter `hidden: true`）

### 2.3 front matter 字段
```yaml
---
title: 页面标题        # 菜单显示名称，不写则用文件名
order: 1              # 同级排序，数字越小越靠前
hidden: false         # 是否在菜单中隐藏
---
```

### 2.4 GitHub Actions
- 触发条件：`push` 到 `main` 分支
- 步骤：checkout → npm install → node build.js → commit & push 到 `docs/` 目录
- 不需要额外 secrets

---

## 3. 目录结构

```
project/
├── src/                      # 源码 Markdown 文件
│   ├── index.md
│   ├── guide/
│   │   ├── getting-started.md
│   │   └── configuration.md
│   └── api/
│       └── reference.md
├── scripts/
│   └── build.js              # 编译脚本
├── template/
│   └── page.html             # HTML 模板
├── docs/                     # 编译输出目录（部署用）
│   ├── index.html
│   ├── guide/
│   │   ├── getting-started.html
│   │   └── configuration.html
│   └── api/
│       └── reference.html
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 配置
├── package.json
└── SPEC.md                   # 本文档
```

---

## 4. 菜单数据结构

编译后生成 `docs/menu.json`：

```json
{
  "items": [
    {
      "title": "指南",
      "path": "guide/",
      "children": [
        { "title": "快速开始", "path": "guide/getting-started.html" },
        { "title": "配置", "path": "guide/configuration.html" }
      ]
    },
    {
      "title": "API",
      "path": "api/",
      "children": [
        { "title": "参考", "path": "api/reference.html" }
      ]
    }
  ]
}
```

---

## 5. HTML 模板结构

每个生成的 HTML 包含：
- 完整 `<head>`（UTF-8、标题、基础样式）
- 侧边栏容器（渲染 menu.json）
- 主内容区（编译后的 HTML）
- 基础响应式 CSS（菜单折叠）

---

## 6. 样式方案

- **Tailwind CSS v4**（CDN 引入，无需构建）
- **主题**：深色极客风格 — 深灰/近黑背景，高对比度文字，绿色/蓝色点缀
- **代码高亮**：Prism.js + 暗色主题
- **图片**：相对路径直接引用，无需复制

---

## 7. GitHub Actions 工作流

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: node scripts/build.js
      - uses: actions/commit-and-push-results@v4
        with:
          directory: docs
          branch: main
```

---

## 7. 待定细节

- [ ] 样式主题（使用已有的文档 CSS 还是自定义？）
- [ ] 是否需要代码高亮主题选择？
- [ ] 图片处理策略（相对路径还是复制到 docs/）？
