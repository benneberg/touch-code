
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, User } from 'lucide-react';

interface WelcomeScreenProps {
  userEmail?: string;
  isMobile?: boolean;
  onOpenProjectManager: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userEmail,
  isMobile = false,
  onOpenProjectManager
}) => {
  if (isMobile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <FolderOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Welcome to TouchCode</h2>
          <p className="text-gray-600 mb-2">Signed in as: {userEmail}</p>
          <p className="text-gray-600 mb-4">A full-featured code editor for your phone</p>
          <Button onClick={onOpenProjectManager}>
            Open Project Manager
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-8">
        <FolderOpen className="h-24 w-24 mx-auto text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold mb-4">TouchCode</h1>
        <p className="text-xl text-gray-600 mb-2">
          Welcome, {userEmail}!
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
  );
};
