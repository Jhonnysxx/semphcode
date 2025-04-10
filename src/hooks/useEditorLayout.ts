import { RefObject, useEffect, useState } from "react";

interface EditorLayoutProps {
  editorRef: RefObject<HTMLDivElement | null>;
  previewRef: RefObject<HTMLDivElement | null>;
  resizerRef: RefObject<HTMLDivElement | null>;
}

export function useEditorLayout({ editorRef, previewRef, resizerRef }: EditorLayoutProps) {
  const [isResizing, setIsResizing] = useState(false);

  // Resets the layout based on screen size
  const resetLayout = () => {
    if (!editorRef.current || !previewRef.current) return;

    // lg breakpoint is 1024px based on Tailwind defaults
    if (window.innerWidth >= 1024) {
      // Set initial 1/3 - 2/3 sizes for large screens, accounting for resizer width
      const resizerWidth = resizerRef.current?.offsetWidth ?? 8; // w-2 = 0.5rem = 8px
      const availableWidth = window.innerWidth - resizerWidth;
      const initialEditorWidth = availableWidth / 3; // Editor takes 1/3 of space
      const initialPreviewWidth = availableWidth - initialEditorWidth; // Preview takes 2/3
      editorRef.current.style.width = `${initialEditorWidth}px`;
      previewRef.current.style.width = `${initialPreviewWidth}px`;
    } else {
      // Remove inline styles for smaller screens, let CSS flex-col handle it
      editorRef.current.style.width = "";
      previewRef.current.style.width = "";
    }
  };

  // Handles resizing when the user drags the resizer
  const handleResize = (e: MouseEvent) => {
    if (!editorRef.current || !previewRef.current || !resizerRef.current) return;

    const resizerWidth = resizerRef.current.offsetWidth;
    const minWidth = 100; // Minimum width for editor/preview
    const maxWidth = window.innerWidth - resizerWidth - minWidth;

    const editorWidth = e.clientX;
    const clampedEditorWidth = Math.max(
      minWidth,
      Math.min(editorWidth, maxWidth)
    );
    const calculatedPreviewWidth =
      window.innerWidth - clampedEditorWidth - resizerWidth;

    editorRef.current.style.width = `${clampedEditorWidth}px`;
    previewRef.current.style.width = `${calculatedPreviewWidth}px`;
  };

  const handleMouseDown = () => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    // Set initial layout based on window size
    resetLayout();

    // Attach event listeners
    if (!resizerRef.current) return;
    resizerRef.current.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("resize", resetLayout);

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleMouseUp);
      if (resizerRef.current) {
        resizerRef.current.removeEventListener("mousedown", handleMouseDown);
      }
      window.removeEventListener("resize", resetLayout);
    };
  }, []);

  return { isResizing, resetLayout };
} 