import { useState } from "react";
import { Link } from "react-router";
import { Search, BookOpen, Users, Award, Bell, Settings, LogOut, Moon, Sun, Plus, Filter, Star, Clock, User, Home, GraduationCap, Trophy, Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import useAuthStore from "@/store/authStore";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("beranda");
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

  // Mock data for courses
  const featuredCourses = [
    {
      id: 1,
      title: "Belajar Prompt ChatGPT yang efektif!",
      instructor: "Kevin Sinclair",
      date: "25 April 2025",
      rating: 4.0,
      reviews: 50,
      students: 430,
      image: "/api/placeholder/300/200",
      category: "AI & Technology",
    },
    {
      id: 2,
      title: "Belajar editing sampai jadi expert!",
      instructor: "Kevin Sinclair",
      date: "25 April 2025",
      rating: 4.0,
      reviews: 50,
      students: 430,
      image: "/api/placeholder/300/200",
      category: "Design",
    },
    {
      id: 3,
      title: "Public speaking menjadi mudah!",
      instructor: "Dina Fictor",
      date: "25 April 2025",
      rating: 4.0,
      reviews: 50,
      students: 430,
      image: "/api/placeholder/300/200",
      category: "Communication",
    },
  ];

  const myCourses = [
    {
      id: 1,
      title: "React.js Fundamentals",
      progress: 75,
      nextLesson: "State Management with Hooks",
      dueDate: "15 Oktober 2025",
    },
    {
      id: 2,
      title: "Node.js Backend Development",
      progress: 40,
      nextLesson: "Express.js Middleware",
      dueDate: "20 Oktober 2025",
    },
  ];

  const sidebarItems = [
    { key: "beranda", label: "Beranda", icon: Home },
    {
      key: "learner",
      label: "Learner",
      icon: GraduationCap,
      submenu: [
        { key: "kelas-diikuti", label: "Kelas yang diikuti" },
        { key: "sertifikat", label: "Sertifikat" },
      ],
    },
    {
      key: "mentor",
      label: "Mentor",
      icon: Users,
      submenu: [
        { key: "kelas-dikelola", label: "Kelas yang dikelola" },
        { key: "sertifikat-mentor", label: "Sertifikat" },
      ],
    },
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <SidebarProvider
      style={{
        "--sidebar": "#1a2332",
        "--sidebar-foreground": "#ffffff",
        "--sidebar-border": "#475569",
        "--sidebar-accent": "#334155",
        "--sidebar-accent-foreground": "#ffffff",
      }}
    >
      <div className="min-h-screen bg-[#0F1624] text-white flex w-full">
        <Sidebar
          variant="inset"
          className="border-slate-700 [&_[data-sidebar=sidebar]]:bg-[#1a2332] [&_[data-sidebar=sidebar]]:text-white"
          style={{
            "--sidebar": "#1a2332",
            "--sidebar-foreground": "#ffffff",
            "--sidebar-border": "#475569",
            "--sidebar-accent": "#334155",
            "--sidebar-accent-foreground": "#ffffff",
          }}
        >
          <SidebarHeader className="border-b border-slate-700 p-6">
            <Link to="/dashboard" className="">
              <img src="/icons/ajarin-icon.svg" alt="ajarin logo" className="w-40 mx-auto" />
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      {item.submenu ? (
                        // Dropdown menu item
                        <>
                          <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-700 justify-between" onClick={() => toggleDropdown(item.key)}>
                            <div className="flex items-center space-x-3">
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${openDropdowns[item.key] ? "rotate-90" : ""}`} />
                          </SidebarMenuButton>

                          {openDropdowns[item.key] && (
                            <SidebarMenuSub className="animate-in slide-in-from-top-1 duration-200">
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.key}>
                                  <SidebarMenuSubButton
                                    isActive={activeTab === subItem.key}
                                    className="text-slate-400 hover:text-white hover:bg-slate-600/50 data-[active=true]:bg-blue-600/70 data-[active=true]:text-white transition-colors"
                                    onClick={() => setActiveTab(subItem.key)}
                                  >
                                    {subItem.label}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </>
                      ) : (
                        // Regular menu item
                        <SidebarMenuButton isActive={activeTab === item.key} className="text-slate-300 hover:text-white hover:bg-slate-700 data-[active=true]:bg-blue-600 data-[active=true]:text-white" onClick={() => setActiveTab(item.key)}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-700 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-slate-300 hover:text-white hover:bg-slate-700">
                  <Settings className="w-5 h-5" />
                  <span>Pengaturan</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <LogOut className="w-5 h-5" />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 bg-[#0F1624]">
          {/* Header */}
          <header className="bg-[#1a2332] border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-lg transition-colors" />
                <h1 className="text-xl font-bold">Dashboard</h1>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className="text-5xl font-bold mb-4">
                  Selamat datang, <span className="text-yellow-400">{user?.fullname?.split(" ")[0] || "Budi"}!</span>
                </h2>
                <h3 className="text-2xl text-slate-300 mb-2">Cari Kelas yang ingin kamu pelajari disini</h3>
                <p className="text-slate-400 mb-8">Lebih dari 500+ kelas yang dapat kamu pelajari disini</p>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Cari kelas yang kamu butuhkan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-16 py-4 bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-full text-lg"
                  />
                  <Button size="icon" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full">
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all hover:scale-105">
                  <CardContent className="p-0">
                    {/* Course Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-4 left-4">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 text-lg">{course.title}</h4>
                      <div className="flex items-center text-sm text-slate-400 mb-3">
                        <User className="w-4 h-4 mr-1" />
                        <span>
                          {course.instructor} • {course.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-slate-300">{course.rating}</span>
                          <span className="text-sm text-slate-500 ml-2">({course.students})</span>
                        </div>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Belajar Sekarang</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Courses Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create 3 more similar course cards */}
              {[1, 2, 3].map((index) => (
                <Card key={`additional-${index}`} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all hover:scale-105">
                  <CardContent className="p-0">
                    {/* Course Image */}
                    <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 rounded-t-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-4 left-4">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-4">
                      <h4 className="font-semibold text-white mb-2 text-lg">Belajar Prompt ChatGPT yang efektif!</h4>
                      <div className="flex items-center text-sm text-slate-400 mb-3">
                        <User className="w-4 h-4 mr-1" />
                        <span>Kevin Sinclair • 25 April 2025</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-slate-300">4.0</span>
                          <span className="text-sm text-slate-500 ml-2">(430)</span>
                        </div>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Belajar Sekarang</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
