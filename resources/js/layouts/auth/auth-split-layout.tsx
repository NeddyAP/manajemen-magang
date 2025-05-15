import AppLogoIcon from '@/components/app-logo-icon';
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
        <div className="flex min-h-dvh flex-col items-center justify-center bg-transparent">
            <div className="relative grid w-full max-w-4xl lg:grid-cols-2 rounded-tl-4xl rounded-br-4xl rounded-tr-none rounded-bl-none shadow-xl overflow-hidden">
                {/* Left Panel: Branding */}
                <div className="relative hidden h-full flex-col bg-[var(--primary)] p-10 text-white lg:flex dark:border-r">
                    {/* <div className="absolute inset-0 bg-[var(--primary)]" /> */}
                    <div className="relative z-20 flex items-center justify-center text-lg font-medium w-full">
                        <AppLogoIcon width={32} height={32} className="mr-2" />
                        <span>FAKULTAS ILMU KOMPUTER</span>
                    </div>
                    <div className="relative z-10 mt-auto text-center flex-grow flex flex-col justify-center">
                        <blockquote className="space-y-2">
                            <p className="text-3xl font-bold mb-15">{brandingHeadline}</p>
                            <p className="text-lg">{brandingSubHeadline}</p>
                            <footer className="text-sm">{brandingDescription}</footer>
                        </blockquote>
                    </div>
                    <div className="relative z-20 mt-8">
                        <button
                            type="button"
                            className="w-full rounded-3xl bg-[var(--primary-foreground)] px-4 py-2 text-center text-[var(--primary)] transition-colors hover:bg-accent-foreground"
                        >
                            {brandingButtonText}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="flex h-full items-center justify-center p-8 lg:p-8 bg-white dark:bg-gray-800">
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
