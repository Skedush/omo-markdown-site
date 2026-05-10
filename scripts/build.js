const fs = require('fs');
const path = require('path');

const matter = require('gray-matter');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'template', 'page.html');
const OUTPUT_DIR = path.join(ROOT_DIR, 'docs');
const MENU_PATH = path.join(OUTPUT_DIR, 'menu.json');

const watchMode = process.argv.includes('--watch');

function walkDir(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    console.warn(`Directory does not exist: ${dir}`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseMarkdown(content) {
  const { data, content: body } = matter(content);
  return { data, content: body };
}

function extractTitle(markdownContent) {
  const h1Match = markdownContent.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1].trim() : null;
}

function generateMenu(files) {
  const sections = {};

  for (const file of files) {
    const relativePath = path.relative(SRC_DIR, file.filepath);
    const parts = relativePath.split(path.sep);

    if (parts.length === 1) {
      continue;
    }

    const dir = parts[0];
    const htmlPath = relativePath.replace(/\.md$/, '.html');

    if (!sections[dir]) {
      sections[dir] = {
        title: dir.charAt(0).toUpperCase() + dir.slice(1),
        path: dir + '/',
        children: []
      };
    }

    sections[dir].children.push({
      title: file.title,
      path: htmlPath,
      order: file.order || 999
    });
  }

  const items = Object.values(sections).sort((a, b) => a.path.localeCompare(b.path));

  for (const section of items) {
    section.children.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.title.localeCompare(b.title);
    });
    delete section.order;
  }

  return { items };
}

function renderTemplate(title, content, menu) {
  let template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  template = template.replace(/\{\{\{title\}\}\}/g, title);
  template = template.replace(/\{\{\{content\}\}\}/g, content);
  template = template.replace('{{{menu}}}', JSON.stringify(menu));

  return template;
}

function createMarkdownIt() {
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && prism_langs[lang]) {
        try {
          return '<pre class="language-' + lang + '"><code class="language-' + lang + '">' +
            md.utils.escapeHtml(str) +
            '</code></pre>';
        } catch (__) {}
      }
      return '<pre class="language-text"><code class="language-text">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  });

  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
    slugify: s => s.toLowerCase().replace(/[^\w]+/g, '-')
  });

  return md;
}

const prism_langs = {
  javascript: true, js: true, typescript: true, ts: true,
  python: true, py: true, bash: true, sh: true, shell: true,
  json: true, html: true, css: true, markdown: true, md: true,
  yaml: true, yml: true
};

function build() {
  console.log('Starting build...');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const mdFiles = walkDir(SRC_DIR);
  console.log(`Found ${mdFiles.length} markdown files`);

  const md = createMarkdownIt();
  const files = [];
  const fileContents = [];

  for (const filepath of mdFiles) {
    const relativePath = path.relative(SRC_DIR, filepath);
    const outputPath = path.join(OUTPUT_DIR, relativePath.replace(/\.md$/, '.html'));

    const rawContent = fs.readFileSync(filepath, 'utf8');
    const { data, content: body } = parseMarkdown(rawContent);

    if (data.hidden === true) {
      console.log(`Skipping hidden file: ${relativePath}`);
      continue;
    }

    let title = data.title || extractTitle(body) || path.basename(filepath, '.md');
    const htmlContent = md.render(body);

    fileContents.push({
      outputPath,
      title,
      htmlContent,
      relativePath
    });

    files.push({
      filepath: filepath,
      title: title,
      order: data.order || 999
    });
  }

  const menu = generateMenu(files);
  fs.writeFileSync(MENU_PATH, JSON.stringify(menu, null, 2));
  console.log(`Menu written to: ${MENU_PATH}`);

  for (const file of fileContents) {
    const outputDir = path.dirname(file.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputHtml = renderTemplate(file.title, file.htmlContent, menu);
    fs.writeFileSync(file.outputPath, outputHtml);
    console.log(`Built: ${file.relativePath} -> ${path.relative(OUTPUT_DIR, file.outputPath)}`);
  }

  console.log('Build complete!');
}

function watch() {
  console.log('Starting watch mode...');

  build();

  fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.md')) {
      console.log(`\nChange detected: ${filename}`);
      build();
    }
  });

  fs.watch(TEMPLATE_PATH, () => {
    console.log(`\nTemplate changed, rebuilding...`);
    build();
  });

  process.on('SIGINT', () => {
    console.log('\nStopping watch mode...');
    process.exit(0);
  });
}

if (watchMode) {
  watch();
} else {
  build();
}