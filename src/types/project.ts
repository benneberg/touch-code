
export interface File {
  id: string;
  name: string;
  content: string;
  type: string;
  lastModified: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: File[];
  createdAt: Date;
  lastModified: Date;
  mainFile?: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModified: Date;
  fileCount: number;
}
