import JSZip from 'jszip';
import { separateFiles, SeparatedFiles, combineCSS, combineJS } from './fileSeparator';

/**
 * Creates and downloads a file with the given content and filename
 * @param content The content to be saved in the file
 * @param filename The name of the file to be downloaded
 * @param type The MIME type of the file
 */
export function downloadFile(content: string, filename: string, type: string = 'text/html') {
  // Create a blob with the content and specified type
  const blob = new Blob([content], { type });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create an anchor element for the download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Append to the body, click to trigger download, then clean up
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Revoke the URL to free up memory
  URL.revokeObjectURL(url);
}

/**
 * Downloads the HTML content as a file
 * @param html The HTML content to download
 * @param filename The name of the file (defaults to 'index.html')
 */
export function downloadHTML(html: string, filename: string = 'index.html') {
  downloadFile(html, filename, 'text/html');
}

/**
 * Obtém o nome do projeto com base no título do HTML
 * @param html Conteúdo HTML completo
 * @returns Nome do projeto
 */
function getProjectName(html: string): string {
  // Tenta extrair o título do HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    // Simplifica o título para usar como nome de pasta
    return titleMatch[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres não alfanuméricos por traços
      .replace(/^-|-$/g, '') // Remove traços do início e fim
      || 'projeto';
  }
  
  return 'projeto';
}

/**
 * Downloads the HTML, CSS, JS and components as separate files in a ZIP archive
 * with an organized directory structure
 * @param html The HTML content to separate and download
 */
export async function downloadMultipleFiles(html: string): Promise<void> {
  // Verificar se o HTML existe
  if (!html) {
    console.error('Nenhum conteúdo HTML para download');
    return;
  }

  try {
    // Separar o HTML em arquivos múltiplos
    const files: SeparatedFiles = separateFiles(html);
    
    // Obter nome do projeto
    const projectName = getProjectName(html);
    
    // Criar um novo arquivo ZIP
    const zip = new JSZip();
    
    // Criar a estrutura base de pastas
    const rootFolder = zip.folder(projectName)!;
    const cssFolder = rootFolder.folder('css')!;
    const jsFolder = rootFolder.folder('js')!;
    const componentsFolder = rootFolder.folder('components')!;
    
    // Adicionar o HTML principal
    rootFolder.file('index.html', files.html);
    
    // Adicionar os arquivos CSS
    if (files.css.length > 0) {
      // Arquivo principal de CSS
      cssFolder.file('styles.css', combineCSS(files.css));
      
      // Se houver vários arquivos CSS, também podemos separar individualmente
      if (files.css.length > 1) {
        files.css.forEach((cssBlock, index) => {
          const filename = index === 0 ? 'main.css' : `styles-${index + 1}.css`;
          cssFolder.file(filename, cssBlock);
        });
      }
    }
    
    // Adicionar os arquivos JavaScript
    if (files.js.length > 0) {
      // Arquivo principal de JavaScript
      jsFolder.file('script.js', combineJS(files.js));
      
      // Se houver vários arquivos JS, também podemos separar individualmente
      if (files.js.length > 1) {
        files.js.forEach((jsBlock, index) => {
          const filename = index === 0 ? 'main.js' : `script-${index + 1}.js`;
          jsFolder.file(filename, jsBlock);
        });
      }
    }
    
    // Adicionar componentes
    Object.entries(files.components).forEach(([name, content]) => {
      componentsFolder.file(`${name}.html`, content);
    });
    
    // Adicionar arquivo README.md com instruções
    const readme = `# Projeto ${projectName.charAt(0).toUpperCase() + projectName.slice(1)}

Este projeto foi gerado automaticamente e está organizado com a seguinte estrutura:

\`\`\`
/${projectName}
│── index.html           # Arquivo HTML principal
│── /css                 # Pasta de estilos CSS
│   ├── styles.css       # Estilos combinados
${files.css.length > 1 ? '│   ├── main.css         # Estilo principal\n' : ''}${files.css.length > 1 ? '│   ├── styles-2.css     # Estilos adicionais\n' : ''}${files.css.length > 2 ? '│   └── ... outros estilos\n' : ''}│── /js                  # Pasta de scripts JavaScript
│   ├── script.js        # Scripts combinados
${files.js.length > 1 ? '│   ├── main.js          # Script principal\n' : ''}${files.js.length > 1 ? '│   ├── script-2.js      # Scripts adicionais\n' : ''}${files.js.length > 2 ? '│   └── ... outros scripts\n' : ''}│── /components          # Componentes HTML reutilizáveis
${Object.keys(files.components).map(comp => `│   ├── ${comp}.html\n`).join('')}
\`\`\`

## Como usar

1. Extraia todos os arquivos para uma mesma pasta, mantendo a estrutura de diretórios
2. Abra o arquivo \`index.html\` em seu navegador

## Edição e manutenção

- Modifique os componentes individualmente na pasta \`components\`
- Edite estilos na pasta \`css\` 
- Atualize scripts na pasta \`js\`
- O arquivo \`index.html\` já contém as referências corretas para os arquivos CSS e JavaScript
`;
    
    rootFolder.file('README.md', readme);
    
    // Gerar o arquivo ZIP como um blob
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Criar uma URL para o blob e iniciar o download
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao criar o arquivo ZIP:', error);
    // Fallback para baixar apenas o HTML se ocorrer algum erro
    downloadHTML(html, 'index.html');
  }
} 