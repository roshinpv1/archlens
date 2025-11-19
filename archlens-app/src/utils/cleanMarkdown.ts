/**
 * Converts markdown formatting to HTML for proper display
 * Preserves structure and formatting while making it renderable
 */
export function markdownToHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let html = text.trim();
  
  // Step 1: Process code blocks first (before escaping, as they contain code)
  const codeBlockPlaceholders: string[] = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlockPlaceholders.length}__`;
    const language = lang || 'text';
    const escapedCode = escapeHtml(code.trim());
    codeBlockPlaceholders.push(`<pre class="markdown-code-block"><code class="language-${language}">${escapedCode}</code></pre>`);
    return placeholder;
  });

  // Step 2: Process inline code
  const inlineCodePlaceholders: string[] = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodePlaceholders.length}__`;
    const escapedCode = escapeHtml(code);
    inlineCodePlaceholders.push(`<code class="markdown-inline-code">${escapedCode}</code>`);
    return placeholder;
  });

  // Step 3: Escape remaining HTML to prevent XSS
  html = escapeHtml(html);

  // Step 4: Restore code blocks and inline code
  codeBlockPlaceholders.forEach((replacement, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, replacement);
  });
  inlineCodePlaceholders.forEach((replacement, index) => {
    html = html.replace(`__INLINE_CODE_${index}__`, replacement);
  });

  // Step 5: Convert headers (after escaping, so we add HTML tags)
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="markdown-h4">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="markdown-h3">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="markdown-h2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="markdown-h1">$1</h1>');

  // Step 6: Convert bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="markdown-bold">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="markdown-bold">$1</strong>');

  // Step 7: Convert italic (*text* or _text_) - careful not to match bold
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="markdown-italic">$1</em>');
  html = html.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em class="markdown-italic">$1</em>');

  // Step 8: Convert links [text](url) - escape URL
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, text, url) => {
    const escapedUrl = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return `<a href="${escapedUrl}" class="markdown-link" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });

  // Step 9: Convert horizontal rules
  html = html.replace(/^[-*_]{3,}$/gm, '<hr class="markdown-hr">');

  // Step 10: Convert blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="markdown-blockquote">$1</blockquote>');

  // Step 11: Convert lists - unordered first
  const listItems: string[] = [];
  html = html.replace(/^[\s]*[-*+]\s+(.+)$/gm, (match, content) => {
    const placeholder = `__LIST_ITEM_${listItems.length}__`;
    listItems.push(`<li class="markdown-list-item">${content}</li>`);
    return placeholder;
  });
  
  // Wrap consecutive list items
  html = html.replace(/(__LIST_ITEM_\d+__\n?)+/g, (match) => {
    const items = match.match(/__LIST_ITEM_(\d+)__/g) || [];
    const listContent = items.map(item => {
      const index = parseInt(item.match(/\d+/)![0]);
      return listItems[index];
    }).join('');
    return `<ul class="markdown-list">${listContent}</ul>`;
  });

  // Step 12: Convert ordered lists
  const orderedListItems: string[] = [];
  html = html.replace(/^[\s]*\d+\.\s+(.+)$/gm, (match, content) => {
    const placeholder = `__ORDERED_LIST_ITEM_${orderedListItems.length}__`;
    orderedListItems.push(`<li class="markdown-list-item">${content}</li>`);
    return placeholder;
  });
  
  html = html.replace(/(__ORDERED_LIST_ITEM_\d+__\n?)+/g, (match) => {
    const items = match.match(/__ORDERED_LIST_ITEM_(\d+)__/g) || [];
    const listContent = items.map(item => {
      const index = parseInt(item.match(/\d+/)![0]);
      return orderedListItems[index];
    }).join('');
    return `<ol class="markdown-list">${listContent}</ol>`;
  });

  // Step 13: Convert paragraphs (double newline = paragraph, single newline = <br>)
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    // If it's already a block element, don't wrap
    if (p.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr)/)) {
      return p;
    }
    // Convert single newlines to <br>
    p = p.replace(/\n/g, '<br class="markdown-br">');
    return `<p class="markdown-paragraph">${p}</p>`;
  }).filter(p => p).join('\n');

  return html;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Legacy function name for backward compatibility
 * Now converts markdown to HTML instead of removing it
 */
export function cleanMarkdown(text: string): string {
  return markdownToHtml(text);
}

