import React, { useState, useRef, useEffect } from 'react';
import { SeparatedFiles } from '../../utils/functions/fileSeparator';
import { FaCode, FaEye, FaExpand, FaCompress, FaFolder, FaFolderOpen } from 'react-icons/fa';
import { BiReset, BiDownload, BiCode, BiCodeBlock } from "react-icons/bi";
import { TbZip } from "react-icons/tb";
import { HiOutlineChevronDown, HiOutlineDocumentText } from "react-icons/hi";
import { DiCss3 } from 'react-icons/di';
import { SiJavascript } from 'react-icons/si';
import { downloadHTML, downloadMultipleFiles } from "../../utils/functions/fileOperations";

interface FileTabsProps {
  files: SeparatedFiles;
  activeFile: string;
  setActiveFile: React.Dispatch<React.SetStateAction<string>>;
  html: string;
  onReset: () => void;
  showExplorer?: boolean;
  toggleExplorer?: () => void;
}

const FileTabs: React.FC<FileTabsProps> = ({ 
  files,
  activeFile, 
  setActiveFile, 
  html, 
  onReset,
  showExplorer = true,
  toggleExplorer = () => {} 
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSingleFileDownload = () => {
    downloadHTML(html);
    setShowDownloadMenu(false);
  };

  const handleMultipleFilesDownload = async () => {
    await downloadMultipleFiles(html);
    setShowDownloadMenu(false);
  };
  
  const toggleFullScreen = () => {
    const elem = document.documentElement;
    
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
        setIsFullScreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };
  
  // Função para verificar se estamos no modo editor ou preview
  const isEditorMode = (): boolean => {
    return activeFile !== 'preview';
  };

  // Função para obter o nome do arquivo CSS ou JS com base no índice
  const getFileName = (type: 'css' | 'js', index: number): string => {
    if (type === 'css') {
      return index === 0 ? 'styles.css' : `styles-${index + 1}.css`;
    } else {
      return index === 0 ? 'script.js' : `script-${index + 1}.js`;
    }
  };

  // Filtra apenas componentes ativos para mostrar nas abas
  const getActiveComponents = (): string[] => {
    if (!files.components) return [];
    
    // Se houver muitos componentes, limita a exibição
    const componentNames = Object.keys(files.components);
    if (componentNames.length <= 2) return componentNames;
    
    // Se há mais de 2 componentes, mostrar apenas o ativo se houver
    const activeComponent = componentNames.find(name => 
      activeFile === `component-${name}`
    );
    
    return activeComponent ? [activeComponent] : componentNames.slice(0, 1);
  };
  
  return (
    <div className="flex justify-between items-center p-2 h-11 rounded-t-lg overflow-x-auto">
      <div className="flex items-center gap-3 px-2">
        {/* Aba do Editor */}
        <button
          className={`preview-tab flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
            isEditorMode() ? 'bg-white/5 backdrop-blur-sm border border-purple-500/20' : 'hover:bg-white/5'
          }`}
          onClick={() => setActiveFile('html')}
        >
          <BiCodeBlock className={isEditorMode() ? 'text-purple-400' : 'text-gray-400'} />
          <span className={isEditorMode() ? 'text-purple-400' : 'text-gray-300'}>Editor</span>
          {isEditorMode() && (
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse ml-1"></div>
          )}
        </button>
        
        {/* Aba de Preview */}
        <button
          className={`preview-tab flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${
            !isEditorMode() ? 'bg-white/5 backdrop-blur-sm border border-blue-500/20' : 'hover:bg-white/5'
          }`}
          onClick={() => setActiveFile('preview')}
        >
          <FaEye className={!isEditorMode() ? 'text-blue-400' : 'text-gray-400'} />
          <span className={!isEditorMode() ? 'text-blue-400' : 'text-gray-300'}>Preview</span>
          {!isEditorMode() && (
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-1"></div>
          )}
        </button>
      </div>
      
      {/* Botões de ação */}
      <div className="flex items-center gap-3 px-4 mr-1 flex-shrink-0">
        {/* Botão para explorador de arquivos (só aparece no modo de edição) */}
        {isEditorMode() && (
          <button
            onClick={toggleExplorer}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors tooltip glow-effect"
            data-tooltip={showExplorer ? "Esconder explorador" : "Mostrar explorador"}
          >
            {showExplorer ? <FaFolderOpen className="text-sm text-blue-400" /> : <FaFolder className="text-sm" />}
          </button>
        )}
        
        {/* Botão de tela cheia */}
        <button
          onClick={toggleFullScreen}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors tooltip glow-effect"
          data-tooltip={isFullScreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {isFullScreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
        </button>
        
        {/* Menu de download */}
        <div className="relative" ref={downloadMenuRef}>
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors tooltip glow-effect"
            data-tooltip="Baixar código"
          >
            <BiDownload className="text-lg" />
          </button>
          
          {showDownloadMenu && (
            <div className="dropdown-menu glass-component active right-0 w-48">
              <button
                onClick={handleSingleFileDownload}
                className="dropdown-item hover:bg-white/5"
              >
                <HiOutlineDocumentText />
                <span>Arquivo HTML único</span>
              </button>
              <button
                onClick={handleMultipleFilesDownload}
                className="dropdown-item hover:bg-white/5"
              >
                <TbZip />
                <span>Múltiplos arquivos (ZIP)</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Botão de reiniciar */}
        <button
          onClick={onReset}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors tooltip glow-effect"
          data-tooltip="Reiniciar editor"
        >
          <BiReset className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default FileTabs; 