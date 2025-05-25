
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { File } from '@/types/project';
import { getFileExtension } from '@/utils/fileUtils';
import { Eye, EyeOff, RefreshCw, ExternalLink } from 'lucide-react';

interface PreviewPanelProps {
  files: File[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  files,
  isVisible,
  onToggleVisibility
}) => {
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewType, setPreviewType] = useState<'html' | 'markdown' | 'none'>('none');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    generatePreview();
  }, [files]);

  const generatePreview = () => {
    // Find main HTML file or create a preview
    const htmlFile = files.find(f => getFileExtension(f.name) === 'html');
    const cssFiles = files.filter(f => getFileExtension(f.name) === 'css');
    const jsFiles = files.filter(f => getFileExtension(f.name) === 'js');
    
    if (htmlFile) {
      let html = htmlFile.content;
      
      // Inject CSS files
      if (cssFiles.length > 0) {
        const cssContent = cssFiles.map(f => f.content).join('\n');
        const styleTag = `<style>\n${cssContent}\n</style>`;
        
        if (html.includes('</head>')) {
          html = html.replace('</head>', `${styleTag}\n</head>`);
        } else {
          html = `<head>${styleTag}</head>${html}`;
        }
      }
      
      // Inject JS files
      if (jsFiles.length > 0) {
        const jsContent = jsFiles.map(f => f.content).join('\n');
        const scriptTag = `<script>\n${jsContent}\n</script>`;
        
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${scriptTag}\n</body>`);
        } else {
          html = `${html}\n${scriptTag}`;
        }
      }
      
      setPreviewContent(html);
      setPreviewType('html');
    } else {
      // Try to find a markdown file
      const mdFile = files.find(f => getFileExtension(f.name) === 'md');
      if (mdFile) {
        const markdownHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              h1, h2, h3, h4, h5, h6 { color: #333; }
              code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
              pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
              blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: inherit;">${mdFile.content}</pre>
          </body>
          </html>
        `;
        setPreviewContent(markdownHtml);
        setPreviewType('markdown');
      } else {
        setPreviewContent('');
        setPreviewType('none');
      }
    }
  };

  const refreshPreview = () => {
    generatePreview();
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
      setTimeout(() => {
        if (iframeRef.current) {
          const blob = new Blob([previewContent], { type: 'text/html' });
          iframeRef.current.src = URL.createObjectURL(blob);
        }
      }, 100);
    }
  };

  const openInNewWindow = () => {
    if (previewContent) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(previewContent);
        newWindow.document.close();
      }
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={onToggleVisibility} className="rounded-full">
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full border-l bg-white flex flex-col">
      <div className="p-3 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Preview</h3>
            {previewType !== 'none' && (
              <Badge variant="secondary" className="text-xs">
                {previewType.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={refreshPreview}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={openInNewWindow}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleVisibility}>
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        {previewType === 'none' ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No previewable files</p>
              <p className="text-xs">Create an HTML or Markdown file to see preview</p>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={previewContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        )}
      </div>
    </div>
  );
};
