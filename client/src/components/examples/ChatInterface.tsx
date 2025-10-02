import { useState } from 'react';
import ChatInterface from '../ChatInterface';
import { Button } from '@/components/ui/button';

export default function ChatInterfaceExample() {
  const [hasAccess, setHasAccess] = useState(false);
  
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex gap-2 justify-center">
        <Button 
          variant={!hasAccess ? "default" : "outline"}
          onClick={() => setHasAccess(false)}
        >
          Free Chat
        </Button>
        <Button 
          variant={hasAccess ? "default" : "outline"}
          onClick={() => setHasAccess(true)}
        >
          Premium Chat
        </Button>
      </div>
      
      <ChatInterface 
        hasAccess={hasAccess}
        onUpgrade={() => setHasAccess(true)}
      />
    </div>
  );
}