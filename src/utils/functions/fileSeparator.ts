/**
 * Interface para representar múltiplos arquivos extraídos de um documento HTML
 */
export interface SeparatedFiles {
  html: string;
  css: string[];
  js: string[];
  components: Record<string, string>;
}

/**
 * Extrai o conteúdo CSS de um documento HTML
 * @param htmlContent O conteúdo HTML completo
 * @returns O conteúdo CSS extraído (array de estilos)
 */
export function extractCSS(htmlContent: string): string[] {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const cssBlocks: string[] = [];
  let match;
  
  while ((match = styleRegex.exec(htmlContent)) !== null) {
    const cssContent = match[1].trim();
    if (cssContent) {
      cssBlocks.push(cssContent);
    }
  }
  
  return cssBlocks;
}

/**
 * Extrai o conteúdo JavaScript de um documento HTML
 * @param htmlContent O conteúdo HTML completo
 * @returns O conteúdo JavaScript extraído (array de scripts)
 */
export function extractJS(htmlContent: string): string[] {
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const jsBlocks: string[] = [];
  let match;
  
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    // Verifica se o script não contém src (apenas scripts inline)
    if (!match[0].includes('src=')) {
      const jsContent = match[1].trim();
      if (jsContent) {
        jsBlocks.push(jsContent);
      }
    }
  }
  
  return jsBlocks;
}

/**
 * Extrai os componentes HTML do documento
 * @param htmlContent O conteúdo HTML completo
 * @returns Um objeto com os componentes extraídos
 */
export function extractComponents(htmlContent: string): Record<string, string> {
  const components: Record<string, string> = {};
  
  // Extrair cabeçalho (header)
  const headerRegex = /<header[^>]*>([\s\S]*?)<\/header>/i;
  const headerMatch = htmlContent.match(headerRegex);
  if (headerMatch && headerMatch[0]) {
    components['header'] = headerMatch[0];
  }
  
  // Extrair rodapé (footer)
  const footerRegex = /<footer[^>]*>([\s\S]*?)<\/footer>/i;
  const footerMatch = htmlContent.match(footerRegex);
  if (footerMatch && footerMatch[0]) {
    components['footer'] = footerMatch[0];
  }
  
  // Extrair navegação (nav)
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/i;
  const navMatch = htmlContent.match(navRegex);
  if (navMatch && navMatch[0]) {
    components['nav'] = navMatch[0];
  }
  
  // Extrair seções principais
  const sectionRegex = /<section[^>]*?(?:id=["']([^"']+)["']|class=["']([^"']+)["'])[^>]*>([\s\S]*?)<\/section>/gi;
  let sectionMatch;
  
  while ((sectionMatch = sectionRegex.exec(htmlContent)) !== null) {
    const id = sectionMatch[1] || '';
    const className = sectionMatch[2] || '';
    const content = sectionMatch[0];
    
    // Usar ID ou primeira classe como nome do componente
    const componentName = id || (className ? className.split(' ')[0] : '');
    
    if (componentName) {
      components[`section-${componentName}`] = content;
    }
  }
  
  // Extrair divs que possam ser componentes (com ID ou classes específicas)
  const divRegex = /<div[^>]*?(?:id=["']([^"']+)["']|class=["']([^"']+)["'])[^>]*>([\s\S]*?)<\/div>/gi;
  let divMatch;
  
  while ((divMatch = divRegex.exec(htmlContent)) !== null) {
    const id = divMatch[1] || '';
    const className = divMatch[2] || '';
    
    // Identificar possíveis componentes por palavras-chave no ID ou classe
    const possibleComponentWords = ['container', 'component', 'wrapper', 'card', 'modal', 'menu', 'list', 'item', 'widget'];
    
    const isComponent = id && possibleComponentWords.some(word => id.includes(word)) || 
                       className && possibleComponentWords.some(word => className.includes(word));
    
    if (isComponent) {
      const componentName = id || (className ? className.split(' ')[0] : '');
      if (componentName && divMatch[0].length < 5000) { // Limitar tamanho para componentes reais
        components[`component-${componentName}`] = divMatch[0];
      }
    }
  }
  
  return components;
}

/**
 * Remove os blocos de estilo e script inline do documento HTML
 * @param htmlContent O conteúdo HTML completo
 * @returns O conteúdo HTML sem os blocos de estilo e script inline
 */
export function cleanHTML(htmlContent: string): string {
  // Remove blocos <style> inline
  let cleanedHTML = htmlContent.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  
  // Remove scripts inline (mas mantém os que têm src)
  cleanedHTML = cleanedHTML.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match) => {
    if (match.includes('src=')) {
      return match; // Mantém scripts externos
    }
    return ''; // Remove scripts inline
  });
  
  return cleanedHTML;
}

/**
 * Adiciona links para os arquivos CSS e JavaScript externos
 * @param htmlContent O conteúdo HTML limpo
 * @returns O conteúdo HTML com links para os arquivos externos
 */
export function addExternalLinks(htmlContent: string): string {
  let updatedHTML = htmlContent;
  
  // Adiciona link CSS principal antes de </head>
  updatedHTML = updatedHTML.replace('</head>', `  <link rel="stylesheet" href="css/styles.css">\n</head>`);
  
  // Adiciona script JS principal antes de </body>
  updatedHTML = updatedHTML.replace('</body>', `  <script src="js/script.js"></script>\n</body>`);
  
  return updatedHTML;
}

/**
 * Separa o conteúdo HTML em arquivos múltiplos (HTML, CSS, JS, componentes)
 * @param htmlContent O conteúdo HTML completo
 * @returns Um objeto com os arquivos separados
 */
export function separateFiles(htmlContent: string): SeparatedFiles {
  if (!htmlContent) {
    return { html: '', css: [], js: [], components: {} };
  }
  
  const cssBlocks = extractCSS(htmlContent);
  const jsBlocks = extractJS(htmlContent);
  const components = extractComponents(htmlContent);
  let html = cleanHTML(htmlContent);
  
  // Somente adiciona links para os arquivos externos se existir conteúdo
  if (cssBlocks.length > 0 || jsBlocks.length > 0) {
    html = addExternalLinks(html);
  }
  
  return {
    html,
    css: cssBlocks,
    js: jsBlocks,
    components
  };
}

/**
 * Combina CSS em um único arquivo
 * @param cssBlocks Array de blocos CSS
 * @returns CSS combinado
 */
export function combineCSS(cssBlocks: string[]): string {
  if (!cssBlocks.length) return '';
  
  return cssBlocks.map(css => {
    // Adiciona comentário para separar blocos
    return `/* CSS Block */\n${css}\n`;
  }).join('\n\n');
}

/**
 * Combina JS em um único arquivo
 * @param jsBlocks Array de blocos JS
 * @returns JS combinado
 */
export function combineJS(jsBlocks: string[]): string {
  if (!jsBlocks.length) return '';
  
  return jsBlocks.map(js => {
    // Adiciona comentário para separar blocos
    return `// JavaScript Block\n${js}\n`;
  }).join('\n\n');
}

/**
 * Combina os arquivos separados em um único documento HTML
 * @param files Objeto com os arquivos separados
 * @returns O conteúdo HTML combinado
 */
export function combineFiles(files: SeparatedFiles): string {
  const { html, css, js } = files;
  
  if (!html) return '';
  
  let combinedHTML = html;
  
  // Se tiver CSS, adiciona dentro do <head>
  if (css.length > 0) {
    const combinedCSS = combineCSS(css);
    combinedHTML = combinedHTML.replace('</head>', `  <style>\n${combinedCSS}\n  </style>\n</head>`);
  }
  
  // Se tiver JS, adiciona antes de </body>
  if (js.length > 0) {
    const combinedJS = combineJS(js);
    combinedHTML = combinedHTML.replace('</body>', `  <script>\n${combinedJS}\n  </script>\n</body>`);
  }
  
  return combinedHTML;
} 