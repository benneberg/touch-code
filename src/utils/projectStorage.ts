
import { Project, ProjectMetadata } from '@/types/project';

const PROJECTS_KEY = 'code_editor_projects';
const METADATA_KEY = 'code_editor_metadata';

export class ProjectStorage {
  static saveProject(project: Project): void {
    const projects = this.getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    this.updateMetadata(project);
  }

  static getProject(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  static getAllProjects(): Project[] {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static deleteProject(id: string): void {
    const projects = this.getAllProjects().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    
    const metadata = this.getAllMetadata().filter(m => m.id !== id);
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  }

  static getAllMetadata(): ProjectMetadata[] {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : [];
  }

  private static updateMetadata(project: Project): void {
    const metadata = this.getAllMetadata();
    const existingIndex = metadata.findIndex(m => m.id === project.id);
    
    const projectMetadata: ProjectMetadata = {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      lastModified: project.lastModified,
      fileCount: project.files.length
    };
    
    if (existingIndex >= 0) {
      metadata[existingIndex] = projectMetadata;
    } else {
      metadata.push(projectMetadata);
    }
    
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  }

  static exportProject(project: Project): string {
    return JSON.stringify(project, null, 2);
  }

  static importProject(jsonString: string): Project {
    return JSON.parse(jsonString);
  }
}
