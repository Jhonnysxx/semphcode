import React, { useState, useRef, useEffect } from "react";
import { RiSparkling2Fill } from "react-icons/ri";
import { GrSend } from "react-icons/gr";
import { FaUser, FaRobot, FaCheckCircle, FaCode, FaQuestion, FaInfo, FaImage } from "react-icons/fa";
import { defaultHTML } from "../../utils/consts";
import SuccessSound from "../../assets/success.mp3";
import { toast } from "react-toastify";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "code" | "chat" | "info";
}

interface ChatInterfaceProps {
  html: string;
  setHtml: (html: string) => void;
  onScrollToBottom: () => void;
  isAiWorking: boolean;
  setisAiWorking: React.Dispatch<React.SetStateAction<boolean>>;
  setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
  onOpenImageSearch?: () => void;
}

function ChatInterface({
  html,
  setHtml,
  onScrollToBottom,
  isAiWorking,
  setisAiWorking,
  setView,
  onOpenImageSearch,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de programação. Posso ajudar a criar sites e responder suas dúvidas sobre desenvolvimento e tecnologia. Descreva o que deseja construir ou faça qualquer pergunta!",
      timestamp: new Date(),
      type: "info"
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [previousPrompt, setPreviousPrompt] = useState("");
  const [chatMode, setChatMode] = useState<"code" | "chat">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audio = new Audio(SuccessSound);
  audio.volume = 0.5;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função para determinar se a mensagem é uma pergunta sobre programação/desenvolvimento
  const isProgrammingQuestion = (text: string): boolean => {
    // Lista de palavras-chave para detecção de solicitações de código (não de perguntas)
    const codeGenerationKeywords = [
      "crie", "criar", "gere", "gerar", "desenvolva", "desenvolver", 
      "construa", "construir", "implemente", "implementar", "faça", "fazer",
      "site", "página", "webpage", "landing page", "aplicativo", "app",
      "layout", "template", "design", "interface", "ui", "ux", "componente",
      "html", "css", "javascript", "create", "generate", "build", "develop",
      "implement", "make", "website", "page", "application"
    ];

    const lowercaseText = text.toLowerCase();
    
    // Se contém palavras-chave de geração de código, não é uma pergunta para chat
    const isCodeRequest = codeGenerationKeywords.some(keyword => 
      lowercaseText.includes(keyword)
    );
    
    // Se tem ponto de interrogação, provavelmente é uma pergunta
    const hasQuestionMark = lowercaseText.includes('?');
    
    // Se começa com "como", "o que", "por que", "qual", é provavelmente uma pergunta
    const startsWithQuestion = /^(como|o que|por que|qual|quando|onde|quem|why|what|how|when|where|who|which)/i.test(lowercaseText);
    
    // Se tem palavras específicas de comando para gerar um site, não é pergunta
    const hasWebsiteCommands = /crie (um|uma) (site|página|aplicativo|app|layout)/i.test(lowercaseText) || 
                              /create (a|an) (website|page|app|application|layout)/i.test(lowercaseText);
    
    // Se é uma solicitação explícita de código
    if (hasWebsiteCommands || 
        lowercaseText.includes("quero um site") || 
        lowercaseText.includes("i want a website") ||
        lowercaseText.includes("preciso de um site") ||
        lowercaseText.includes("i need a website")) {
      return false; // Não é pergunta para chat
    }
    
    // Se tem ponto de interrogação ou começa com palavra de pergunta, provavelmente é chat
    if (hasQuestionMark || startsWithQuestion) {
      return true; // É pergunta para chat
    }
    
    // Se não tem indicadores claros mas parece solicitação de código
    if (isCodeRequest) {
      return false; // Não é pergunta para chat
    }
    
    // Por padrão, tratar como chat em vez de código
    return true;
  };

  const callAi = async () => {
    if (isAiWorking || !prompt.trim()) return;
    
    // Determina o tipo de mensagem baseado no modo atual e conteúdo
    const messageType = chatMode === "code" && !isProgrammingQuestion(prompt) ? "code" : "chat";
    
    // Adiciona a mensagem do usuário imediatamente
    const userMessage: Message = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
      type: messageType
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setisAiWorking(true);
    
    if (messageType === "chat") {
      // Resposta para modo chat com foco em programação
      try {
        // Adiciona uma mensagem temporária da IA
        const aiMessage: Message = {
          role: "assistant",
          content: "Estou processando sua pergunta...",
          timestamp: new Date(),
          type: "chat"
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        
        // Usando endpoint diferente para perguntas de chat
        const request = await fetch("/api/chat", {
          method: "POST",
          body: JSON.stringify({
            prompt,
            context: "You are a helpful programming assistant. Your specialty is programming and software development, but you can answer general questions as well. Respond in the same language the user uses. If the question is about programming, provide detailed and accurate information."
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!request.ok) {
          const errorResponse = await request.json();
          throw new Error(errorResponse.message || "Erro na comunicação com a IA");
        }
        
        const response = await request.json();
        
        // Atualiza a mensagem da IA com a resposta
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          if (newMessages[newMessages.length - 1].role === "assistant") {
            newMessages[newMessages.length - 1].content = response.content;
          }
          return newMessages;
        });
        
        setPrompt("");
        setisAiWorking(false);
        audio.play();
        
      } catch (error: any) {
        setisAiWorking(false);
        const errorMessage = error.message || "Erro desconhecido ao processar pergunta";
        toast.error(errorMessage);
        console.error("Erro no modo chat:", error);
        
        // Atualiza a mensagem da IA com o erro
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          if (newMessages[newMessages.length - 1].role === "assistant") {
            newMessages[newMessages.length - 1].content = `❌ Ocorreu um erro: ${errorMessage}. Lembre-se que estou focado em responder sobre programação e desenvolvimento.`;
          }
          return newMessages;
        });
      }
      
      return;
    }
    
    // Modo código - manter o comportamento existente
    let contentResponse = "";
    let lastRenderTime = 0;
    
    try {
      // Usar o endpoint DeepSeek
      const request = await fetch("/api/deepseek", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          ...(html === defaultHTML ? {} : { html }),
          ...(previousPrompt ? { previousPrompt } : {}),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (request && request.body) {
        if (!request.ok) {
          try {
            const res = await request.json();
            toast.error(res.message || "Erro na solicitação à API");
          } catch (parseError) {
            toast.error("Falha ao conectar com a API Deepseek. Verifique se a chave API é válida.");
            console.error("Erro de parse JSON:", parseError);
          }
          setisAiWorking(false);
          return;
        }
        
        // Adiciona uma mensagem temporária da IA
        const aiMessage: Message = {
          role: "assistant",
          content: "Estou processando sua solicitação...",
          timestamp: new Date(),
          type: "code"
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        
        const reader = request.body.getReader();
        const decoder = new TextDecoder("utf-8");

        const read = async () => {
          const { done, value } = await reader.read();
          if (done) {
            setPrompt("");
            setPreviousPrompt(prompt);
            setisAiWorking(false);
            audio.play();
            setView("preview");

            // Atualiza a mensagem da IA com um texto de conclusão
            setMessages((prevMessages) => {
              const newMessages = [...prevMessages];
              // A última mensagem é a da IA
              if (newMessages[newMessages.length - 1].role === "assistant") {
                newMessages[newMessages.length - 1].content = "✅ Código gerado com sucesso! Confira o resultado na prévia ao lado.";
              }
              return newMessages;
            });

            // Now we have the complete HTML including </html>, so set it to be sure
            const finalDoc = contentResponse.match(
              /<!DOCTYPE html>[\s\S]*<\/html>/
            )?.[0];
            if (finalDoc) {
              setHtml(finalDoc);
            }

            toast.success("IA respondeu com sucesso");
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          contentResponse += chunk;
          const newHtml = contentResponse.match(/<!DOCTYPE html>[\s\S]*/)?.[0];
          if (newHtml) {
            // Force-close the HTML tag so the iframe doesn't render half-finished markup
            let partialDoc = newHtml;
            if (!partialDoc.includes("</html>")) {
              partialDoc += "\n</html>";
            }

            // Throttle the re-renders to avoid flashing/flicker
            const now = Date.now();
            if (now - lastRenderTime > 300) {
              setHtml(partialDoc);
              lastRenderTime = now;
            }

            if (partialDoc.length > 200) {
              onScrollToBottom();
            }
          }
          read();
        };

        read();
      }
    } catch (error: any) {
      setisAiWorking(false);
      const errorMessage = error.message || "Erro desconhecido ao chamar a API";
      toast.error(errorMessage);
      console.error("Erro na chamada da API:", error);
      
      // Atualiza a mensagem da IA com o erro
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        // A última mensagem é a da IA
        if (newMessages[newMessages.length - 1].role === "assistant") {
          newMessages[newMessages.length - 1].content = `❌ Ocorreu um erro: ${errorMessage}`;
        }
        return newMessages;
      });
    }
  };

  // Função para formatar a data de mensagem
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Função para alternar entre modos de chat
  const toggleChatMode = () => {
    setChatMode(prevMode => prevMode === "code" ? "chat" : "code");
    toast.info(chatMode === "code" 
      ? "Modo chat ativado! Faça perguntas sobre programação." 
      : "Modo código ativado! Descreva o site que deseja criar.");
  };

  // Função para renderizar o ícone adequado com base no tipo de mensagem
  const getMessageIcon = (type?: string) => {
    switch(type) {
      case "code": return <FaCode size={15} />;
      case "chat": return <FaQuestion size={15} />;
      case "info": return <FaInfo size={15} />;
      default: return <FaRobot size={15} />;
    }
  };

  return (
    <div className="chat-interface" ref={chatContainerRef}>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.role === "user" ? "user" : "assistant"
            }`}
          >
            <div className="chat-avatar glass-avatar">
              {message.role === "user" ? (
                <FaUser size={15} />
              ) : (
                getMessageIcon(message.type)
              )}
            </div>
            <div className="chat-content">
              <div className="chat-bubble">
                {message.content}
              </div>
              <div className="chat-time">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="chat-tools">
          <button
            className={`chat-mode-toggle ${chatMode === "chat" ? "chat-mode" : "code-mode"}`}
            onClick={toggleChatMode}
            title={
              chatMode === "code"
                ? "Modo de código - Descreva o site que deseja criar"
                : "Modo chat - Faça perguntas sobre programação"
            }
          >
            {chatMode === "chat" ? <FaQuestion size={14} /> : <FaCode size={14} />}
            <span>
              {chatMode === "chat" ? "Chat" : "Código"}
            </span>
          </button>
          
          {onOpenImageSearch && (
            <button
              className="image-search-button"
              onClick={onOpenImageSearch}
              title="Buscar imagens para usar no seu projeto"
              disabled={isAiWorking}
            >
              <FaImage size={14} />
              <span>Imagens</span>
            </button>
          )}
        </div>
        
        <div className="input-container">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              chatMode === "chat"
                ? "Faça uma pergunta sobre programação ou desenvolvimento..."
                : "Descreva o site ou aplicação que você quer criar..."
            }
            disabled={isAiWorking}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                callAi();
              }
            }}
          />
          <button
            className={`send-button ${isAiWorking ? "working" : ""}`}
            onClick={callAi}
            disabled={isAiWorking || !prompt.trim()}
          >
            {isAiWorking ? (
              <RiSparkling2Fill className="animate-spin" />
            ) : (
              <GrSend />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface; 