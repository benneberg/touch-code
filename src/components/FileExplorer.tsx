
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { File } from '@/types/project';
import { FILE_TYPES, getFileType, createNewFile, validateFileName } from '@/utils/fileUtils';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileExplorerProps {
  files: File[];
  activeFileId: string | null;
  onSelectFile: (file: File) => void;
  onCreateFile: (file: File) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('html');

  const createFile = () => {
    const validation = validateFileName(newFileName);
    if (validation) {
      toast({
        title: "Error",
        description: validation,
        variant: "destructive"
      });
      return;
    }

    // Check if file already exists
    if (files.some(f => f.name.toLowerCase() === newFileName.toLowerCase())) {
      toast({
        title: "Error",
        description: "File with this name already exists",
        variant: "destructive"
      });
      return;
    }

    const fileExtension = newFileType;
    const fullFileName = newFileName.includes('.') ? newFileName : `${newFileName}.${fileExtension}`;
    
    const file = createNewFile(fullFileName, fileExtension);
    onCreateFile(file);
    setNewFileName('');
    setNewFileType('html');
    setShowCreateDialog(false);
    
    toast({
      title: "Success",
      description: "File created successfully"
    });
  };

  const deleteFile = (fileId: string, fileName: string) => {
    if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
      onDeleteFile(fileId);
      toast({
        title: "Success",
        description: "File deleted successfully"
      });
    }
  };

  return (
    <div className="w-full border-r bg-gray-50 flex flex-col">
      <div className="p-3 border-b">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm">Files</h3>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
                <DialogDescription>
                  Add a new file to your project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">File Name</label>
                  <Input
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="index.html"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">File Type</label>
                  <Select value={newFileType} onValueChange={setNewFileType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(FILE_TYPES).map(([ext, info]) => (
                        <SelectItem key={ext} value={ext}>
                          <div className="flex items-center gap-2">
                            <span>{info.icon}</span>
                            <span>{ext.toUpperCase()}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createFile} className="w-full">
                  Create File
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No files yet
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {files.map((file) => {
              const fileType = getFileType(file.name);
              const isActive = file.id === activeFileId;
              
              return (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer text-sm group ${
                    isActive 
                      ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectFile(file)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base">{fileType.icon}</span>
                    <span className="truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id, file.name);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
