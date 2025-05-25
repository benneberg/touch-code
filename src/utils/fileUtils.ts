
import { File } from '@/types/project';

export const FILE_TYPES = {
  'html': { language: 'html', icon: '🌐', color: '#e34c26' },
  'css': { language: 'css', icon: '🎨', color: '#1572b6' },
  'js': { language: 'javascript', icon: '📜', color: '#f7df1e' },
  'jsx': { language: 'javascript', icon: '⚛️', color: '#61dafb' },
  'ts': { language: 'typescript', icon: '📘', color: '#3178c6' },
  'tsx': { language: 'typescript', icon: '⚛️', color: '#3178c6' },
  'py': { language: 'python', icon: '🐍', color: '#3776ab' },
  'md': { language: 'markdown', icon: '📝', color: '#083fa1' },
  'json': { language: 'json', icon: '📋', color: '#000000' },
  'xml': { language: 'xml', icon: '📄', color: '#e37933' },
  'txt': { language: 'plaintext', icon: '📄', color: '#666666' }
};

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || 'txt';
}

export function getFileType(filename: string) {
  const ext = getFileExtension(filename);
  return FILE_TYPES[ext as keyof typeof FILE_TYPES] || FILE_TYPES.txt;
}

export function createNewFile(name: string, type: string = 'txt'): File {
  const templates: Record<string, string> = {
    'html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
    'css': `/* CSS Styles */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}`,
    'js': `// JavaScript
console.log('Hello World!');

function main() {
    // Your code here
}

main();`,
    'jsx': `import React from 'react';

const Component = () => {
    return (
        <div>
            <h1>Hello React!</h1>
        </div>
    );
};

export default Component;`,
    'ts': `// TypeScript
interface Person {
    name: string;
    age: number;
}

const person: Person = {
    name: 'John',
    age: 30
};

console.log(person);`,
    'tsx': `import React from 'react';

interface Props {
    title: string;
}

const Component: React.FC<Props> = ({ title }) => {
    return (
        <div>
            <h1>{title}</h1>
        </div>
    );
};

export default Component;`,
    'py': `# Python
def main():
    print("Hello World!")

if __name__ == "__main__":
    main()`,
    'md': `# Markdown Document

This is a **markdown** file.

## Features
- Easy to write
- Easy to read
- Supports *formatting*

\`\`\`javascript
console.log('Code blocks supported!');
\`\`\``
  };

  return {
    id: Date.now().toString(),
    name,
    content: templates[type] || '',
    type,
    lastModified: new Date()
  };
}

export function validateFileName(name: string): string | null {
  if (!name.trim()) return 'File name cannot be empty';
  if (name.includes('/') || name.includes('\\')) return 'File name cannot contain slashes';
  if (name.length > 100) return 'File name too long';
  return null;
}
