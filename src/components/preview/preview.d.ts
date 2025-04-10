declare function Preview({ html, isResizing, isAiWorking, setView, ref, onReset }: {
    html: string;
    isResizing: boolean;
    isAiWorking: boolean;
    setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
    ref: React.RefObject<HTMLDivElement | null>;
    onReset: () => void;
}): import("react/jsx-runtime").JSX.Element;
export default Preview;
