import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData, DatabaseNotification as Notification, NotificationIndexResponse } from '@/types'; // Updated imports
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Bell, BookOpen, GraduationCap, LayoutDashboard, LayoutGrid, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { Badge } from './ui/badge';
import { DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';

// Removed local Notification types, using imported ones.

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/',
        icon: LayoutGrid,
    },
    {
        title: 'Panduan',
        href: '/buku-panduan',
        icon: BookOpen,
    },
    {
        title: 'Dashboard Magang',
        href: '/internships',
        icon: GraduationCap,
    },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 data-[theme=green]:text-[#1B4965]';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    // Notification State
    const [notifications, setNotifications] = useState<Notification[]>([]); // Uses imported Notification (aliased DatabaseNotification)
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (auth.user) {
            fetchNotifications();
        } else {
            setLoading(false);
        }
    }, [auth.user]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Use NotificationIndexResponse for the expected response type
            const response = await axios.get<NotificationIndexResponse>(route('api.notifications.index'));
            setNotifications(response.data.unread);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await axios.post(route('api.notifications.markAsRead'), { ids: [notificationId] });
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post(route('api.notifications.markAllAsRead'));
            setNotifications([]);
            setUnreadCount(0);
            setIsDropdownOpen(false);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        handleMarkAsRead(notification.id);
        // Accessing link or url from notification.data (which is SpecificNotificationData | NotificationDataBase)
        const targetLink = notification.data.link || notification.data.url;
        if (targetLink) {
            router.visit(targetLink);
        }
        setIsDropdownOpen(false);
    };

    const isActive = (href: string) => {
        const currentUrl = page.url.toLowerCase();
        const itemHref = href.toLowerCase();
        return (
            currentUrl === itemHref ||
            (currentUrl.startsWith(itemHref) &&
                (currentUrl.charAt(itemHref.length) === '/' || currentUrl.charAt(itemHref.length) === '?' || currentUrl.length === itemHref.length))
        );
    };

    const computedRightNavItems: NavItem[] = [];
    if (auth?.role) {
        const roleName = auth.role;
        if (roleName && ['admin', 'superadmin'].includes(roleName)) {
            computedRightNavItems.push({ title: 'Dashboard', href: '/admin', icon: LayoutDashboard });
        } else if (roleName && ['mahasiswa', 'dosen'].includes(roleName)) {
            computedRightNavItems.push({ title: 'Dashboard', href: '/internships', icon: LayoutDashboard });
        }
        computedRightNavItems.push({ title: 'Panduan', href: '/buku-panduan', icon: BookOpen });
    }
    return (
        <>
            <div className="border-sidebar-border/80 border-b">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className={cn(
                                                        'flex items-center space-x-2 font-medium',
                                                        isActive(item.href) && 'text-neutral-900 dark:text-neutral-100',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {computedRightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.href}
                                                    rel="noopener noreferrer"
                                                    className={cn(
                                                        'flex items-center space-x-2 font-medium',
                                                        isActive(item.href) && 'text-neutral-900 dark:text-neutral-100',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                isActive(item.href) && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>
                                        {isActive(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black data-[theme=green]:bg-[#1B4965] dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        {/* Search Button - Always visible */}
                        <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer">
                            <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                        </Button>

                        {/* Conditional rendering based on auth */}
                        {auth.user ? (
                            // Authenticated user view
                            <div className="flex items-center space-x-1">
                                {/* Links like Dashboard/Panduan - hidden on mobile */}
                                <div className="hidden lg:flex">
                                    {computedRightNavItems.map((item, index) => (
                                        <TooltipProvider key={index}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" asChild className="group h-9 w-9 cursor-pointer">
                                                        <Link href={item.href} rel="noopener noreferrer">
                                                            {item.icon && (
                                                                <Icon iconNode={item.icon} className="!size-5 opacity-80 group-hover:opacity-100" />
                                                            )}
                                                        </Link>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{item.title}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>

                                {/* Notification Bell - visible on all sizes when logged in */}
                                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="relative h-9 w-9">
                                            <Bell className="!size-5" />
                                            {unreadCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-medium text-white"
                                                >
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80">
                                        <div className="flex items-center justify-between px-2 py-1.5">
                                            <span className="font-semibold">Notifikasi</span>
                                            {notifications.length > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={handleMarkAllAsRead}
                                                    disabled={loading}
                                                >
                                                    Tandai semua terbaca
                                                </Button>
                                            )}
                                        </div>
                                        <DropdownMenuSeparator />
                                        {loading ? (
                                            <div className="text-muted-foreground p-4 text-center text-sm">Memuat...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="text-muted-foreground p-4 text-center text-sm">Tidak ada notifikasi baru</div>
                                        ) : (
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <DropdownMenuItem
                                                        key={notification.id}
                                                        className="cursor-pointer"
                                                        onSelect={(e) => e.preventDefault()}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        <div className="flex flex-col">
                                                            <p className="text-sm">{notification.data.message}</p>
                                                            <p className="text-muted-foreground text-xs">
                                                                {new Date(notification.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </div>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer justify-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            onSelect={(e) => e.preventDefault()}
                                            onClick={() => {
                                                router.visit(route('notifications.index'));
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            Lihat Semua Notifikasi
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* User Avatar Dropdown - visible on all sizes when logged in */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="size-10 rounded-full p-1">
                                            <Avatar className="size-8 overflow-hidden rounded-full">
                                                <AvatarImage src={auth.user.avatar_url || undefined} alt={auth.user.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            // Guest view
                            <div className="flex items-center space-x-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Daftar</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
