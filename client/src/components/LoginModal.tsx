import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

export default function LoginModal({ open, onOpenChange, onLoginSuccess }: LoginModalProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
    referralCode: ""
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/users/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user?.username || 'User'}!`,
      });
      onOpenChange(false);
      setLoginData({ email: "", password: "" });
      onLoginSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/users/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Account created successfully",
        description: `Welcome to ChatWithMechanic, ${data.username}!`,
      });
      onOpenChange(false);
      setRegisterData({ username: "", email: "", password: "", confirmPassword: "", referralCode: "" });
      onLoginSuccess?.();
    },
    onError: (error: any) => {
      // Parse backend error from format "400: {error message}"
      const errorMessage = error?.message || '';
      let title = "Registration failed";
      let description = "Please try again later";
      
      // Extract actual error message after status code
      const backendError = errorMessage.includes(': ') ? errorMessage.split(': ').slice(1).join(': ') : errorMessage;
      
      try {
        // Try to parse JSON error response
        const errorData = JSON.parse(backendError);
        if (errorData.error === 'Invalid referral code') {
          title = "Invalid Referral Code";
          description = "The referral code you entered is not valid. Please check and try again, or leave it empty.";
        } else if (errorData.error === 'User already exists') {
          title = "Account Already Exists";
          description = "An account with this email already exists. Please try logging in instead.";
        } else if (errorData.error) {
          description = errorData.error;
        }
      } catch (e) {
        // If JSON parsing fails, check plain text
        if (backendError.includes('Invalid referral code')) {
          title = "Invalid Referral Code";
          description = "The referral code you entered is not valid. Please check and try again, or leave it empty.";
        } else if (backendError.includes('User already exists')) {
          title = "Account Already Exists";
          description = "An account with this email already exists. Please try logging in instead.";
        } else if (backendError) {
          description = backendError;
        } else {
          description = "User might already exist or invalid data provided";
        }
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.username || !registerData.email || !registerData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    if (registerData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    const { confirmPassword, ...dataToSend } = registerData;
    registerMutation.mutate(dataToSend);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log In</DialogTitle>
        </DialogHeader>

        <div className="w-full">
          <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  data-testid="input-login-email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  data-testid="input-login-password"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login-submit"
              >
                {loginMutation.isPending ? "Logging in..." : "Log In"}
              </Button>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}