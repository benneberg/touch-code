
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileCodeEditor } from '@/components/MobileCodeEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Code, Smartphone, User, LogIn } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Code className="h-12 w-12 mx-auto animate-pulse text-blue-600 mb-4" />
          <p>Loading TouchCode...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Code className="h-12 w-12 text-blue-600" />
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold mb-2">TouchCode</CardTitle>
            <CardDescription className="text-lg">
              A powerful code editor designed for mobile development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Features</h3>
                <div className="grid gap-2 text-sm text-gray-600 text-left">
                  <p>✨ Touch-optimized Monaco Editor</p>
                  <p>📱 Responsive design for all devices</p>
                  <p>💾 Cloud storage with local backup</p>
                  <p>👀 Live preview for web projects</p>
                  <p>📦 Import/export functionality</p>
                  <p>🔐 Secure user accounts</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/auth')} size="lg" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')} variant="outline" size="lg" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <MobileCodeEditor />;
};

export default Index;
