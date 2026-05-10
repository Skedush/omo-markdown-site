---
title: 配置
order: 2
---

# 配置

了解如何配置你的文档站点。

## 基本配置

在 `package.json` 中可以修改项目名称和版本。

## 目录结构

```
src/           # Markdown 源文件
template/      # HTML 模板
scripts/       # 构建脚本
docs/          # 编译输出
```

## 部署

push 到 GitHub 后，GitHub Actions 会自动编译并部署到 GitHub Pages。
