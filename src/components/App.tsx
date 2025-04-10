import { useRef, useState, useEffect } from "react";
import classNames from "classnames";
import { editor } from "monaco-editor";
import { useEvent, useLocalStorage } from "react-use";
import { toast } from "react-toastify";

import Preview from "./preview/preview";
import { useEditorLayout } from "../hooks/useEditorLayout";
import ChatInterface from "./chat/ChatInterface";
import { defaultHTML } from "../utils/consts";
import Header from "./header/header";
import ImageSearch from "./image-search/ImageSearch";
import { ImageResult } from "../utils/functions/imageApis.d";

function App() {
  // Refs
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // State
  const [htmlStorage, , removeHtmlStorage] = useLocalStorage("html_content");
  const [error, setError] = useState(false);
  const [html, setHtml] = useState((htmlStorage as string) ?? defaultHTML);
  const [isAiWorking, setisAiWorking] = useState(false);
  const [currentView, setCurrentView] = useState<"editor" | "preview">("editor");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showImageSearch, setShowImageSearch] = useState(false);

  // Custom hooks
  const { isResizing } = useEditorLayout({
    editorRef,
    previewRef,
    resizerRef
  });

  // Esconder a mensagem de boas-vindas após 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Prevent accidental navigation away when AI is working or content has changed
  useEvent("beforeunload", (e) => {
    if (isAiWorking || html !== defaultHTML) {
      e.preventDefault();
      return "";
    }
  });

  // Handle reset action
  const handleReset = () => {
    if (isAiWorking) {
      toast.warn("Aguarde a IA terminar de trabalhar.");
      return;
    }
    if (window.confirm("Você vai reiniciar o editor. Tem certeza?")) {
      setHtml(defaultHTML);
      setError(false);
      removeHtmlStorage();
      if (monacoEditorRef.current) {
        monacoEditorRef.current.revealLine(
          monacoEditorRef.current.getModel()?.getLineCount() ?? 0
        );
      }
    }
  };

  // Handle selected image from ImageSearch
  const handleSelectImage = (image: ImageResult) => {
    // Inserir a imagem no HTML
    const imgTag = `<img src="${image.url}" alt="${image.alt}" class="img-fluid" />`;
    
    // Adicionar atribuição se tiver informações do fotógrafo
    let attribution = '';
    if (image.photographer && image.photographerUrl) {
      attribution = `\n<!-- Foto por <a href="${image.photographerUrl}" target="_blank" rel="noopener">${image.photographer}</a> via ${image.source} -->`;
    }
    
    // Encontrar um bom lugar para inserir a imagem (antes do fechamento do body)
    const bodyCloseIndex = html.lastIndexOf('</body>');
    
    if (bodyCloseIndex !== -1) {
      const newHtml = html.slice(0, bodyCloseIndex) + 
        `\n  <div class="image-container">\n    ${imgTag}${attribution}\n  </div>\n` + 
        html.slice(bodyCloseIndex);
      
      setHtml(newHtml);
      toast.success('Imagem adicionada com sucesso!');
    } else {
      // Fallback se não encontrar o fechamento do body
      const newHtml = html + `\n<div class="image-container">\n  ${imgTag}${attribution}\n</div>`;
      setHtml(newHtml);
      toast.success('Imagem adicionada com sucesso!');
    }
    
    // Fechar o modal de busca de imagens
    setShowImageSearch(false);
  };

  return (
    <div className="container-app">
      {/* Mensagem de boas-vindas */}
      {showWelcome && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 fade-in">
          <div className="glass-component flex items-center gap-3 px-5 py-3.5 rounded-full shadow-lg glow-effect">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">👋</span>
            </div>
            <p className="text-white text-sm">Bem-vindo ao Editor HTML com IA!</p>
            <button 
              className="text-gray-400 hover:text-white transition-colors ml-2"
              onClick={() => setShowWelcome(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      {/* Efeitos de fundo aprimorados para glassmorphism */}
      <div className="absolute inset-0 bg-[#121212] pointer-events-none overflow-hidden">
        {/* Gradientes suaves e mais intensos para glassmorphism */}
        <div className="absolute top-0 left-0 w-[900px] h-[900px] bg-purple-600/10 rounded-full filter blur-[150px] opacity-70 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-blue-600/10 rounded-full filter blur-[150px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-pink-600/8 rounded-full filter blur-[150px] opacity-50 animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Grade mais sutil para efeito de vidro */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)]"></div>
        
        {/* Partículas brilhantes para dar profundidade */}
        <div className="absolute top-[5%] left-[10%] w-1.5 h-1.5 bg-white/40 rounded-full"></div>
        <div className="absolute top-[25%] left-[85%] w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-[75%] left-[15%] w-1.5 h-1.5 bg-white/30 rounded-full"></div>
        <div className="absolute top-[85%] left-[40%] w-2 h-2 bg-white/40 rounded-full"></div>
        <div className="absolute top-[35%] left-[75%] w-1.5 h-1.5 bg-white/40 rounded-full"></div>
        <div className="absolute top-[45%] left-[8%] w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute top-[15%] left-[50%] w-3 h-3 bg-blue-500/20 rounded-full filter blur-[2px]"></div>
        <div className="absolute top-[60%] left-[65%] w-3 h-3 bg-purple-500/20 rounded-full filter blur-[2px]"></div>
        
        {/* Linhas de conexão */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3a7bd5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7a60ff" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <line x1="5%" y1="10%" x2="30%" y2="40%" stroke="url(#line-gradient)" strokeWidth="0.5" />
            <line x1="85%" y1="15%" x2="60%" y2="35%" stroke="url(#line-gradient)" strokeWidth="0.5" />
            <line x1="10%" y1="75%" x2="35%" y2="60%" stroke="url(#line-gradient)" strokeWidth="0.5" />
            <line x1="80%" y1="80%" x2="65%" y2="60%" stroke="url(#line-gradient)" strokeWidth="0.5" />
          </svg>
        </div>
      </div>
      
      {/* Header no topo */}
      <Header 
        onReset={handleReset} 
        html={html} 
        onOpenImageSearch={() => setShowImageSearch(true)}
      />
      
      {/* Conteúdo principal (editor + preview) */}
      <div className="overflow-container">
        <div className="flex-content">
          <div
            ref={editorRef}
            className={classNames(
              "editor-container relative z-10 flex flex-col overflow-container",
              {
                "max-lg:h-0": currentView === "preview",
              }
            )}
          >
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                html={html}
                setHtml={setHtml}
                isAiWorking={isAiWorking}
                setisAiWorking={setisAiWorking}
                setView={setCurrentView}
                onScrollToBottom={() => {
                  if (monacoEditorRef.current) {
                    monacoEditorRef.current.revealLine(
                      monacoEditorRef.current.getModel()?.getLineCount() ?? 0
                    );
                  }
                }}
                onOpenImageSearch={() => setShowImageSearch(true)}
              />
            </div>
          </div>
          <div
            ref={resizerRef}
            className="resizer h-full z-20"
          />
          <Preview
            html={html}
            isResizing={isResizing}
            isAiWorking={isAiWorking}
            ref={previewRef}
            setView={setCurrentView}
            onReset={handleReset}
          />
        </div>
      </div>
      
      {/* Modal de busca de imagens */}
      {showImageSearch && (
        <ImageSearch
          onSelectImage={handleSelectImage}
          onClose={() => setShowImageSearch(false)}
        />
      )}
    </div>
  );
}

export default App; 