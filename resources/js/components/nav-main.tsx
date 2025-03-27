import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], title }: { items: NavItem[]; title: string }) {
    const page = usePage();

    // Function to check if current URL starts with the item's href
    const isActive = (href: string) => {
        // Convert both URLs to lowercase for case-insensitive comparison
        const currentUrl = page.url.toLowerCase();
        const itemHref = href.toLowerCase();

        // Check if current URL starts with the item's href
        // Also make sure it's a complete path match (e.g., /admin/users should not match /admin/user-settings)
        return (
            currentUrl === itemHref ||
            (currentUrl.startsWith(itemHref) &&
                (currentUrl.charAt(itemHref.length) === '/' || currentUrl.charAt(itemHref.length) === '?' || currentUrl.length === itemHref.length))
        );
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.href)}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
