"use client";

import {
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle,
  Clock,
  FolderOpen,
  LayoutDashboard,
  Logs,
  LucideIcon,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarItemProps = {
  label: string;
  route: string;
  icon?: LucideIcon;
};

function Sidebar() {
  const pathname = usePathname();
  const sidebarItems: SidebarItemProps[] = [
    { label: "Dashboard", route: "/", icon: LayoutDashboard },
    { label: "This Week", route: "/this-week", icon: CalendarDays },
    { label: "All Logs", route: "/all-logs", icon: Logs },
    { label: "Companies", route: "/companies", icon: BriefcaseBusiness },
    { label: "Projects", route: "/projects", icon: FolderOpen },
    { label: "Task Types", route: "/task-types", icon: CheckCircle },
    { label: "Settings", route: "/settings?tab=general", icon: Settings },
  ];

  const isActive = (route: string) => {
    if (route === "/" && pathname === "/") return true;
    if (route !== "/" && pathname.includes(route)) return true;
    return false;
  };


  return (
    <div className="border-r w-full h-full p-4 flex flex-col justify-start gap-2">
      {sidebarItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.route}
          className={`flex items-center gap-3 py-2 px-3 rounded transition-colors ${
            isActive(item.route) 
              ? "bg-primary/10 text-primary  font-medium"
              : "hover:bg-foreground/10"
          }`}
        >
          {item.icon && <item.icon size={24} strokeWidth={1.5} />}
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;
