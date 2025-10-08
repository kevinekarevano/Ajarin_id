import { useState } from "react";
import { Search, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useAuthStore from "@/store/authStore";

export function DashboardNavbar() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#121A29] backdrop-blur supports-[backdrop-filter]:bg-[#121A29]/95 m-0">
      <div className="flex h-16 items-center gap-4 px-6 w-full max-w-none">
        <SidebarTrigger className="-ml-1 text-slate-300 hover:text-white" />

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Cari kursus, materi, atau diskusi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 ml-2 pl-2 border-l border-slate-700">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">{user?.fullname?.charAt(0)?.toUpperCase() || "U"}</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-medium text-white">{user?.fullname || "User"}</span>
              <span className="text-xs text-slate-400">{user?.role || "Student"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
