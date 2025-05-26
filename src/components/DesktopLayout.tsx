
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectManager } from './ProjectManager';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { WelcomeScreen } from './WelcomeScreen';
import { Project, File } from '@/types/project';
import { getFileType } from '@/utils/fileUtils';
import { 
  ArrowLeft,
  Save,
  Download,
  Eye,
  Moon,
  Sun,
  LogOut,
  User,
  Loader2
} from 'lucide-react';

interface DesktopLayoutProps {
  currentProject: Project | null;
  activeFile: File | null;
  showPreview: boolean;
  theme: 'light' | 'dark';
  saving: boolean;
  userEmail?: string;
  onSelectProject: (project: Project) => void;
  onCreateProject: (project: Project) => void;
  onBackToProjectList: () => void;
  onSelectFile: (file: File) => void;
  onCreateFile: (file: File) => void;
  onDeleteFile: (fileId: string) => void;
  onFileContentChange: (content: string) => void;
  onSaveProject: () => void;
  onExportProject: () => void;
  onTogglePreview: () => void;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  currentProject,
  activeFile,
  showPreview,
  theme,
  saving,
  userEmail,
  onSelectProject,
  onCreateProject,
  onBackToProjectList,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onFileContentChange,
  onSaveProject,
  onExportProject,
  onTogglePreview,
  onToggleTheme,
  onSignOut
}) => {
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        {!currentProject ? (
          <ProjectManager
            onSelectProject={onSelectProject}
            onCreateProject={onCreateProject}
          />
        ) : (
          <>
            {/* Project header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBackToProjectList}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="flex gap-1">
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
                </div>
              </div>
              <div className="mt-2">
                <h2 className="font-semibold">{currentProject.name}</h2>
                {currentProject.description && (
                  <p className="text-sm text-gray-600">{currentProject.description}</p>
                )}
              </div>
            </div>
            
            {/* File explorer */}
            <FileExplorer
              files={currentProject.files}
              activeFileId={activeFile?.id || null}
              onSelectFile={onSelectFile}
              onCreateFile={onCreateFile}
              onDeleteFile={onDeleteFile}
            />
          </>
        )}
        
        {/* User info and sign out */}
        <div className="mt-auto p-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="truncate">{userEmail}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {currentProject && (
          <>
            {/* Editor header */}
            <div className="bg-white border-b p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeFile && (
                  <>
                    <span className="text-lg">{getFileType(activeFile.name).icon}</span>
                    <span className="font-medium">{activeFile.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getFileType(activeFile.name).language}
                    </Badge>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onTogglePreview}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onToggleTheme}
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Editor and preview */}
            <div className="flex-1 flex">
              <div className={showPreview ? 'w-1/2' : 'w-full'}>
                {activeFile ? (
                  <CodeEditor
                    value={activeFile.content}
                    onChange={onFileContentChange}
                    filename={activeFile.name}
                    theme={theme}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Select a file to start editing
                  </div>
                )}
              </div>
              
              {showPreview && (
                <div className="w-1/2">
                  <PreviewPanel
                    files={currentProject.files}
                    isVisible={true}
                    onToggleVisibility={onTogglePreview}
                  />
                </div>
              )}
            </div>
          </>
        )}
        
        {!currentProject && (
          <WelcomeScreen 
            userEmail={userEmail}
            isMobile={false}
            onOpenProjectManager={() => {}}
          />
        )}
      </div>
    </div>
  );
};
