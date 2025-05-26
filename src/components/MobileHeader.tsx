
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ProjectManager } from './ProjectManager';
import { FileExplorer } from './FileExplorer';
import { Project, File } from '@/types/project';
import { getFileType } from '@/utils/fileUtils';
import { 
  Menu, 
  FolderOpen, 
  Save, 
  Eye, 
  Moon, 
  Sun, 
  Download,
  LogOut,
  Loader2
} from 'lucide-react';

interface MobileHeaderProps {
  currentProject: Project | null;
  activeFile: File | null;
  showProjectManager: boolean;
  showFileExplorer: boolean;
  showPreview: boolean;
  theme: 'light' | 'dark';
  saving: boolean;
  userEmail?: string;
  onShowProjectManager: (show: boolean) => void;
  onShowFileExplorer: (show: boolean) => void;
  onSelectProject: (project: Project) => void;
  onCreateProject: (project: Project) => void;
  onSelectFile: (file: File) => void;
  onCreateFile: (file: File) => void;
  onDeleteFile: (fileId: string) => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onTogglePreview: () => void;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentProject,
  activeFile,
  showProjectManager,
  showFileExplorer,
  showPreview,
  theme,
  saving,
  userEmail,
  onShowProjectManager,
  onShowFileExplorer,
  onSelectProject,
  onCreateProject,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onSaveProject,
  onExportProject,
  onTogglePreview,
  onToggleTheme,
  onSignOut
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 shadow-md">
      <div className="bg-white border-b p-2 flex items-center justify-between touch-none">
        <div className="flex items-center gap-2">
          <Sheet open={showProjectManager} onOpenChange={onShowProjectManager}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full p-0 overflow-hidden">
              <div className="h-full overflow-y-auto overscroll-contain">
                <ProjectManager
                  onSelectProject={onSelectProject}
                  onCreateProject={onCreateProject}
                />
              </div>
            </SheetContent>
          </Sheet>
          
          {currentProject && (
            <Sheet open={showFileExplorer} onOpenChange={onShowFileExplorer}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 overflow-hidden">
                <div className="h-full overflow-y-auto overscroll-contain">
                  <FileExplorer
                    files={currentProject.files}
                    activeFileId={activeFile?.id || null}
                    onSelectFile={(file) => {
                      onSelectFile(file);
                      onShowFileExplorer(false);
                    }}
                    onCreateFile={onCreateFile}
                    onDeleteFile={onDeleteFile}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        <div className="flex-1 text-center">
          {currentProject ? (
            <div>
              <div className="font-medium text-sm">{currentProject.name}</div>
              {activeFile && (
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <span>{getFileType(activeFile.name).icon}</span>
                  <span>{activeFile.name}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">TouchCode - {userEmail}</div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {currentProject && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSaveProject}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onExportProject}>
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onTogglePreview}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleTheme}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
