import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Home,
  BookOpen,
  Users,
  Award,
  Settings,
  LogOut,
  Plus,
  GraduationCap,
  Trophy,
  ChevronDown,
  ChevronRight,
  User,
  MessageSquare,
  Calendar,
  BarChart3,
  Search,
  FileText,
  TrendingUp,
  Compass,
  UserCheck,
  BookMarked,
  PenTool,
  Target,
  Star,
  Globe,
  Video,
} from "lucide-react";
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
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-lg">Ajarin.id</span>
            <span className="text-xs text-slate-400">Learning Platform</span>
          </div>
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

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/analytics")}>
                  <Link to="/dashboard/analytics">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analitik</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/search")}>
                  <Link to="/dashboard/search">
                    <Search className="w-4 h-4" />
                    <span>Pencarian</span>
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
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/assignments")}>
                        <Link to="/dashboard/assignments">
                          <FileText className="w-4 h-4" />
                          <span>Tugas</span>
                          <span className="ml-auto text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">3</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/progress")}>
                        <Link to="/dashboard/progress">
                          <TrendingUp className="w-4 h-4" />
                          <span>Progress Belajar</span>
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
                      <SidebarMenuSubButton asChild isActive={isActiveLink("/dashboard/my-teaching")}>
                        <Link to="/dashboard/my-teaching">
                          <PenTool className="w-4 h-4" />
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
                          <UserCheck className="w-4 h-4" />
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
          <SidebarGroupLabel className="text-slate-300 font-semibold text-xs uppercase tracking-wide px-2">👥 Komunitas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/discussions")}>
                  <Link to="/dashboard/discussions">
                    <MessageSquare className="w-4 h-4" />
                    <span>Diskusi</span>
                    <span className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">12</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/events")}>
                  <Link to="/dashboard/events">
                    <Video className="w-4 h-4" />
                    <span>Webinar & Event</span>
                    <span className="ml-auto text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/achievements")}>
                  <Link to="/dashboard/achievements">
                    <Award className="w-4 h-4" />
                    <span>Pencapaian</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/leaderboard")}>
                  <Link to="/dashboard/leaderboard">
                    <Trophy className="w-4 h-4" />
                    <span>Papan Peringkat</span>
                    <span className="ml-auto text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded-full">BETA</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-semibold text-xs uppercase tracking-wide px-2">⚡ Aksi Cepat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/favorites")}>
                  <Link to="/dashboard/favorites">
                    <Star className="w-4 h-4" />
                    <span>Favorit</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/recent")}>
                  <Link to="/dashboard/recent">
                    <Calendar className="w-4 h-4" />
                    <span>Aktivitas Terbaru</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-semibold text-xs uppercase tracking-wide px-2">⚙️ Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/settings")}>
                  <Link to="/dashboard/settings">
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan Akun</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveLink("/dashboard/help")}>
                  <Link to="/dashboard/help">
                    <Globe className="w-4 h-4" />
                    <span>Bantuan & FAQ</span>
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
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-slate-800/50 mx-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-semibold text-white">{user?.fullname?.charAt(0)?.toUpperCase() || "U"}</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-white truncate">{user?.fullname || "User"}</span>
                <span className="text-xs text-slate-400 truncate">{user?.email || "user@example.com"}</span>
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
