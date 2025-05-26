
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileHeader } from './MobileHeader';
import { DesktopLayout } from './DesktopLayout';
import { WelcomeScreen } from './WelcomeScreen';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { SupabaseProjectStorage } from '@/utils/supabaseProjectStorage';
import { supabase } from '@/integrations/supabase/client';
import { Project, File } from '@/types/project';
import { useAuth } from '@/hooks/useAuth';
import { FolderOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const MobileCodeEditor: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobile, setIsMobile] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
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
      <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden relative">
        <MobileHeader
          currentProject={currentProject}
          activeFile={activeFile}
          showProjectManager={showProjectManager}
          showFileExplorer={showFileExplorer}
          showPreview={showPreview}
          theme={theme}
          saving={saving}
          userEmail={user?.email}
          onShowProjectManager={setShowProjectManager}
          onShowFileExplorer={setShowFileExplorer}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onSelectFile={setActiveFile}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onSaveProject={saveProject}
          onExportProject={exportProject}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          onSignOut={handleSignOut}
        />

        {/* Content */}
        <div className="flex-1 relative mt-16 overflow-hidden">
          {!currentProject ? (
            <div className="h-full overflow-y-auto overscroll-contain">
              <WelcomeScreen 
                userEmail={user?.email}
                isMobile={true}
                onOpenProjectManager={() => setShowProjectManager(true)}
              />
            </div>
          ) : !activeFile ? (
            <div className="h-full flex items-center justify-center overflow-hidden">
              <div className="text-center p-4">
                <p className="text-gray-600 mb-4">No file selected</p>
                <Button onClick={() => setShowFileExplorer(true)}>
                  Browse Files
                </Button>
              </div>
            </div>
          ) : showPreview ? (
            <div className="h-full overflow-hidden">
              <PreviewPanel
                files={currentProject.files}
                isVisible={true}
                onToggleVisibility={() => setShowPreview(false)}
              />
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              <CodeEditor
                value={activeFile.content}
                onChange={handleFileContentChange}
                filename={activeFile.name}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <DesktopLayout
      currentProject={currentProject}
      activeFile={activeFile}
      showPreview={showPreview}
      theme={theme}
      saving={saving}
      userEmail={user?.email}
      onSelectProject={handleSelectProject}
      onCreateProject={handleCreateProject}
      onBackToProjectList={() => setCurrentProject(null)}
      onSelectFile={setActiveFile}
      onCreateFile={handleCreateFile}
      onDeleteFile={handleDeleteFile}
      onFileContentChange={handleFileContentChange}
      onSaveProject={saveProject}
      onExportProject={exportProject}
      onTogglePreview={() => setShowPreview(!showPreview)}
      onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      onSignOut={handleSignOut}
    />
  );
};
