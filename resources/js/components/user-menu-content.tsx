import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel className="px-2 py-2 font-normal">
                <div className="flex items-center gap-3 text-left">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="py-1">
                <DropdownMenuItem asChild className="hover:bg-muted/50 focus:bg-muted/60 cursor-pointer px-2 py-2 transition-colors duration-150">
                    <Link className="flex w-full items-center" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2.5 h-4 w-4" />
                        <span>Pengaturan Akun</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                asChild
                className="hover:bg-muted/50 focus:bg-muted/60 cursor-pointer px-2 py-2 text-red-600 transition-colors duration-150 focus:text-red-700 dark:text-red-500 dark:focus:text-red-400"
            >
                <Link className="flex w-full items-center" method="post" href={route('logout')} as="button" onClick={cleanup}>
                    <LogOut className="mr-2.5 h-4 w-4" />
                    <span>Keluar</span>
                </Link>
            </DropdownMenuItem>
        </>
    );
}
