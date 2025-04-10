/**
 * Creates and downloads a file with the given content and filename
 * @param content The content to be saved in the file
 * @param filename The name of the file to be downloaded
 * @param type The MIME type of the file
 */
export declare function downloadFile(content: string, filename: string, type?: string): void;
/**
 * Downloads the HTML content as a file
 * @param html The HTML content to download
 * @param filename The name of the file (defaults to 'index.html')
 */
export declare function downloadHTML(html: string, filename?: string): void;
/**
 * Downloads the HTML, CSS, JS and components as separate files in a ZIP archive
 * with an organized directory structure
 * @param html The HTML content to separate and download
 */
export declare function downloadMultipleFiles(html: string): Promise<void>;
