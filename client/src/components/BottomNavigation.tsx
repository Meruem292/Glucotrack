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
        <Link href="/">
          <a className={`flex flex-1 flex-col items-center pb-2 pt-3 ${isDashboardActive ? "text-accent" : "text-muted-foreground"}`}>
            <i className="ri-dashboard-line text-xl"></i>
            <span className="mt-1 text-xs">Dashboard</span>
          </a>
        </Link>
        <Link href="/history">
          <a className={`flex flex-1 flex-col items-center pb-2 pt-3 ${isHistoryActive ? "text-accent" : "text-muted-foreground"}`}>
            <i className="ri-history-line text-xl"></i>
            <span className="mt-1 text-xs">History</span>
          </a>
        </Link>
        <Link href="/food-recommendations">
          <a className={`flex flex-1 flex-col items-center pb-2 pt-3 ${isFoodActive ? "text-accent" : "text-muted-foreground"}`}>
            <i className="ri-restaurant-line text-xl"></i>
            <span className="mt-1 text-xs">Food</span>
          </a>
        </Link>
        <Link href="/workout-recommendations">
          <a className={`flex flex-1 flex-col items-center pb-2 pt-3 ${isWorkoutActive ? "text-accent" : "text-muted-foreground"}`}>
            <i className="ri-heart-pulse-line text-xl"></i>
            <span className="mt-1 text-xs">Workout</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-1 flex-col items-center pb-2 pt-3 ${isProfileActive ? "text-accent" : "text-muted-foreground"}`}>
            <i className="ri-user-line text-xl"></i>
            <span className="mt-1 text-xs">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
