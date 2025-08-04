"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolidIcon,
  UserIcon as UserSolidIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface SidebarProps {
  currentPage?: "home" | "search" | "profile" | "settings";
}

export default function Sidebar({ currentPage = "home" }: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  return (
    <div className="w-16 lg:w-64 bg-white border-l border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center lg:justify-start">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="hidden lg:block ml-3 text-xl font-bold text-gray-900">
            Taktik
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="hidden lg:block ml-3 font-medium">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden lg:block ml-3 text-left">
                <div className="font-medium text-gray-900">{user.username}</div>
                <div className="text-sm text-gray-500">@{user.username}</div>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    handleNavigation(`/profile/${user.username}`);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    handleNavigation("/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center lg:text-left">
            <button
              onClick={() => handleNavigation("/auth")}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <span className="hidden lg:inline">Sign In</span>
              <span className="lg:hidden">
                <UserIcon className="w-5 h-5 mx-auto" />
              </span>
            </button>
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
    </div>
  );
}
