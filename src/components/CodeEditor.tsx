
import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { getFileType } from '@/utils/fileUtils';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  filename: string;
  theme?: 'light' | 'dark';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  filename,
  theme = 'light'
}) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileType = getFileType(filename);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent zoom on touch devices
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // Prevent pinch zoom
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      const timeSinceLastTouch = now - (container as any).lastTouchTime || 0;
      
      if (timeSinceLastTouch < 300 && timeSinceLastTouch > 0) {
        e.preventDefault(); // Prevent double-tap zoom
      }
      
      (container as any).lastTouchTime = now;
    };

    const handleGestureStart = (e: Event) => {
      e.preventDefault(); // Prevent gesture-based zooming
    };

    // Add touch event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('gesturestart', handleGestureStart, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('gesturestart', handleGestureStart);
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure editor for mobile with disabled zoom
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 22,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      padding: { top: 10, bottom: 10 },
      folding: false,
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      mouseWheelZoom: false, // Disable zoom
      contextmenu: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8
      }
    });

    // Mobile-specific configurations
    if ('ontouchstart' in window) {
      editor.updateOptions({
        quickSuggestions: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'smart',
        tabCompletion: 'on',
        wordBasedSuggestions: 'allDocuments',
        parameterHints: { enabled: true },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        formatOnPaste: true,
        formatOnType: true
      });
    }

    // Add additional touch event handling to the editor DOM
    const editorDom = editor.getDomNode();
    if (editorDom) {
      editorDom.style.touchAction = 'pan-y pan-x'; // Only allow panning, no zoom
    }
  };

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-full w-full flex-1 relative overflow-hidden"
      style={{ 
        touchAction: 'pan-y pan-x',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <Editor
        height="100%"
        language={fileType.language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          fontSize: 14,
          lineHeight: 22,
          padding: { top: 10, bottom: 10 },
          mouseWheelZoom: false, // Disable zoom
          overviewRulerLanes: 0
        }}
      />
    </div>
  );
};
