import { Switch, Route } from "wouter";
import { Router } from "wouter"; // ✅ add this
import queryClient from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@components/ui/toaster";
import { AuthProvider } from "@hooks/use-auth";
import NotFound from "@pages/not-found";
import HomePage from "@pages/home-page";
import VotingPage from "@pages/voting-page";
import AuthPage from "@pages/auth-page";
import ProtectedRoute from "./lib/protected-route";

function Routes() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/vote" component={VotingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* ✅ tell wouter to use hash-based routing */}
        <Router base="/saeima" hook={useHashLocation}>
          <Routes />
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

// helper for hash-based routing
function useHashLocation() {
  const hashLocation = () =>
    window.location.hash.replace(/^#/, "") || "/";
  const navigate = (to: string) => (window.location.hash = to);
  return [hashLocation, navigate] as const;
}
