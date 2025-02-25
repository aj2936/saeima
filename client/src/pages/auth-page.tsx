import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "" });

  // Redirect if already logged in
  if (user) {
    setTimeout(() => setLocation("/vote"), 0);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Piereģistrējies un balso
        </h1>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Pieslēgties</TabsTrigger>
                <TabsTrigger value="register">Reģistrēties</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    loginMutation.mutate(loginData);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username">E-pasts</Label>
                    <Input
                      id="username"
                      type="text"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({ ...loginData, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Parole</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                    />
                  </div>
                  {loginMutation.error && (
                    <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
                      {loginMutation.error.message}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    variant="destructive"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Notiek pieslēgšanās..." : "Pieslēgties"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    registerMutation.mutate(registerData);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">E-pasts</Label>
                    <Input
                      id="reg-username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          username: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Parole</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                  {registerMutation.error && (
                    <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
                      {registerMutation.error.message}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    variant="destructive"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Notiek reģistrācija..." : "Reģistrēties"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}