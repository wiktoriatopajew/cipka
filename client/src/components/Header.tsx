import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, User, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user?: { username: string; email: string; avatar?: string; isAdmin?: boolean; subscriptionDaysLeft?: number } | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onOpenAdmin?: () => void;
}

export default function Header({ user, onLogin, onLogout, onOpenAdmin }: HeaderProps) {
  const [location, navigate] = useLocation();

  const handleHomeClick = () => {
    if (location === '/') {
      // If already on homepage, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Navigate to homepage
      navigate('/');
    }
  };

  const handleChatClick = () => {
    if (location === '/') {
      // If on homepage, scroll to vehicle selector section
      const vehicleSection = document.getElementById('vehicle-selector-section');
      if (vehicleSection) {
        vehicleSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to homepage first, then scroll to vehicle selector
      navigate('/');
      setTimeout(() => {
        const vehicleSection = document.getElementById('vehicle-selector-section');
        if (vehicleSection) {
          vehicleSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button 
          onClick={handleHomeClick}
          className="flex items-center space-x-2 hover-elevate rounded-lg px-2 py-1 cursor-pointer"
          data-testid="button-logo"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-warning">
            <MessageCircle className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-warning bg-clip-text text-transparent">
            ChatWithMechanic
          </span>
        </button>

        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={handleHomeClick} 
            className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
            data-testid="nav-home"
          >
            Home
          </button>
          <button 
            onClick={handleChatClick} 
            className="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
            data-testid="nav-chat"
          >
            Chat
          </button>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex items-center" data-testid="text-user-email">
                  <User className="mr-2 h-4 w-4" />
                  {user.email}
                </DropdownMenuItem>
                {user.subscriptionDaysLeft !== undefined && (
                  <DropdownMenuItem className="flex items-center justify-between" data-testid="text-subscription-days">
                    <span className="text-sm text-muted-foreground">Subscription</span>
                    <span className={`text-sm font-medium ${user.subscriptionDaysLeft > 7 ? 'text-success' : user.subscriptionDaysLeft > 0 ? 'text-warning' : 'text-destructive'}`}>
                      {user.subscriptionDaysLeft > 0 ? `${user.subscriptionDaysLeft} days left` : 'Expired'}
                    </span>
                  </DropdownMenuItem>
                )}
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild data-testid="button-admin">
                      <Link href="/admin" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLogin} data-testid="button-login">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}