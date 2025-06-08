"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Users,
    UserCheck,
    BookOpen,
    LayoutDashboard,
    DollarSign,
    FileText,
    LogOut
} from "lucide-react";
// import { useAuth } from "@/app/auth/auth-context"; // Not available yet
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

const navigationItems = [    
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },  
    { name: "Attendance", href: "/attendance", icon: UserCheck },
    { name: "Finances", href: "/finances", icon: DollarSign },
    { name: "Profiles", href: "/profiles", icon: Users },
    { name: "Reports", href: "/reports", icon: FileText },
];

export function AppSidebar() {
    const pathname = usePathname();

    const handleLogout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const dummyUser = {
        name: "Admin",
        userType: "admin",
        currentBranch: "Colombo"
    };

    return (
        <Sidebar className="border-r bg-[hsl(var(--sidebar-background))]">
            <SidebarContent>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex justify-center py-6">
                        <Image
                            src="/logo.webp"
                            alt="Company Logo"
                            width={120}
                            height={40}
                            className="h-12 w-auto"
                            priority
                            quality={100}
                            unoptimized
                        />
                    </div>

                    {/* Navigation Items */}
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-2">
                                {navigationItems.map((item) => (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href}
                                            className={`group transition-all duration-200 rounded-lg
                                                ${pathname === item.href 
                                                    ? 'bg-[#2E8B57] text-black shadow-md' 
                                                    : 'text-[hsl(var(--sidebar-foreground))] hover:bg-[#2E8B57]/10 hover:text-[#2E8B57]'
                                                }`}
                                        >
                                            <Link 
                                                href={item.href} 
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg w-full"
                                            >
                                                <item.icon className={`w-5 h-5 transition-colors ${
                                                    pathname === item.href 
                                                        ? 'text-black' 
                                                        : 'text-gray-600'
                                                }`} />
                                                <span className={`text-sm transition-colors ${
                                                    pathname === item.href 
                                                        ? 'text-black font-bold' 
                                                        : 'text-gray-700 font-medium'
                                                }`}>
                                                    {item.name}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* User Info Section */}
                    <div className="mt-auto px-4 py-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#2E8B57] flex items-center justify-center text-white font-semibold shadow-sm">
                                {dummyUser.name ? dummyUser.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {dummyUser.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                    {dummyUser.userType}
                                </p>
                            </div>
                        </div>
                        
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-[#2E8B57] mr-2"></div>
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {dummyUser.currentBranch}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logout Section */}
                    <div className="p-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <SidebarMenuButton 
                                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3 px-4 py-2">
                                        <LogOut className="w-5 h-5" />
                                        <span className="text-sm font-medium">Logout</span>
                                    </div>
                                </SidebarMenuButton>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Confirm Logout</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to logout? You will be redirected to the login page.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="mt-4 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => document.querySelector('[role="dialog"]')?.closest('dialog')?.close()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        variant="destructive"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}