import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Factory } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: () => {
      toast({
        title: "Login successful!",
        variant: "success"
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Invalid credentials",
        description: "Please check your username and password.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Factory className="text-white text-2xl w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-hpcl-dark">HPCL</h1>
          <p className="text-gray-600">Kochi LPG Plant</p>
          <p className="text-sm text-gray-500 mt-2">Maintenance Store Inventory System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
