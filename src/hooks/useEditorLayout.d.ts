import { RefObject } from "react";
interface EditorLayoutProps {
    editorRef: RefObject<HTMLDivElement | null>;
    previewRef: RefObject<HTMLDivElement | null>;
    resizerRef: RefObject<HTMLDivElement | null>;
}
export declare function useEditorLayout({ editorRef, previewRef, resizerRef }: EditorLayoutProps): {
    isResizing: boolean;
    resetLayout: () => void;
};
export {};
