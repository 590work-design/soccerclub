import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePanel = ({ isOpen, onClose }: ProfilePanelProps) => {
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    username: 'admin',
    password: 'password123'
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    // Validate inputs
    if (!profileData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!profileData.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    if (profileData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    toast.success('Profile updated successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Profile Panel */}
      <div className="fixed right-6 top-20 z-50 w-96 rounded-lg border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-card-foreground">Profile Settings</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full"
            />
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-card-foreground">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              placeholder="Enter your username"
              className="w-full"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={profileData.password}
                onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
};
