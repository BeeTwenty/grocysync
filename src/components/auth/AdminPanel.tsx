
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserPlus } from 'lucide-react';
import CreateUserForm from './CreateUserForm';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateUser, setShowCreateUser] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center bg-secondary/50 p-4 rounded-lg">
        <ShieldCheck className="h-5 w-5 text-primary mr-2" />
        <span>Admin Access Granted</span>
      </div>
      
      {!showCreateUser ? (
        <Button className="w-full" onClick={() => setShowCreateUser(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create New User
        </Button>
      ) : (
        <CreateUserForm 
          onCancel={() => setShowCreateUser(false)} 
          onSuccess={() => setShowCreateUser(false)} 
        />
      )}
      
      <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
        Go to Grocery List
      </Button>
    </div>
  );
};

export default AdminPanel;
