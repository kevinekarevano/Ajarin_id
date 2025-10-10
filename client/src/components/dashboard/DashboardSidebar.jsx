import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Home, BookOpen, Users, Award, Settings, LogOut, Plus, GraduationCap, Trophy, ChevronDown, ChevronRight, User, MessageSquare, Calendar, BarChart3 } from "lucide-react";
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
      <SidebarHeader className="bg-[#1A2332]">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white">Ajarin.id</span>
            <span className="text-xs text-slate-400">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#1A2332]">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300">Menu Utama</SidebarGroupLabel>
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

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/analytics")}>
                  <Link to="/dashboard/analytics">
                    <BarChart3 className="w-4 h-4" />
                    <span>Statistik</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Learning Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300">Belajar</SidebarGroupLabel>
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
                          <span>Kursus Saya</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/browse-courses")}>
                        <Link to="/dashboard/browse-courses">
                          <span>Jelajahi Kursus</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/assignments")}>
                        <Link to="/dashboard/assignments">
                          <span>Tugas</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/progress")}>
                        <Link to="/dashboard/progress">
                          <span>Progress Belajar</span>
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
          <SidebarGroupLabel className="text-slate-300">Mengajar</SidebarGroupLabel>
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
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/my-teaching")}>
                        <Link to="/dashboard/my-teaching">
                          <span>Kursus yang Saya Ajar</span>
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
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/students")}>
                        <Link to="/dashboard/students">
                          <span>Kelola Siswa</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Community */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300">Komunitas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/discussions")}>
                  <Link to="/dashboard/discussions">
                    <MessageSquare className="w-4 h-4" />
                    <span>Diskusi</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/events")}>
                  <Link to="/dashboard/events">
                    <Calendar className="w-4 h-4" />
                    <span>Acara & Webinar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/achievements")}>
                  <Link to="/dashboard/achievements">
                    <Trophy className="w-4 h-4" />
                    <span>Pencapaian</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300">Lainnya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/settings")}>
                  <Link to="/dashboard/settings">
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#1A2332] border-t border-slate-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">{user?.fullname?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium text-white truncate">{user?.fullname || "User"}</span>
                <span className="text-xs text-slate-400 truncate">{user?.email || "user@example.com"}</span>
              </div>
            </div>
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
