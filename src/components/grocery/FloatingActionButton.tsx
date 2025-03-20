
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 md:hidden">
      <Button 
        onClick={onClick} 
        className="glass border-none h-14 w-14 rounded-full bg-primary text-white shadow-lg" 
        size="icon"
      >
        <PlusCircle className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default FloatingActionButton;
