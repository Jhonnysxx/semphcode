import React from "react";
interface ChatInterfaceProps {
    html: string;
    setHtml: (html: string) => void;
    onScrollToBottom: () => void;
    isAiWorking: boolean;
    setisAiWorking: React.Dispatch<React.SetStateAction<boolean>>;
    setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
}
declare function ChatInterface({ html, setHtml, onScrollToBottom, isAiWorking, setisAiWorking, setView, }: ChatInterfaceProps): import("react/jsx-runtime").JSX.Element;
export default ChatInterface;
