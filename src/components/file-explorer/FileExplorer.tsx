import React from 'react';
import { FiFolder, FiFileText, FiCode, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { DiCss3 } from 'react-icons/di';
import { SeparatedFiles } from '../../utils/functions/fileSeparator';

interface FileExplorerProps {
  files: SeparatedFiles;
  activeFile: string;
  editingFileType: 'html' | 'css' | 'js' | 'component';
  editingFileIndex: number | null;
  editingComponentName: string | null;
  onSelectFile: (fileType: string, index?: number) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  editingFileType, 
  editingFileIndex, 
  editingComponentName, 
  onSelectFile 
}) => {
  const [expandedFolders, setExpandedFolders] = React.useState({
    html: true,
    css: true,
    js: true,
    components: false
  });

  const toggleFolder = (folder: keyof typeof expandedFolders) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  // Função para retornar o nome correto de um arquivo CSS ou JS com base no índice
  const getFileName = (type: 'css' | 'js', index: number): string => {
    if (type === 'css') {
      return index === 0 ? 'styles.css' : `styles-${index + 1}.css`;
    } else {
      return index === 0 ? 'script.js' : `script-${index + 1}.js`;
    }
  };

  // Função para verificar se um arquivo está ativo
  const isActive = (fileType: string, index?: number, compName?: string): boolean => {
    if (fileType === 'html' && editingFileType === 'html') {
      return true;
    } else if (fileType === 'css' && index !== undefined && editingFileType === 'css' && editingFileIndex === index) {
      return true;
    } else if (fileType === 'js' && index !== undefined && editingFileType === 'js' && editingFileIndex === index) {
      return true;
    } else if (fileType === 'component' && compName && editingFileType === 'component' && editingComponentName === compName) {
      return true;
    }
    return false;
  };

  return (
    <div className="file-explorer h-full bg-[#1e1e1e] text-gray-300 border-r border-gray-700/20 p-2 overflow-y-auto">
      <div className="explorer-header flex items-center justify-between p-2 mb-2 border-b border-gray-700/20">
        <h2 className="text-sm font-medium">Explorador</h2>
      </div>

      <div className="files-list text-sm">
        {/* Pasta do projeto */}
        <div className="folder mb-1">
          <div className="folder-header flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer">
            <FiFolder className="text-blue-400" />
            <span className="text-sm font-medium">Projeto</span>
          </div>

          <div className="folder-content pl-4">
            {/* Arquivo HTML */}
            <div 
              className={`file flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer ${isActive('html') ? 'bg-white/10 text-purple-400' : ''}`}
              onClick={() => onSelectFile('html')}
            >
              <FiFileText className={isActive('html') ? 'text-purple-400' : 'text-gray-400'} />
              <span>index.html</span>
            </div>

            {/* Pasta CSS */}
            <div className="folder mb-1">
              <div 
                className="folder-header flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer"
                onClick={() => toggleFolder('css')}
              >
                {expandedFolders.css ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                <FiFolder className="text-blue-400" />
                <span>css</span>
              </div>
              
              {expandedFolders.css && files.css.length > 0 && (
                <div className="folder-content pl-4">
                  {files.css.map((_, index) => (
                    <div 
                      key={`css-${index}`}
                      className={`file flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer ${isActive('css', index) ? 'bg-white/10 text-blue-400' : ''}`}
                      onClick={() => onSelectFile('css', index)}
                    >
                      <DiCss3 className={isActive('css', index) ? 'text-blue-400' : 'text-gray-400'} />
                      <span>{getFileName('css', index)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pasta JavaScript */}
            <div className="folder mb-1">
              <div 
                className="folder-header flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer"
                onClick={() => toggleFolder('js')}
              >
                {expandedFolders.js ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                <FiFolder className="text-blue-400" />
                <span>js</span>
              </div>
              
              {expandedFolders.js && files.js.length > 0 && (
                <div className="folder-content pl-4">
                  {files.js.map((_, index) => (
                    <div 
                      key={`js-${index}`}
                      className={`file flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer ${isActive('js', index) ? 'bg-white/10 text-yellow-400' : ''}`}
                      onClick={() => onSelectFile('js', index)}
                    >
                      <FiCode className={isActive('js', index) ? 'text-yellow-400' : 'text-gray-400'} />
                      <span>{getFileName('js', index)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pasta de Componentes (se existirem) */}
            {Object.keys(files.components).length > 0 && (
              <div className="folder mb-1">
                <div 
                  className="folder-header flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer"
                  onClick={() => toggleFolder('components')}
                >
                  {expandedFolders.components ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                  <FiFolder className="text-blue-400" />
                  <span>components</span>
                </div>
                
                {expandedFolders.components && (
                  <div className="folder-content pl-4">
                    {Object.keys(files.components).map((componentName) => (
                      <div 
                        key={componentName}
                        className={`file flex items-center gap-1.5 p-1 hover:bg-white/5 rounded cursor-pointer ${isActive('component', undefined, componentName) ? 'bg-white/10 text-green-400' : ''}`}
                        onClick={() => onSelectFile(`component-${componentName}`)}
                      >
                        <FiCode className={isActive('component', undefined, componentName) ? 'text-green-400' : 'text-gray-400'} />
                        <span>{componentName}.js</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer; 