import { useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import FoodRecommendations from "@/pages/FoodRecommendations";
import WorkoutRecommendations from "@/pages/WorkoutRecommendations";
import Profile from "@/pages/Profile";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import TopBar from "./components/TopBar";
import BottomNavigation from "./components/BottomNavigation";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <TooltipProvider>
        <Toaster />
        <Auth />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex min-h-screen flex-col bg-primary">
        <TopBar user={user} />
        <main className="flex-1 overflow-auto pb-20">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/history" component={History} />
            <Route path="/food-recommendations" component={FoodRecommendations} />
            <Route path="/workout-recommendations" component={WorkoutRecommendations} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <BottomNavigation />
      </div>
    </TooltipProvider>
  );
}

export default App;
