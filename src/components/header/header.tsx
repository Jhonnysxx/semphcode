import { useState, useRef, useEffect } from "react";
import { BiReset, BiDownload, BiCodeAlt, BiUser, BiCog, BiHelpCircle, BiBookContent, BiImage } from "react-icons/bi";
import { TbZip } from "react-icons/tb";
import { downloadHTML, downloadMultipleFiles } from "../../utils/functions/fileOperations";
import { HiOutlineChevronDown, HiOutlineDocumentText, HiOutlineMenuAlt2, HiOutlineExternalLink } from "react-icons/hi";
import { FiGithub } from "react-icons/fi";

interface HeaderProps {
  onReset: () => void;
  html: string;
  onOpenImageSearch?: () => void;
}

function Header({ onReset, html, onOpenImageSearch }: HeaderProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const mainMenuRef = useRef<HTMLDivElement>(null);

  // Fechar os menus quando clicar fora deles
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
      if (mainMenuRef.current && !mainMenuRef.current.contains(event.target as Node)) {
        setShowMainMenu(false);
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

  return (
    <header className="header relative z-30">
      <div className="absolute inset-0 bg-[rgba(25,25,35,0.6)] backdrop-blur-md shadow-lg border-b border-white/5"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1.5 shadow-lg">
          <img 
            src="/logo.svg" 
            alt="DeepSeek Coder Logo" 
            className="h-5 lg:h-6" 
          />
        </div>
        <h1 className="text-base lg:text-lg font-bold text-white">Editor HTML com IA</h1>
      </div>
      
      <div className="flex items-center gap-3 relative z-10">
        {/* Menu principal */}
        <div className="relative" ref={mainMenuRef}>
          <button
            onClick={() => setShowMainMenu(!showMainMenu)}
            className="glass-component px-3 py-2 rounded-lg flex items-center gap-1.5 text-white text-sm hover:bg-white/5 transition-all glow-effect"
            title="Menu principal"
          >
            <HiOutlineMenuAlt2 />
            <span className="mobile-hidden">Menu</span>
            <HiOutlineChevronDown className="ml-1 text-xs" />
          </button>
          
          {showMainMenu && (
            <div className="dropdown-menu glass-component active" style={{ width: "250px" }}>
              <div className="p-3 border-b border-gray-700/20">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                    <BiUser className="text-white" size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Usuário</p>
                    <p className="text-xs text-gray-400">Plano Free</p>
                  </div>
                </div>
              </div>
              
              <div className="py-1">
                <a href="#" className="dropdown-item hover:bg-white/5">
                  <BiBookContent />
                  <span>Tutoriais</span>
                </a>
                <a href="#" className="dropdown-item hover:bg-white/5">
                  <BiHelpCircle />
                  <span>Ajuda</span>
                </a>
                <a href="#" className="dropdown-item hover:bg-white/5">
                  <BiCog />
                  <span>Configurações</span>
                </a>
                <div className="dropdown-divider"></div>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="dropdown-item hover:bg-white/5">
                  <FiGithub />
                  <span>Código fonte</span>
                  <HiOutlineExternalLink className="ml-auto text-gray-400 text-xs" />
                </a>
              </div>
              
              <div className="p-3 mt-1 border-t border-gray-700/20">
                <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg p-3 border border-white/5">
                  <p className="text-xs text-white/90">Atualize para o plano PRO e desbloqueie recursos avançados.</p>
                  <button className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium py-2 px-3 rounded-md shadow-md hover:shadow-lg transition-all hover:translate-y-[-1px] glow-effect">
                    Atualizar agora
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Botão de imagens */}
        {onOpenImageSearch && (
          <button
            onClick={onOpenImageSearch}
            className="glass-component px-3 py-2 rounded-lg flex items-center gap-1.5 text-white text-sm hover:bg-white/5 transition-all glow-effect"
            title="Buscar imagens"
          >
            <BiImage />
            <span className="mobile-hidden">Imagens</span>
          </button>
        )}
      
        {/* Menu de download */}
        <div className="relative" ref={downloadMenuRef}>
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="glass-component px-3 py-2 rounded-lg flex items-center gap-1.5 text-white text-sm hover:bg-white/5 transition-all glow-effect"
            title="Opções de download"
          >
            <BiDownload />
            <span className="mobile-hidden">Baixar</span>
            <HiOutlineChevronDown className="ml-1 text-xs" />
          </button>
          
          {showDownloadMenu && (
            <div className="dropdown-menu glass-component active">
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
        
        <button
          onClick={onReset}
          className="glass-component px-3 py-2 rounded-lg flex items-center gap-1.5 text-white text-sm hover:bg-white/5 transition-all glow-effect"
          title="Reiniciar Editor"
        >
          <BiReset />
          <span className="mobile-hidden">Reiniciar</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
