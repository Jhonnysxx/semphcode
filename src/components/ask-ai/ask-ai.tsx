/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { RiSparkling2Fill } from "react-icons/ri";
import { GrSend } from "react-icons/gr";
import { toast } from "react-toastify";
import { MdPreview } from "react-icons/md";

import { defaultHTML } from "./../../../utils/consts";
import SuccessSound from "./../../assets/success.mp3";

function AskAI({
  html,
  setHtml,
  onScrollToBottom,
  isAiWorking,
  setisAiWorking,
  setView,
}: {
  html: string;
  setHtml: (html: string) => void;
  onScrollToBottom: () => void;
  isAiWorking: boolean;
  setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
  setisAiWorking: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [prompt, setPrompt] = useState("");
  const [hasAsked, setHasAsked] = useState(false);
  const [previousPrompt, setPreviousPrompt] = useState("");

  const audio = new Audio(SuccessSound);
  audio.volume = 0.5;

  const callAi = async () => {
    if (isAiWorking || !prompt.trim()) return;
    setisAiWorking(true);

    let contentResponse = "";
    let lastRenderTime = 0;
    
    try {
      // Usar o endpoint DeepSeek para IA genérica
      console.log("Enviando para /api/deepseek com a pergunta:", prompt);
      const request = await fetch("https://semphcode.onrender.com/api/deepseek", {
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
        
        const reader = request.body.getReader();
        const decoder = new TextDecoder("utf-8");

        const read = async () => {
          const { done, value } = await reader.read();
          if (done) {
            toast.success("AI respondeu com sucesso");
            setPrompt("");
            setPreviousPrompt(prompt);
            setisAiWorking(false);
            setHasAsked(true);
            audio.play();
            setView("preview");

            // Now we have the complete HTML including </html>, so set it to be sure
            const finalDoc = contentResponse.match(
              /<!DOCTYPE html>[\s\S]*<\/html>/
            )?.[0];
            if (finalDoc) {
              setHtml(finalDoc);
            }

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
    }
  };

  return (
    <div
      className={`bg-gray-950 rounded-xl py-2 lg:py-2.5 pl-3.5 lg:pl-4 pr-2 lg:pr-2.5 absolute lg:sticky bottom-3 left-3 lg:bottom-4 lg:left-4 w-[calc(100%-1.5rem)] lg:w-[calc(100%-2rem)] z-10 group ${
        isAiWorking ? "animate-pulse" : ""
      }`}
    >
      {defaultHTML !== html && (
        <button
          className="bg-white lg:hidden -translate-y-[calc(100%+8px)] absolute left-0 top-0 shadow-md text-gray-950 text-xs font-medium py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 border border-gray-100 hover:brightness-150 transition-all duration-100 cursor-pointer"
          onClick={() => setView("preview")}
        >
          <MdPreview />
          Voltar para Prévia
        </button>
      )}
      <div className="w-full relative flex items-center justify-between">
        <RiSparkling2Fill className="text-lg lg:text-xl text-gray-500 group-focus-within:text-pink-500" />
        <input
          type="text"
          disabled={isAiWorking}
          className="w-full bg-transparent max-lg:text-sm outline-none px-3 text-white placeholder:text-gray-500 font-code"
          placeholder={
            hasAsked ? "O que deseja perguntar em seguida?" : "Pergunte à IA qualquer coisa..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              callAi();
            }
          }}
        />
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={isAiWorking}
            className="relative overflow-hidden cursor-pointer flex-none flex items-center justify-center rounded-full text-sm font-semibold size-8 text-center bg-pink-500 hover:bg-pink-400 text-white shadow-sm dark:shadow-highlight/20 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            onClick={callAi}
          >
            <GrSend className="-translate-x-[1px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AskAI;
