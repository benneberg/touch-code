
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ProjectManager } from './ProjectManager';
import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { SupabaseProjectStorage } from '@/utils/supabaseProjectStorage';
import { supabase } from '@/integrations/supabase/client';
import { Project, File } from '@/types/project';
import { getFileType } from '@/utils/fileUtils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Menu, 
  FolderOpen, 
  Save, 
  Eye, 
  Moon, 
  Sun, 
  Settings,
  ArrowLeft,
  Download,
  LogOut,
  User,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const MobileCodeEditor: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobile, setIsMobile] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!currentProject) return;

    // Set up real-time subscription for the current project
    const channel = supabase
      .channel(`project-${currentProject.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${currentProject.id}`
        },
        async (payload) => {
          // Reload project data when it's updated by another client
          const { data: updatedProject } = await SupabaseProjectStorage.getProject(currentProject.id);
          if (updatedProject) {
            setCurrentProject(updatedProject);
            // Update active file if it still exists
            if (activeFile) {
              const updatedFile = updatedProject.files.find(f => f.id === activeFile.id);
              if (updatedFile) {
                setActiveFile(updatedFile);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProject?.id, activeFile?.id]);

  const saveProject = async () => {
    if (!currentProject) return;

    setSaving(true);
    const updatedProject = {
      ...currentProject,
      lastModified: new Date()
    };

    const { error } = await SupabaseProjectStorage.saveProject(updatedProject);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive"
      });
      console.error('Error saving project:', error);
    } else {
      setCurrentProject(updatedProject);
      toast({
        title: "Success",
        description: "Project saved successfully"
      });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  const handleFileContentChange = (content: string) => {
    if (!activeFile || !currentProject) return;

    const updatedFile = {
      ...activeFile,
      content,
      lastModified: new Date()
    };

    const updatedFiles = currentProject.files.map(f => 
      f.id === activeFile.id ? updatedFile : f
    );

    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      lastModified: new Date()
    };

    setCurrentProject(updatedProject);
    setActiveFile(updatedFile);
  };

  const handleCreateFile = (file: File) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, file],
      lastModified: new Date()
    };

    setCurrentProject(updatedProject);
    setActiveFile(file);
  };

  const handleDeleteFile = (fileId: string) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      files: currentProject.files.filter(f => f.id !== fileId),
      lastModified: new Date()
    };

    setCurrentProject(updatedProject);
    
    if (activeFile?.id === fileId) {
      setActiveFile(updatedProject.files[0] || null);
    }
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setActiveFile(project.files[0] || null);
    setShowProjectManager(false);
  };

  const handleCreateProject = (project: Project) => {
    setCurrentProject(project);
    setActiveFile(null);
    setShowProjectManager(false);
  };

  const exportProject = async () => {
    if (!currentProject) return;
    
    const dataStr = SupabaseProjectStorage.exportProject(currentProject);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Project exported successfully"
    });
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={showProjectManager} onOpenChange={setShowProjectManager}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full p-0">
                <ProjectManager
                  onSelectProject={handleSelectProject}
                  onCreateProject={handleCreateProject}
                />
              </SheetContent>
            </Sheet>
            
            {currentProject && (
              <Sheet open={showFileExplorer} onOpenChange={setShowFileExplorer}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <FileExplorer
                    files={currentProject.files}
                    activeFileId={activeFile?.id || null}
                    onSelectFile={(file) => {
                      setActiveFile(file);
                      setShowFileExplorer(false);
                    }}
                    onCreateFile={handleCreateFile}
                    onDeleteFile={handleDeleteFile}
                  />
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
              <div className="text-sm text-gray-500">TouchCode - {user?.email}</div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {currentProject && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={saveProject}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={exportProject}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {!currentProject ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <FolderOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Welcome to TouchCode</h2>
                <p className="text-gray-600 mb-2">Signed in as: {user?.email}</p>
                <p className="text-gray-600 mb-4">A full-featured code editor for your phone</p>
                <Button onClick={() => setShowProjectManager(true)}>
                  Open Project Manager
                </Button>
              </div>
            </div>
          ) : !activeFile ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-gray-600 mb-4">No file selected</p>
                <Button onClick={() => setShowFileExplorer(true)}>
                  Browse Files
                </Button>
              </div>
            </div>
          ) : showPreview ? (
            <PreviewPanel
              files={currentProject.files}
              isVisible={true}
              onToggleVisibility={() => setShowPreview(false)}
            />
          ) : (
            <CodeEditor
              value={activeFile.content}
              onChange={handleFileContentChange}
              filename={activeFile.name}
              theme={theme}
            />
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        {!currentProject ? (
          <ProjectManager
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
          />
        ) : (
          <>
            {/* Project header */}
            <div className="p-3 border-b">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentProject(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={saveProject}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={exportProject}>
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
              onSelectFile={setActiveFile}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
          </>
        )}
        
        {/* User info and sign out */}
        <div className="mt-auto p-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="truncate">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
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
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
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
                    onChange={handleFileContentChange}
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
                    onToggleVisibility={() => setShowPreview(false)}
                  />
                </div>
              )}
            </div>
          </>
        )}
        
        {!currentProject && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <FolderOpen className="h-24 w-24 mx-auto text-gray-400 mb-6" />
              <h1 className="text-3xl font-bold mb-4">TouchCode</h1>
              <p className="text-xl text-gray-600 mb-2">
                Welcome, {user?.email}!
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Your mobile code editor is ready
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <p>✨ Touch-optimized Monaco Editor</p>
                <p>📱 Responsive design for all devices</p>
                <p>💾 Cloud storage with Supabase</p>
                <p>👀 Live preview for web projects</p>
                <p>📦 Import/export functionality</p>
                <p>🔄 Real-time collaboration ready</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
