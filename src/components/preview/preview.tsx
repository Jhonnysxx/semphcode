import classNames from "classnames";
import { useRef, useState, useEffect } from "react";
import { TbReload } from "react-icons/tb";
import { toast } from "react-toastify";
import Editor from "@monaco-editor/react";
import { separateFiles, combineFiles, SeparatedFiles } from "../../utils/functions/fileSeparator";
import FileTabs from "./FileTabs";
import FileExplorer from "../file-explorer/FileExplorer";

function Preview({
  html,
  isResizing,
  isAiWorking,
  setView,
  ref,
  onReset
}: {
  html: string;
  isResizing: boolean;
  isAiWorking: boolean;
  setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
  ref: React.RefObject<HTMLDivElement | null>;
  onReset: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeFile, setActiveFile] = useState<string>('html');
  const [separatedFiles, setSeparatedFiles] = useState<SeparatedFiles>({ html: '', css: [], js: [], components: {} });
  const [combinedHtml, setCombinedHtml] = useState<string>(html);
  const [showExplorer, setShowExplorer] = useState<boolean>(true);
  const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);
  const [editingFileType, setEditingFileType] = useState<'html' | 'css' | 'js' | 'component'>('html');
  const [editingComponentName, setEditingComponentName] = useState<string | null>(null);

  // Separar os arquivos quando o HTML mudar
  useEffect(() => {
    const files = separateFiles(html);
    setSeparatedFiles(files);
    setCombinedHtml(html);
  }, [html]);

  // Atualizar o HTML combinado quando os arquivos separados mudarem
  useEffect(() => {
    if (activeFile !== 'preview') return; // Só combina quando está visualizando a prévia
    
    const updatedHtml = combineFiles(separatedFiles);
    setCombinedHtml(updatedHtml);
  }, [separatedFiles, activeFile]);

  const handleRefreshIframe = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const content = iframe.srcdoc;
      iframe.srcdoc = "";
      setTimeout(() => {
        iframe.srcdoc = content;
      }, 10);
      
      // Adiciona um efeito de notificação
      toast.success("Visualização atualizada!", {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    }
  };
  
  // Manipulador para atualizar o conteúdo do arquivo atual
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    if (editingFileType === 'html') {
      // Atualiza o HTML completo
      setSeparatedFiles(prev => ({
        ...prev,
        html: value
      }));
    } else if (editingFileType === 'css' && editingFileIndex !== null) {
      // Atualiza o arquivo CSS específico
      setSeparatedFiles(prev => {
        const newCss = [...prev.css];
        newCss[editingFileIndex] = value;
        return {
          ...prev,
          css: newCss
        };
      });
    } else if (editingFileType === 'js' && editingFileIndex !== null) {
      // Atualiza o arquivo JavaScript específico
      setSeparatedFiles(prev => {
        const newJs = [...prev.js];
        newJs[editingFileIndex] = value;
        return {
          ...prev,
          js: newJs
        };
      });
    } else if (editingFileType === 'component' && editingComponentName) {
      // Atualiza o componente específico
      setSeparatedFiles(prev => {
        const newComponents = { ...prev.components };
        newComponents[editingComponentName] = value;
        return {
          ...prev,
          components: newComponents
        };
      });
    }
  };

  // Manipulador para selecionar um arquivo no explorador
  const handleSelectFile = (fileType: string, index?: number) => {
    if (fileType === 'html') {
      // Mantém a aba como "editor" (html)
      setEditingFileType('html');
      setEditingFileIndex(null);
      setEditingComponentName(null);
    } else if (fileType.startsWith('css') && index !== undefined) {
      // Mantém a aba como "editor" (html), mas edita CSS
      setEditingFileType('css');
      setEditingFileIndex(index);
      setEditingComponentName(null);
    } else if (fileType.startsWith('js') && index !== undefined) {
      // Mantém a aba como "editor" (html), mas edita JS
      setEditingFileType('js');
      setEditingFileIndex(index);
      setEditingComponentName(null);
    } else if (fileType.startsWith('component-')) {
      // Mantém a aba como "editor" (html), mas edita componente
      const componentName = fileType.replace('component-', '');
      setEditingFileType('component');
      setEditingFileIndex(null);
      setEditingComponentName(componentName);
    }
  };

  // Função para alternar a visibilidade do explorador de arquivos
  const toggleExplorer = () => {
    setShowExplorer(prev => !prev);
  };

  // Função para determinar a linguagem do editor com base no tipo de arquivo
  const getEditorLanguage = (): string => {
    switch (editingFileType) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'js':
      case 'component':
        return 'javascript';
      default:
        return 'html';
    }
  };

  // Função para determinar o valor para o editor
  const getEditorValue = (): string => {
    switch (editingFileType) {
      case 'html':
        return separatedFiles.html || '';
      case 'css':
        return editingFileIndex !== null ? separatedFiles.css[editingFileIndex] || '' : '';
      case 'js':
        return editingFileIndex !== null ? separatedFiles.js[editingFileIndex] || '' : '';
      case 'component':
        return editingComponentName ? separatedFiles.components[editingComponentName] || '' : '';
      default:
        return '';
    }
  };

  // Função para obter o nome do arquivo atual
  const getCurrentFileName = (): string => {
    switch (editingFileType) {
      case 'html':
        return 'index.html';
      case 'css':
        return editingFileIndex !== null 
          ? (editingFileIndex === 0 ? 'styles.css' : `styles-${editingFileIndex + 1}.css`) 
          : '';
      case 'js':
        return editingFileIndex !== null 
          ? (editingFileIndex === 0 ? 'script.js' : `script-${editingFileIndex + 1}.js`) 
          : '';
      case 'component':
        return editingComponentName ? `${editingComponentName}.js` : '';
      default:
        return '';
    }
  };

  return (
    <div
      ref={ref}
      className="w-full border-l border-gray-700/10 bg-transparent flex-1 flex flex-col relative min-h-0"
      onClick={(e) => {
        if (isAiWorking) {
          e.preventDefault();
          e.stopPropagation();
          toast.warn("Aguarde a IA terminar de trabalhar.");
        }
      }}
    >
      {/* Container principal com estilo glassmorphism */}
      <div className="preview-floating-container glass-component flex-1">
        {/* Abas no topo com estilo glass */}
        <div className="bg-transparent rounded-t-lg border-b border-gray-700/20">
          <FileTabs 
            files={separatedFiles} 
            activeFile={activeFile} 
            setActiveFile={setActiveFile} 
            html={html}
            onReset={onReset}
            showExplorer={showExplorer}
            toggleExplorer={toggleExplorer}
          />
        </div>

        {/* Conteúdo principal (código/preview) */}
        <div className="flex flex-row flex-1 bg-transparent rounded-b-2xl overflow-hidden">
          {activeFile !== 'preview' && showExplorer && (
            <div className="w-64 flex-shrink-0">
              <FileExplorer 
                files={separatedFiles} 
                activeFile={activeFile}
                editingFileType={editingFileType}
                editingFileIndex={editingFileIndex}
                editingComponentName={editingComponentName}
                onSelectFile={handleSelectFile}
              />
            </div>
          )}
          
          {/* Área de código/preview */}
          <div className="flex-1 flex flex-col bg-transparent">
            {activeFile === 'preview' ? (
              <>
                <div className="flex items-center px-3 py-2 bg-transparent border-b border-gray-700/20 text-[13px] text-gray-400">
                  <button 
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors mr-3 tooltip"
                    data-tooltip="Atualizar preview"
                    onClick={handleRefreshIframe}
                  >
                    <TbReload className="text-lg" />
                  </button>
                  <span className="truncate flex-1">
                    Visualização do projeto
                  </span>
                </div>
                <div className="flex-1 p-0 bg-[#1f1f1f] relative">
                  <iframe
                    ref={iframeRef}
                    srcDoc={combinedHtml}
                    title="Preview"
                    className="w-full h-full transition-opacity"
                    style={{ opacity: isResizing ? 0.6 : 1 }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 bg-[rgba(30,30,35,0.95)] code-container">
                <div className="flex items-center px-3 py-2 bg-[rgba(20,20,25,0.5)] border-b border-gray-700/20 text-[13px] text-gray-400">
                  <span className="truncate flex-1">
                    Editando: {getCurrentFileName()}
                  </span>
                </div>
                <Editor
                  height="100%"
                  defaultLanguage={getEditorLanguage()}
                  language={getEditorLanguage()}
                  value={getEditorValue()}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1.5,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: true,
                    cursorBlinking: "smooth",
                    folding: true,
                    automaticLayout: true,
                    padding: { top: 10 },
                    formatOnPaste: true,
                    formatOnType: true,
                    fixedOverflowWidgets: true,
                    renderWhitespace: "none",
                    roundedSelection: true,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      verticalHasArrows: true,
                      horizontalHasArrows: true,
                      verticalScrollbarSize: 14,
                      horizontalScrollbarSize: 14,
                      alwaysConsumeMouseWheel: false
                    },
                  }}
                  className="monaco-editor-container"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;
