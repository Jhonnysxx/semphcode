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
export declare function extractCSS(htmlContent: string): string[];
/**
 * Extrai o conteúdo JavaScript de um documento HTML
 * @param htmlContent O conteúdo HTML completo
 * @returns O conteúdo JavaScript extraído (array de scripts)
 */
export declare function extractJS(htmlContent: string): string[];
/**
 * Extrai os componentes HTML do documento
 * @param htmlContent O conteúdo HTML completo
 * @returns Um objeto com os componentes extraídos
 */
export declare function extractComponents(htmlContent: string): Record<string, string>;
/**
 * Remove os blocos de estilo e script inline do documento HTML
 * @param htmlContent O conteúdo HTML completo
 * @returns O conteúdo HTML sem os blocos de estilo e script inline
 */
export declare function cleanHTML(htmlContent: string): string;
/**
 * Adiciona links para os arquivos CSS e JavaScript externos
 * @param htmlContent O conteúdo HTML limpo
 * @returns O conteúdo HTML com links para os arquivos externos
 */
export declare function addExternalLinks(htmlContent: string): string;
/**
 * Separa o conteúdo HTML em arquivos múltiplos (HTML, CSS, JS, componentes)
 * @param htmlContent O conteúdo HTML completo
 * @returns Um objeto com os arquivos separados
 */
export declare function separateFiles(htmlContent: string): SeparatedFiles;
/**
 * Combina CSS em um único arquivo
 * @param cssBlocks Array de blocos CSS
 * @returns CSS combinado
 */
export declare function combineCSS(cssBlocks: string[]): string;
/**
 * Combina JS em um único arquivo
 * @param jsBlocks Array de blocos JS
 * @returns JS combinado
 */
export declare function combineJS(jsBlocks: string[]): string;
/**
 * Combina os arquivos separados em um único documento HTML
 * @param files Objeto com os arquivos separados
 * @returns O conteúdo HTML combinado
 */
export declare function combineFiles(files: SeparatedFiles): string;
