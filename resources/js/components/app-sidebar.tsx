import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpenText, Building2, File, History, LayoutGrid, MessageCircleQuestion, Users, Waypoints } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
];

const secondNavItems: NavItem[] = [
    {
        title: 'Magang',
        href: '/admin/internships',
        icon: Building2,
    },
    {
        title: 'Logbook',
        href: '/admin/logbooks',
        icon: History,
    },
    {
        title: 'Reports',
        href: '/admin/reports',
        icon: File,
    },
];

const thirdNavItems: NavItem[] = [
    {
        title: 'Kelas Bimbingan',
        href: '/admin/guidance-classes',
        icon: BookOpenText,
    },
];

const forthNavItems: NavItem[] = [
    {
        title: 'Tutorials',
        href: '/admin/tutorials',
        icon: Waypoints,
    },
    {
        title: 'FAQs',
        href: '/admin/faqs',
        icon: MessageCircleQuestion,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} title="" />
                <NavMain items={secondNavItems} title="Manajemen Magang" />
                <NavMain items={thirdNavItems} title="Buku Panduan Mahasiswa" />
                <NavMain items={forthNavItems} title="Buku Panduan Mahasiswa" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" title="Manajemen User" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
