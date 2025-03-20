
import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
