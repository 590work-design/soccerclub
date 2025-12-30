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
import logo from '@/assets/logo.svg';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e293b] via-[#1a2b5e] to-[#0f172a] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-yellow-500/5 blur-[100px]" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500 hover:shadow-3xl transition-shadow">
        {/* Accent Bar */}
        <div className="h-1 w-full bg-[#d4af37]" />

        <CardHeader className="text-center space-y-2 pt-8 pb-6">
          <div className="mx-auto h-32 w-auto flex items-center justify-center mb-6">
            <img src={logo} alt="Sportlink Club" className="h-full w-auto object-contain drop-shadow-sm" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#1a2b5e]">
            Welcome back
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Sign in to access the volunteer portal
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1a2b5e] font-medium">Email address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 text-base bg-muted/30 border-input group-hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#1a2b5e] font-medium">Password</Label>
                <a href="#" className="text-xs font-medium text-primary hover:underline hover:text-primary/80">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 text-base bg-muted/30 border-input group-hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold shadow-md bg-[#1a2b5e] hover:bg-[#2a3f7e] active:scale-[0.99] transition-all mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>


      </Card>

      {/* Footer Branding on background */}
      <div className="absolute bottom-6 left-0 w-full text-center text-white/30 text-sm font-light">
        Empowering Volunteers
      </div>
    </div>
  );
};

export default Login;