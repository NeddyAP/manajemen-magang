import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon width={24} height={24} />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
            <div
                className="relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-100 via-sky-200 to-teal-600 transition-colors duration-200 dark:from-gray-800 dark:via-gray-900 dark:to-black" />
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <AppLogoIcon width={54} height={24} />
                    {name}
                </Link>
                <div className="relative z-10 flex h-full items-center justify-center">
                    <img 
                        src="/assets/hero-image.webp" 
                        alt="Background" 
                        className="h-auto w-full max-w-2xl object-contain p-6" 
                    />
                </div>
            </div>
        </div>
    );
}
