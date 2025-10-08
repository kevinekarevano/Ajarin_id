import { Outlet } from "react-router";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider className="min-h-screen bg-[#0F1624] w-full sidebar-provider">
      <div className="flex min-h-screen bg-[#0F1624] w-full dashboard-container">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 bg-[#0F1624] w-full min-w-0 overflow-hidden">
          <DashboardNavbar />
          <main className="flex-1 p-5 overflow-auto bg-[#0F1624] w-full">
            <div className="p-6 w-full dashboard-container">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
