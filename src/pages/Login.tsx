// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { api } from '@/services/api'; // ADDED: import api to call auth.login (calls FastAPI)

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!formData.password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // ADDED: call the FastAPI login endpoint via api.auth.login
    // Reason: replace the simulated setTimeout with a real API call that
    // returns an access token (FastAPI expects form-url-encoded fields).
    try {
      // FastAPI login expects 'username' (per your OpenAPI screenshot).
      const resp = await api.auth.login({
        username: formData.email,
        password: formData.password
      });

      // ADDED: robust extraction of token and token type to handle slight variations
      // in backend response shapes (e.g. { access_token }, { data: { access_token } }, { token }).
      const anyResp = resp as any;
      const token = anyResp?.access_token ?? anyResp?.data?.access_token ?? anyResp?.token;
      const tokenType = anyResp?.token_type ?? 'bearer';

      if (token) {
        // ADDED: store token in sessionStorage for subsequent API calls
        // Reason: token will be used by other fetch calls (Authorization header)
        sessionStorage.setItem('token', token);
        // ADDED: optionally store token type (useful if backend isn't bearer)
        sessionStorage.setItem('token_type', tokenType);
        // ADDED: save entire auth response for debugging / future use
        sessionStorage.setItem('auth', JSON.stringify(anyResp));

        // Optionally store user info if backend returns it, otherwise store email
        const user = anyResp?.user ?? { email: formData.email };
        sessionStorage.setItem('user', JSON.stringify(user));

        toast.success('Signed in');
        navigate('/dashboard');
      } else {
        // If backend returns other shape, adapt here as needed
        toast.error('Login failed: no token returned');
      }
    } catch (err: any) {
      // ADDED: improved console logging and user toast for backend error messages
      console.error('Login error', err);
      const msg = err?.message ?? (err?.toString ? err.toString() : 'Login failed');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }

    // NOTE: previously this used a setTimeout to simulate API. That has been removed.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Volunteer Dashboard
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;