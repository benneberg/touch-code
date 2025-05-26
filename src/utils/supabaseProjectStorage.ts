
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectMetadata, File } from '@/types/project';

// Helper function to convert File to JSON-serializable format
const fileToJson = (file: File) => ({
  id: file.id,
  name: file.name,
  content: file.content,
  type: file.type,
  lastModified: file.lastModified.toISOString()
});

// Helper function to convert JSON back to File
const jsonToFile = (json: any): File => ({
  id: json.id,
  name: json.name,
  content: json.content,
  type: json.type,
  lastModified: new Date(json.lastModified)
});

export class SupabaseProjectStorage {
  static async saveProject(project: Project): Promise<{ error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: 'User not authenticated' };
      }

      const projectData = {
        id: project.id,
        user_id: user.id,
        name: project.name,
        description: project.description,
        files: project.files.map(fileToJson),
        main_file: project.mainFile,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('projects')
        .upsert(projectData);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getProject(id: string): Promise<{ data: Project | null; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return { data: null, error };
      }

      if (!data) {
        return { data: null };
      }

      const files = Array.isArray(data.files) 
        ? data.files.map(jsonToFile)
        : [];

      const project: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        files,
        createdAt: new Date(data.created_at),
        lastModified: new Date(data.updated_at),
        mainFile: data.main_file
      };

      return { data: project };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAllProjects(): Promise<{ data: Project[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        return { data: [], error };
      }

      const projects: Project[] = data.map(item => {
        const files = Array.isArray(item.files) 
          ? item.files.map(jsonToFile)
          : [];

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          files,
          createdAt: new Date(item.created_at),
          lastModified: new Date(item.updated_at),
          mainFile: item.main_file
        };
      });

      return { data: projects };
    } catch (error) {
      return { data: [], error };
    }
  }

  static async deleteProject(id: string): Promise<{ error?: any }> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getAllMetadata(): Promise<{ data: ProjectMetadata[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, created_at, updated_at, files')
        .order('updated_at', { ascending: false });

      if (error) {
        return { data: [], error };
      }

      const metadata: ProjectMetadata[] = data.map(item => {
        const fileCount = Array.isArray(item.files) ? item.files.length : 0;

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          createdAt: new Date(item.created_at),
          lastModified: new Date(item.updated_at),
          fileCount
        };
      });

      return { data: metadata };
    } catch (error) {
      return { data: [], error };
    }
  }

  static exportProject(project: Project): string {
    return JSON.stringify(project, null, 2);
  }

  static importProject(jsonString: string): Project {
    const parsed = JSON.parse(jsonString);
    
    // Convert date strings back to Date objects if needed
    if (typeof parsed.createdAt === 'string') {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (typeof parsed.lastModified === 'string') {
      parsed.lastModified = new Date(parsed.lastModified);
    }
    
    // Convert file lastModified strings back to Date objects
    if (Array.isArray(parsed.files)) {
      parsed.files = parsed.files.map((file: any) => ({
        ...file,
        lastModified: typeof file.lastModified === 'string' 
          ? new Date(file.lastModified) 
          : file.lastModified
      }));
    }
    
    return parsed;
  }
}
