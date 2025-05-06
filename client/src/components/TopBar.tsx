import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import GlucoLogo from "@/components/GlucoLogo";

interface TopBarProps {
  user: any;
}

export default function TopBar({ user }: TopBarProps) {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out"
      });
    }
  };

  return (
    <header className="bg-secondary px-4 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <GlucoLogo size={36} className="mr-2" />
          <h1 className="text-xl font-bold">GLUCOTRACK</h1>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-muted-foreground">
            {user?.displayName || "User"}
          </span>
          <button 
            className="rounded-full p-2 text-muted-foreground hover:bg-muted" 
            onClick={handleLogout}
          >
            <i className="ri-logout-box-r-line"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
