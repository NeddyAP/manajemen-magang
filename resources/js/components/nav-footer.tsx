import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    title,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
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
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                                isActive={isActive(item.href)}
                            >
                                <Link href={item.href} rel="noopener noreferrer">
                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
