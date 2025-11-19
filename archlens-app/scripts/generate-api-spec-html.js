const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 id="$1">$1</h4>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || 'text';
    return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
  
  // Wrap consecutive list items in ul/ol
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>' + match + '</ul>';
  });
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  
  // Paragraphs (lines that aren't already HTML)
  html = html.split('\n').map(line => {
    if (line.trim() && !line.match(/^<[h|u|o|l|p|d|h]/) && !line.match(/^<\/[h|u|o|l|p|d|h]/) && !line.match(/^<code/) && !line.match(/^<\/code/) && !line.match(/^<pre/) && !line.match(/^<\/pre/)) {
      return `<p>${line}</p>`;
    }
    return line;
  }).join('\n');
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<[h|u|o|l|p|d|h])/g, '$1');
  html = html.replace(/(<\/[h|u|o|l|p|d|h]>)<\/p>/g, '$1');
  
  // Fix list wrapping
  html = html.replace(/<\/li>\n<li>/g, '</li><li>');
  
  return html;
}

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

function generateId(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Enhanced markdown to HTML with better parsing
function convertMarkdownToHtml(markdown) {
  const lines = markdown.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent = [];
  let inList = false;
  let listType = 'ul';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        html += `<pre><code class="language-${codeBlockLang}">${escapeHtml(codeBlockContent.join('\n'))}</code></pre>\n`;
        codeBlockContent = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeBlockLang = trimmed.substring(3).trim() || 'text';
      }
      continue;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Headers
    if (trimmed.startsWith('#### ')) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      const text = trimmed.substring(5);
      const id = generateId(text);
      html += `<h4 id="${id}">${text}</h4>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      const text = trimmed.substring(4);
      const id = generateId(text);
      html += `<h3 id="${id}">${text}</h3>\n`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      const text = trimmed.substring(3);
      const id = generateId(text);
      html += `<h2 id="${id}">${text}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      const text = trimmed.substring(2);
      html += `<h1>${text}</h1>\n`;
      continue;
    }
    
    // Horizontal rules
    if (trimmed === '---') {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      html += '<hr>\n';
      continue;
    }
    
    // Lists
    if (trimmed.match(/^[-*] /)) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
        listType = 'ul';
      }
      const content = trimmed.substring(2);
      html += `<li>${processInlineMarkdown(content)}</li>\n`;
      continue;
    }
    
    if (trimmed.match(/^\d+\. /)) {
      if (!inList) {
        html += '<ol>\n';
        inList = true;
        listType = 'ol';
      } else if (listType === 'ul') {
        html += '</ul>\n<ol>\n';
        listType = 'ol';
      }
      const content = trimmed.replace(/^\d+\. /, '');
      html += `<li>${processInlineMarkdown(content)}</li>\n`;
      continue;
    }
    
    // End list
    if (inList && trimmed === '') {
      html += `</${listType}>\n`;
      inList = false;
      listType = 'ul';
      continue;
    }
    
    // Regular paragraphs
    if (trimmed) {
      if (inList) { html += `</${listType}>\n`; inList = false; }
      html += `<p>${processInlineMarkdown(trimmed)}</p>\n`;
    } else {
      html += '\n';
    }
  }
  
  if (inList) {
    html += `</${listType}>\n`;
  }
  
  return html;
}

function processInlineMarkdown(text) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Emojis (keep as is)
  return text;
}

// Read the markdown file
const markdownPath = path.join(__dirname, '..', 'API_SPECIFICATION.md');
const markdown = fs.readFileSync(markdownPath, 'utf8');

// Convert to HTML
const content = convertMarkdownToHtml(markdown);

// Generate HTML document with styling
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ArchLens API Specification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .content {
            padding: 2rem;
        }
        
        h1 {
            color: #667eea;
            font-size: 2rem;
            margin: 2rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 3px solid #667eea;
        }
        
        h2 {
            color: #764ba2;
            font-size: 1.75rem;
            margin: 2rem 0 1rem;
            padding-top: 1rem;
            scroll-margin-top: 80px;
        }
        
        h3 {
            color: #555;
            font-size: 1.5rem;
            margin: 1.5rem 0 1rem;
            padding-top: 0.5rem;
        }
        
        h4 {
            color: #666;
            font-size: 1.25rem;
            margin: 1rem 0 0.5rem;
        }
        
        p {
            margin: 1rem 0;
            text-align: justify;
        }
        
        code {
            background: #f4f4f4;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #e83e8c;
        }
        
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 1.5rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5rem 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        pre code {
            background: transparent;
            padding: 0;
            color: inherit;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }
        
        li {
            margin: 0.5rem 0;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 2rem 0;
        }
        
        strong {
            color: #667eea;
            font-weight: 600;
        }
        
        .toc {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 4px;
        }
        
        .toc ul {
            list-style: none;
            padding-left: 0;
        }
        
        .toc li {
            margin: 0.5rem 0;
        }
        
        .toc a {
            color: #667eea;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .toc a:hover {
            color: #764ba2;
            text-decoration: underline;
        }
        
        a {
            color: #667eea;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        a:hover {
            color: #764ba2;
            text-decoration: underline;
        }
        
        .endpoint {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 1.5rem;
            margin: 2rem 0;
            border-radius: 4px;
        }
        
        .method {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 4px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-right: 0.5rem;
        }
        
        .method.post {
            background: #28a745;
            color: white;
        }
        
        .method.get {
            background: #007bff;
            color: white;
        }
        
        .method.put {
            background: #ffc107;
            color: #000;
        }
        
        .method.delete {
            background: #dc3545;
            color: white;
        }
        
        .status-code {
            display: inline-block;
            padding: 0.2rem 0.6rem;
            border-radius: 3px;
            font-size: 0.85rem;
            font-weight: 600;
            margin: 0.25rem;
        }
        
        .status-code.success {
            background: #d4edda;
            color: #155724;
        }
        
        .status-code.error {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-code.info {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        @media print {
            body {
                background: white;
            }
            
            .container {
                box-shadow: none;
            }
            
            header {
                page-break-after: avoid;
            }
        }
        
        @media (max-width: 768px) {
            .content {
                padding: 1rem;
            }
            
            header h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            pre {
                font-size: 0.8rem;
                padding: 1rem;
            }
        }
        
        .footer {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 2rem;
            text-align: center;
            margin-top: 3rem;
        }
        
        .footer p {
            margin: 0.5rem 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>ArchLens API Specification</h1>
            <p>Comprehensive API Documentation</p>
        </header>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>API Version:</strong> 1.0</p>
            <p><strong>Scoring Method:</strong> Deterministic (temperature: 0)</p>
            <p><strong>Caching:</strong> Enabled (24-hour TTL)</p>
        </div>
    </div>
</body>
</html>`;

// Write HTML file
const htmlPath = path.join(__dirname, '..', 'API_SPECIFICATION.html');
fs.writeFileSync(htmlPath, html, 'utf8');

console.log('✅ HTML API specification generated successfully!');
console.log(`📄 Output: ${htmlPath}`);

