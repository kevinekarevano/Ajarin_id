import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router";
import useAuthStore from "@/store/authStore";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Kursus", href: "/courses" },
    { name: "Tentang", href: "/about" },
    { name: "Kontak", href: "/contact" },
  ];

  const authenticatedNavigation = [
    { name: "Beranda", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Kursus", href: "/courses" },
    { name: "Tentang", href: "/about" },
    { name: "Kontak", href: "/contact" },
  ];

  const currentNavigation = isAuthenticated ? authenticatedNavigation : navigation;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Function to check if link is active
  const isActiveLink = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  // Function to get link classes with active state
  const getLinkClasses = (href) => {
    const baseClasses = "transition-colors duration-200 relative";
    const activeClasses = "text-white font-semibold";
    const inactiveClasses = "text-slate-300 hover:text-white";

    return `${baseClasses} ${isActiveLink(href) ? activeClasses : inactiveClasses}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121A29] backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="">
            <div className="w-30 h-30  flex items-center justify-center">
              <img src="/icons/ajarin-icon.svg" alt="logo" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentNavigation.map((item) => (
              <Link key={item.name} to={item.href} className={getLinkClasses(item.href)}>
                {item.name}
                {/* Active indicator */}
                {isActiveLink(item.href) && <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 rounded-full"></span>}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 text-white">
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user?.fullname || user?.username || "User"} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">{(user?.fullname || user?.username || "U").charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.fullname || "User"}</span>
                    {user?.username && <span className="text-xs text-slate-400">@{user.username}</span>}
                  </div>
                </div>
                <Button onClick={handleLogout} variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Button className="bg-[#3A4B54] border-white border hover:bg-[#334249] text-white" asChild>
                  <Link to="/login">Masuk</Link>
                </Button>
                <Button className="bg-[#2279AB] hover:bg-[#1f6d9a] text-white" asChild>
                  <Link to="/register">Gabung Sekarang</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <nav className="flex flex-col space-y-4">
              {currentNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${getLinkClasses(item.href)} ${isActiveLink(item.href) ? "bg-slate-800/50 px-3 py-2 rounded-lg border-l-2 border-blue-400" : "px-3 py-2"}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                  {/* Mobile active indicator */}
                  {isActiveLink(item.href) && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Aktif</span>}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-slate-800">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 px-3 py-2 text-white border-b border-slate-700 pb-4">
                      {user?.avatar?.url ? (
                        <img src={user.avatar.url} alt={user?.fullname || user?.username || "User"} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-base font-semibold text-white">{(user?.fullname || user?.username || "U").charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.fullname || "User"}</span>
                        {user?.username && <span className="text-xs text-slate-400">@{user.username}</span>}
                      </div>
                    </div>
                    <Button onClick={handleLogout} variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 justify-start" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Masuk
                      </Link>
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white justify-start" asChild>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        Gabung Sekarang
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
}
