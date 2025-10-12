import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Home, BookOpen, Users, Award, Settings, LogOut, Plus, ChevronDown, ChevronRight, User, Compass, BookMarked } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";

export function DashboardSidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState({
    learner: true,
    mentor: true,
  });

  const handleLogout = () => {
    logout();
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  return (
    <Sidebar className="border-r border-slate-800 bg-[#1A2332]">
      <SidebarHeader className="bg-[#1A2332] border-b border-slate-700">
        <div className="flex items-center justify-center  ">
          <img src="/icons/ajarin-icon.svg" alt="Ajarin.id" className="w-30 h-30" />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#1A2332]">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-semibold text-xs uppercase tracking-wide px-2">🏠 Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard")}>
                  <Link to="/dashboard">
                    <Home className="w-4 h-4" />
                    <span>Beranda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/profile")}>
                  <Link to="/dashboard/profile">
                    <User className="w-4 h-4" />
                    <span>Profil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Learning Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-semibold text-xs uppercase tracking-wide px-2">📚 Pembelajaran</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => toggleDropdown("learner")} className="justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Sebagai Learner</span>
                  </div>
                  {openDropdowns.learner ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </SidebarMenuButton>
                {openDropdowns.learner && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/my-courses")}>
                        <Link to="/dashboard/my-courses">
                          <BookMarked className="w-4 h-4" />
                          <span>Kursus Saya</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/browse-courses")}>
                        <Link to="/dashboard/browse-courses">
                          <Compass className="w-4 h-4" />
                          <span>Jelajahi Kursus</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/certificates")}>
                        <Link to="/dashboard/certificates">
                          <Award className="w-4 h-4" />
                          <span>Sertifikat Saya</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Teaching Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-semibold text-xs uppercase tracking-wide px-2">👨‍🏫 Mengajar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => toggleDropdown("mentor")} className="justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Sebagai Mentor</span>
                  </div>
                  {openDropdowns.mentor ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </SidebarMenuButton>
                {openDropdowns.mentor && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/manage-courses")}>
                        <Link to="/dashboard/manage-courses">
                          <Settings className="w-4 h-4" />
                          <span>Kelola Kursus</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/create-course")}>
                        <Link to="/dashboard/create-course">
                          <Plus className="w-4 h-4" />
                          <span>Buat Kursus Baru</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#1A2332] border-t border-slate-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-slate-800/50 mx-2">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user?.fullname || user?.username || "User"} className="w-10 h-10 rounded-full object-cover shadow-lg" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-semibold text-white">{(user?.fullname || user?.username || "U").charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate">{user?.fullname || "User"}</span>
                {user?.username && <span className="text-xs text-slate-400 truncate">@{user.username}</span>}
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-300 hover:text-red-400 hover:bg-red-900/20 mx-2 transition-colors">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
