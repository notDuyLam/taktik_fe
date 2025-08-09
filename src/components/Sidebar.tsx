"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  Cog6ToothIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolidIcon,
  UserIcon as UserSolidIcon,
} from "@heroicons/react/24/solid";
import { usePathname, useRouter } from "next/navigation";
import AuthModal from "./AuthModal";
import VideoUpload from "./VideoUpload";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";

interface SidebarProps {
  currentPage?: "home" | "search" | "profile" | "settings";
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Derive active page from URL when prop is not provided
  const derivedPage: "home" | "search" | "profile" | "settings" =
    pathname?.startsWith("/search")
      ? "search"
      : pathname?.startsWith("/profile")
      ? "profile"
      : pathname?.startsWith("/settings")
      ? "settings"
      : "home";

  const activePage = currentPage ?? derivedPage;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const sidebarItems = [
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: currentPage === "home" ? HomeSolidIcon : HomeIcon,
    },
    {
      id: "search",
      label: "Search",
      path: "/search",
      icon: MagnifyingGlassIcon,
    },
    ...(user
      ? [
          {
            id: "profile",
            label: "Profile",
            path: `/profile/${user.username}`,
            icon: currentPage === "profile" ? UserSolidIcon : UserIcon,
          },
          {
            id: "settings",
            label: "Settings",
            path: "/settings",
            icon: Cog6ToothIcon,
          },
        ]
      : []),
  ];

  const handleUploadSuccess = () => {
    // Refresh the page or update state as needed
    window.location.reload();
  };

  return (
    <div className="w-16 lg:w-64 h-screen sticky top-0 flex-shrink-0 overflow-y-auto bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center lg:justify-start">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <span className="hidden lg:block ml-3 text-xl font-bold text-foreground">
            Taktik
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full flex items-center justify-start px-3 py-3 rounded-lg text-left transition-colors ${isActive ? "font-semibold" : ""}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="hidden lg:block ml-3 font-medium">
                    {item.label}
                  </span>
                </Button>
              </li>
            );
          })}
        </ul>

        {/* Upload Button - only show if user is authenticated */}
        {user && (
          <div className="mt-4 pt-4 border-t border-sidebar-border">
            <Button
              onClick={() => setShowUploadModal(true)}
              className="w-full flex items-center px-3 py-3 rounded-lg text-left"
              variant="default"
            >
              <PlusIcon className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:block ml-3 font-medium">
                Upload Video
              </span>
            </Button>
          </div>
        )}

        {/* Mode toggle */}
        <div className="mt-4 pt-4 border-t border-sidebar-border">
          <ModeToggle />
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {user ? (
          <div className="relative">
            <Button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-accent transition-colors"
              variant="ghost"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatarUrl} alt={user.username} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden lg:block ml-3 text-left">
                <div className="font-medium text-foreground">{user.username}</div>
                <div className="text-sm text-muted-foreground">@{user.username}</div>
              </div>
            </Button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg py-1 z-50">
                <Button
                  onClick={() => {
                    handleNavigation(`/profile/${user.username}`);
                    setShowUserMenu(false);
                  }}
                  variant="ghost"
                  className="w-full flex items-center justify-start px-4 py-2 text-left text-sm hover:bg-accent"
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => {
                    handleNavigation("/settings");
                    setShowUserMenu(false);
                  }}
                  variant="ghost"
                  className="w-full flex items-center justify-start px-4 py-2 text-left text-sm hover:bg-accent"
                >
                  Settings
                </Button>
                <hr className="my-1" />
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full flex items-center justify-start px-4 py-2 text-left text-sm hover:bg-accent"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center lg:text-left">
            <Button
              onClick={() => setShowAuthModal(true)}
              className="w-full px-4 py-2 rounded-lg transition-colors font-medium"
              variant="default"
            >
              <span className="hidden lg:inline">Sign In</span>
              <span className="lg:hidden">
                <UserIcon className="w-5 h-5 mx-auto" />
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <VideoUpload
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
