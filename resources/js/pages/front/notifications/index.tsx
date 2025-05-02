import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import FrontLayout from '@/layouts/front-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { MailOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Define Notification type matching backend structure
interface NotificationData {
    message: string;
    link: string | null; // Link can be null
    [key: string]: unknown; // Allow other properties, use unknown instead of any
}

interface Notification {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

// Define PaginatedResponse type based on Laravel structure
interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

// Update PageProps to extend SharedData
interface NotificationsPageProps extends SharedData {
    notifications: PaginatedResponse<Notification>;
}

export default function NotificationsIndex() {
    const { notifications: initialNotifications } = usePage<NotificationsPageProps>().props;
    const [notificationsData, setNotificationsData] = useState<PaginatedResponse<Notification>>(initialNotifications);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    // --- Action Handlers ---

    const handleMarkAsUnread = async (notificationId: string) => {
        setLoadingAction(`unread-${notificationId}`);
        try {
            await axios.post(route('api.notifications.markAsUnread'), { ids: [notificationId] });
            setNotificationsData((prevData) => ({
                ...prevData,
                data: prevData.data.map((n) => (n.id === notificationId ? { ...n, read_at: null } : n)),
            }));
            toast.success('Notifikasi ditandai belum dibaca.');
        } catch (error) {
            console.error('Error marking notification as unread:', error);
            toast.error('Gagal menandai notifikasi.');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDelete = async (notificationId: string) => {
        setLoadingAction(`delete-${notificationId}`);
        try {
            await axios.delete(route('api.notifications.destroy', notificationId));
            setNotificationsData((prevData) => ({
                ...prevData,
                data: prevData.data.filter((n) => n.id !== notificationId),
                total: prevData.total - 1,
            }));
            toast.success('Notifikasi dihapus.');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Gagal menghapus notifikasi.');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleNavigate = async (notification: Notification) => {
        if (!notification.read_at) {
            setLoadingAction(`read-${notification.id}`);
            try {
                await axios.post(route('api.notifications.markAsRead'), { ids: [notification.id] });
                setNotificationsData((prevData) => ({
                    ...prevData,
                    data: prevData.data.map((n) => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)),
                }));
            } catch (error) {
                console.error('Error marking notification as read:', error);
                toast.error('Gagal menandai notifikasi sebagai sudah dibaca.');
            } finally {
                setLoadingAction(null);
            }
        }

        if (notification.data.link) {
            router.visit(notification.data.link);
        }
    };

    // --- JSX ---

    return (
        <FrontLayout
            breadcrumbs={
                [
                    { title: 'Home', href: '/' },
                    { title: 'Notifikasi', href: route('notifications.index') },
                ] as BreadcrumbItem[]
            }
        >
            <Head title="Notifikasi" />
            <div className="flex h-full min-h-min flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative mx-auto w-full max-w-7xl flex-1 overflow-hidden">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Riwayat Notifikasi</h1>
                        <p className="text-muted-foreground">Lihat semua notifikasi Anda.</p>
                    </div>

                    <div className="space-y-4">
                        {notificationsData.data.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <p className="text-muted-foreground text-center">Anda belum memiliki notifikasi.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            notificationsData.data.map((notification: Notification) => (
                                <Card
                                    key={notification.id}
                                    className={cn('transition-colors', !notification.read_at ? 'border-primary/50 bg-primary/5' : 'border-border')}
                                >
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div
                                            className={cn('flex-1 space-y-1', notification.data.link ? 'cursor-pointer' : 'cursor-default')}
                                            onClick={() => notification.data.link && handleNavigate(notification)}
                                        >
                                            <p className={cn('text-sm font-medium', !notification.read_at && 'font-semibold')}>
                                                {notification.data.message}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {new Date(notification.created_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </p>
                                        </div>

                                        <div className="ml-4 flex items-center space-x-1">
                                            {notification.read_at && (
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsUnread(notification.id);
                                                                }}
                                                                disabled={loadingAction === `unread-${notification.id}`}
                                                            >
                                                                <MailOpen className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Tandai Belum Dibaca</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}

                                            <AlertDialog>
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive hover:text-destructive h-8 w-8"
                                                                    disabled={loadingAction === `delete-${notification.id}`}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Hapus Notifikasi</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tindakan ini tidak dapat dibatalkan. Notifikasi ini akan dihapus secara permanen.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(notification.id);
                                                            }}
                                                            className="bg-destructive hover:bg-destructive/90"
                                                        >
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {notificationsData.total > notificationsData.per_page && (
                        <Pagination className="mt-6">
                            <PaginationContent>
                                {notificationsData.prev_page_url && (
                                    <PaginationItem>
                                        <Link
                                            href={notificationsData.prev_page_url}
                                            preserveState
                                            preserveScroll
                                            className="ring-offset-background focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center gap-1 rounded-md px-4 py-2 pl-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            <PaginationPrevious className="h-4 w-4" />
                                            Previous
                                        </Link>
                                    </PaginationItem>
                                )}

                                {notificationsData.links.slice(1, -1).map((link, index) => (
                                    <PaginationItem key={index}>
                                        <PaginationLink href={link.url || '#'} isActive={link.active}>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                {notificationsData.next_page_url && (
                                    <PaginationItem>
                                        <Link
                                            href={notificationsData.next_page_url}
                                            preserveState
                                            preserveScroll
                                            className="ring-offset-background focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center gap-1 rounded-md px-4 py-2 pr-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                        >
                                            Next
                                            <PaginationNext className="h-4 w-4" />
                                        </Link>
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </FrontLayout>
    );
}
