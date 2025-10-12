import { SidebarTrigger } from "@/components/ui/sidebar";
import useAuthStore from "@/store/authStore";

export function DashboardNavbar() {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#121A29] backdrop-blur supports-[backdrop-filter]:bg-[#121A29]/95 m-0">
      <div className="flex h-16 items-center justify-between px-6 w-full max-w-none">
        <SidebarTrigger className="-ml-1 text-slate-300 hover:text-white" />

        {/* User Avatar - Right side */}
        <div className="flex items-center gap-3">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user?.fullname || user?.username || "User"} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">{(user?.fullname || user?.username || "U").charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-white">{user?.fullname || "User"}</span>
            {user?.username && <span className="text-xs text-slate-400">@{user.username}</span>}
          </div>
        </div>
      </div>
    </header>
  );
}
