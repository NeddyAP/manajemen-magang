import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpenText, Building2, Cog, File, History, House, LayoutGrid, MessageCircleQuestion, Trash, Users, Waypoints } from 'lucide-react';
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
        title: 'Laporan',
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
        title: 'Pengguna',
        href: '/admin/users',
        icon: Users,
    },
];

const fifthNavItems: NavItem[] = [
    {
        title: 'Tutorial',
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
        title: 'Variabel Global',
        href: '/admin/global-variables',
        icon: Cog,
    },
    {
        title: 'Sampah',
        href: '/admin/trash',
        icon: Trash,
    },
    {
        title: 'Beranda',
        href: '/',
        icon: House,
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
                <NavMain items={thirdNavItems} title="Bimbingan Mahasiswa" />
                <NavMain items={forthNavItems} title="Manajemen Pengguna" />
                <NavMain items={fifthNavItems} title="Buku Panduan Mahasiswa" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" title="Pengaturan Website" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
