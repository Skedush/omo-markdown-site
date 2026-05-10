---
title: API 参考
order: 1
---

# API 参考

本文档提供完整的 API 参考。

## build.js

构建脚本，负责将 Markdown 编译为 HTML。

### 函数

| 函数 | 描述 |
|------|------|
| `walkDir()` | 递归遍历目录 |
| `parseMarkdown()` | 解析 front matter |
| `generateMenu()` | 生成菜单结构 |

## front matter 字段

```yaml
---
title: 页面标题     # 菜单显示名称
order: 1           # 排序顺序
hidden: false      # 是否隐藏
---
```
