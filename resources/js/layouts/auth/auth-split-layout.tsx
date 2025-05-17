import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleDropdown from '@/components/appearance-dropdown'; // Added import
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
    brandingHeadline?: string;
    brandingSubHeadline?: string;
    brandingDescription?: string;
    brandingButtonText?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    brandingHeadline = 'Selamat Datang!',
    brandingSubHeadline = 'Masuk dan Verifikasi',
    brandingDescription = 'Semangat menjalani pengalaman berharga dalam kegiatan KKL dan KKN! Masuk dan mulai perjalananmu sekarang.',
    brandingButtonText = 'Kuliah kerja Lapang & Kuliah Kerja Nyata',
}: PropsWithChildren<AuthLayoutProps>) {
    const { app } = usePage<SharedData>().props;

    return (
        <div className="from-primary dark:from-primary/20 flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-r to-white dark:bg-gradient-to-tl dark:via-gray-900 dark:to-gray-900">
            <div className="absolute top-4 right-4 z-50">
                <AppearanceToggleDropdown />
            </div>
            <div className="relative grid h-[700px] w-full max-w-4xl overflow-hidden rounded-tl-4xl rounded-tr-none rounded-br-4xl rounded-bl-none bg-white shadow-xl lg:grid-cols-2 dark:bg-gray-800">
                {/* Left Panel: Branding */}
                <div className="relative m-5 hidden flex-col rounded-tl-3xl rounded-tr-none rounded-br-4xl rounded-bl-none bg-[var(--primary)] p-10 text-white lg:flex dark:border-r">
                    {/* <div className="absolute inset-0 bg-[var(--primary)]" /> */}
                    <div className="relative z-20 flex w-full items-center justify-center text-lg font-medium">
                        <Link href={route('home')} rel="noopener noreferrer" className="flex items-center" prefetch>
                            <AppLogoIcon width={32} height={32} className="mr-2" />
                            <span>FAKULTAS ILMU KOMPUTER</span>
                        </Link>
                    </div>
                    <div className="relative z-10 mt-auto flex flex-grow flex-col justify-center text-center">
                        <blockquote className="space-y-2">
                            <p className="mb-15 text-3xl font-bold">{brandingHeadline}</p>
                            <p className="text-lg">{brandingSubHeadline}</p>
                            <footer className="text-sm">{brandingDescription}</footer>
                        </blockquote>
                    </div>
                    <div className="relative z-20 mt-8">
                        <button
                            type="button"
                            className="hover:bg-accent-foreground w-full rounded-3xl bg-[var(--primary-foreground)] px-4 py-2 text-center text-[var(--primary)] transition-colors"
                        >
                            {brandingButtonText}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="flex h-full items-center justify-center overflow-y-auto bg-white p-8 lg:p-8 dark:bg-gray-800">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                        <Link
                            href={route('home')}
                            className="relative z-20 flex items-center justify-center text-lg font-medium lg:hidden dark:text-[var(--foreground)]"
                        >
                            <AppLogoIcon width={24} height={24} className="mr-2" />
                            {app?.name}
                        </Link>
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight dark:text-[var(--foreground)]">{title}</h1>
                            <p className="text-muted-foreground text-sm">{description}</p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
