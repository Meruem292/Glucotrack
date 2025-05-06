import { useLocation, useRoute, Link } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();
  const [isDashboardActive] = useRoute("/");
  const [isHistoryActive] = useRoute("/history");
  const [isFoodActive] = useRoute("/food-recommendations");
  const [isWorkoutActive] = useRoute("/workout-recommendations");
  const [isProfileActive] = useRoute("/profile");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 rounded-t-xl bg-secondary shadow-lg">
      <div className="flex justify-around">
        <div className="flex-1">
          <Link href="/">
            <div className={`flex cursor-pointer flex-col items-center pb-2 pt-3 ${isDashboardActive ? "text-accent" : "text-muted-foreground"}`}>
              <i className="ri-dashboard-line text-xl"></i>
              <span className="mt-1 text-xs">Dashboard</span>
            </div>
          </Link>
        </div>
        <div className="flex-1">
          <Link href="/history">
            <div className={`flex cursor-pointer flex-col items-center pb-2 pt-3 ${isHistoryActive ? "text-accent" : "text-muted-foreground"}`}>
              <i className="ri-history-line text-xl"></i>
              <span className="mt-1 text-xs">History</span>
            </div>
          </Link>
        </div>
        <div className="flex-1">
          <Link href="/food-recommendations">
            <div className={`flex cursor-pointer flex-col items-center pb-2 pt-3 ${isFoodActive ? "text-accent" : "text-muted-foreground"}`}>
              <i className="ri-restaurant-line text-xl"></i>
              <span className="mt-1 text-xs">Food</span>
            </div>
          </Link>
        </div>
        <div className="flex-1">
          <Link href="/workout-recommendations">
            <div className={`flex cursor-pointer flex-col items-center pb-2 pt-3 ${isWorkoutActive ? "text-accent" : "text-muted-foreground"}`}>
              <i className="ri-heart-pulse-line text-xl"></i>
              <span className="mt-1 text-xs">Workout</span>
            </div>
          </Link>
        </div>
        <div className="flex-1">
          <Link href="/profile">
            <div className={`flex cursor-pointer flex-col items-center pb-2 pt-3 ${isProfileActive ? "text-accent" : "text-muted-foreground"}`}>
              <i className="ri-user-line text-xl"></i>
              <span className="mt-1 text-xs">Profile</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
