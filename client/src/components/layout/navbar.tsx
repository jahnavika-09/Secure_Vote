import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Vote,
  HelpCircle,
  User,
  Menu,
  LogOut,
  ShieldCheck
} from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold text-neutral-900">SecureVote</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/verification">
                <a className={`${location === "/verification" ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Verification
                </a>
              </Link>
              <Link href="/">
                <a className={`${location === "/" ? "border-primary text-neutral-900" : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Voting
                </a>
              </Link>
              <a className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Results
              </a>
              <a className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Help
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="icon" aria-label="Help">
              <HelpCircle className="h-5 w-5 text-neutral-500" />
            </Button>
            <div className="ml-3 relative">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-neutral-600" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      <span className="text-sm font-medium">
                        {user.name || user.username}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <a className="flex w-full items-center cursor-pointer">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6 text-neutral-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/verification">
              <a className={`${location === "/verification" ? "bg-primary-light bg-opacity-10 border-primary text-primary" : "border-transparent text-neutral-500"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                Verification
              </a>
            </Link>
            <Link href="/">
              <a className={`${location === "/" ? "bg-primary-light bg-opacity-10 border-primary text-primary" : "border-transparent text-neutral-500"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                Voting
              </a>
            </Link>
            <a className="border-transparent text-neutral-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Results
            </a>
            <a className="border-transparent text-neutral-500 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Help
            </a>
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-neutral-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-neutral-800">
                      {user.name || user.username}
                    </div>
                    <div className="text-sm font-medium text-neutral-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {user.role === "admin" && (
                    <Link href="/admin">
                      <a className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100">
                        Admin Dashboard
                      </a>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1">
                <Link href="/auth">
                  <a className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100">
                    Login
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
