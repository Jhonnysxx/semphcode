declare function AskAI({ html, setHtml, onScrollToBottom, isAiWorking, setisAiWorking, setView, }: {
    html: string;
    setHtml: (html: string) => void;
    onScrollToBottom: () => void;
    isAiWorking: boolean;
    setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
    setisAiWorking: React.Dispatch<React.SetStateAction<boolean>>;
}): import("react/jsx-runtime").JSX.Element;
export default AskAI;
