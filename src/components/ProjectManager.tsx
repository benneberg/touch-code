
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SupabaseProjectStorage } from '@/utils/supabaseProjectStorage';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectMetadata } from '@/types/project';
import { Plus, Folder, Trash2, Download, Upload, Calendar, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProjectManagerProps {
  onSelectProject: (project: Project) => void;
  onCreateProject: (project: Project) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ onSelectProject, onCreateProject }) => {
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          loadProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await SupabaseProjectStorage.getAllMetadata();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
      console.error('Error loading projects:', error);
    } else {
      setProjects(data);
    }
    setLoading(false);
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    const project: Project = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      files: [],
      createdAt: new Date(),
      lastModified: new Date()
    };

    const { error } = await SupabaseProjectStorage.saveProject(project);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
      console.error('Error creating project:', error);
      return;
    }

    onCreateProject(project);
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateDialog(false);
    
    toast({
      title: "Success",
      description: "Project created successfully"
    });
  };

  const openProject = async (id: string) => {
    const { data: project, error } = await SupabaseProjectStorage.getProject(id);
    
    if (error || !project) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
      console.error('Error loading project:', error);
      return;
    }

    onSelectProject(project);
  };

  const deleteProject = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const { error } = await SupabaseProjectStorage.deleteProject(id);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive"
        });
        console.error('Error deleting project:', error);
        return;
      }

      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
    }
  };

  const exportProject = async (id: string) => {
    const { data: project, error } = await SupabaseProjectStorage.getProject(id);
    
    if (error || !project) {
      toast({
        title: "Error",
        description: "Failed to load project for export",
        variant: "destructive"
      });
      return;
    }

    const dataStr = SupabaseProjectStorage.exportProject(project);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Project exported successfully"
    });
  };

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonString = e.target?.result as string;
        const project = SupabaseProjectStorage.importProject(jsonString);
        project.id = crypto.randomUUID(); // Generate new ID
        project.lastModified = new Date();
        
        const { error } = await SupabaseProjectStorage.saveProject(project);
        
        if (error) {
          toast({
            title: "Error",
            description: "Failed to import project",
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Success",
          description: "Project imported successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Invalid project file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importProject}
            className="hidden"
            id="import-input"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-input')?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start a new coding project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="What does this project do?"
                    rows={3}
                  />
                </div>
                <Button onClick={createProject} className="w-full">
                  Create Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No projects yet. Create your first project!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1" onClick={() => openProject(project.id)}>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="mt-1">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportProject(project.id);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id, project.name);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {project.fileCount} files
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
