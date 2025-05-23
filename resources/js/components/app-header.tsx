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

const activeItemStyles = 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-medium';

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
    if (auth?.user) {
        // Use permissions and roles to determine dashboard link
        if (auth.permissions?.includes('admin.dashboard.view')) {
            computedRightNavItems.push({ title: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard });
        } else if (auth.user.roles?.some((role) => role.name === 'dosen')) {
            computedRightNavItems.push({ title: 'Dashboard Dosen', href: '/dosen/dashboard', icon: LayoutDashboard });
        } else if (auth.user.roles?.some((role) => role.name === 'mahasiswa')) {
            computedRightNavItems.push({ title: 'Dashboard Mahasiswa', href: '/mahasiswa/dashboard', icon: LayoutDashboard });
        } else if (auth.permissions?.includes('internships.view')) {
            computedRightNavItems.push({ title: 'Dashboard', href: '/internships', icon: LayoutDashboard });
        }
        computedRightNavItems.push({ title: 'Panduan', href: '/buku-panduan', icon: BookOpen });
    }
    return (
        <>
            <div className="border-sidebar-border/80 border-b shadow-sm">
                <div className="mx-auto flex h-20 items-center px-6 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-accent/50 focus-visible:ring-ring mr-3 h-10 w-10 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between">
                                <SheetTitle className="sr-only">Navigasi Menu</SheetTitle>
                                <SheetHeader className="flex justify-start p-4 text-left">
                                    <AppLogoIcon />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-6 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-5">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className={cn(
                                                        'hover:bg-accent/80 flex items-center space-x-3 rounded-md px-3 py-2 font-medium transition-colors duration-150 dark:hover:bg-neutral-700/80',
                                                        isActive(item.href) &&
                                                            'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-5">
                                            {computedRightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.href}
                                                    rel="noopener noreferrer"
                                                    className={cn(
                                                        'hover:bg-accent/80 flex items-center space-x-3 rounded-md px-3 py-2 font-medium transition-colors duration-150 dark:hover:bg-neutral-700/80',
                                                        isActive(item.href) &&
                                                            'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground',
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
                    <div className="ml-8 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-4">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                isActive(item.href) && activeItemStyles,
                                                'hover:bg-accent/80 focus-visible:bg-accent/80 h-10 cursor-pointer px-4 py-2 transition-colors duration-150 dark:hover:bg-neutral-700/80 dark:focus-visible:bg-neutral-700/80',
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>
                                        {isActive(item.href) && (
                                            <div className="bg-primary dark:bg-primary-foreground absolute bottom-0 left-0 h-1 w-full translate-y-px"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-3">
                        {/* Search Button - Always visible */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="group hover:bg-accent/50 focus-visible:ring-ring h-10 w-10 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                        >
                            <Search className="!size-5 opacity-80 transition-opacity group-hover:opacity-100" />
                        </Button>

                        {/* Conditional rendering based on auth */}
                        {auth.user ? (
                            // Authenticated user view
                            <div className="flex items-center space-x-2">
                                {/* Links like Dashboard/Panduan - hidden on mobile */}
                                <div className="hidden lg:flex">
                                    {computedRightNavItems.map((item, index) => (
                                        <TooltipProvider key={index}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        className="group hover:bg-accent/50 focus-visible:ring-ring h-10 w-10 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                                                    >
                                                        <Link href={item.href} rel="noopener noreferrer">
                                                            {item.icon && (
                                                                <Icon
                                                                    iconNode={item.icon}
                                                                    className="!size-5 opacity-80 transition-opacity group-hover:opacity-100"
                                                                />
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
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="hover:bg-accent/50 focus-visible:ring-ring relative h-10 w-10 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
                                        >
                                            <Bell className="!size-5" />
                                            {unreadCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full p-0.5 text-[10px] font-medium text-white"
                                                >
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </Badge>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-96 shadow-lg">
                                        <div className="flex items-center justify-between p-3">
                                            <span className="text-base font-semibold">Notifikasi</span>
                                            {notifications.length > 0 && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="text-primary hover:text-primary/80 h-auto px-2 py-1 text-xs transition-colors"
                                                    onClick={handleMarkAllAsRead}
                                                    disabled={loading}
                                                >
                                                    Tandai semua terbaca
                                                </Button>
                                            )}
                                        </div>
                                        <DropdownMenuSeparator />
                                        {loading ? (
                                            <div className="text-muted-foreground p-4 text-center text-sm">Memuat notifikasi...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="text-muted-foreground p-6 text-center text-sm">Tidak ada notifikasi baru.</div>
                                        ) : (
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <DropdownMenuItem
                                                        key={notification.id}
                                                        className="hover:bg-muted/50 focus:bg-muted/60 cursor-pointer px-3 py-2.5 transition-colors duration-150"
                                                        onSelect={(e) => e.preventDefault()}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        <div className="flex flex-col space-y-0.5">
                                                            <p className="text-sm leading-snug">{notification.data.message}</p>
                                                            <p className="text-muted-foreground text-xs">
                                                                {new Date(notification.created_at).toLocaleString('id-ID', {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short',
                                                                })}
                                                            </p>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </div>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-primary hover:text-primary/80 dark:text-primary-foreground/80 dark:hover:text-primary-foreground hover:bg-muted/50 focus:bg-muted/60 cursor-pointer justify-center px-3 py-2.5 text-sm font-medium transition-colors duration-150"
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
                                        <Button
                                            variant="ghost"
                                            className="hover:ring-primary/50 focus-visible:ring-ring h-10 w-10 rounded-full p-0.5 transition-all hover:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                                        >
                                            <Avatar className="size-9 overflow-hidden rounded-full">
                                                <AvatarImage src={auth.user.avatar_url || undefined} alt={auth.user.name} />
                                                <AvatarFallback className="bg-muted text-foreground rounded-full dark:bg-neutral-700 dark:text-white">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-60 shadow-lg" align="end">
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            // Guest view
                            <div className="flex items-center space-x-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="hover:bg-accent/80 px-4 py-2 transition-colors">
                                        Masuk
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="px-4 py-2 transition-colors">
                                        Daftar
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b shadow-sm">
                    <div className="mx-auto flex h-14 w-full items-center justify-start px-6 text-neutral-500 md:max-w-7xl dark:text-neutral-400">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
