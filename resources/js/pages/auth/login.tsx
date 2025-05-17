import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox'; // "Ingat saya" removed
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout'; // Changed to AuthSplitLayout

type LoginForm = {
    email: string;
    password: string;
    remember: boolean; // Kept in form data for now, though UI element is removed
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false, // Default value
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        // Using AuthSplitLayout and updated title
        <AuthSplitLayout
            title="Login"
            description="Silakan masuk untuk melanjutkan"
            brandingHeadline="Selamat Datang!"
            brandingSubHeadline="Masuk untuk Melanjutkan"
            brandingDescription="Akses kembali akun Anda untuk melanjutkan progres KKL dan KKN. Kami senang melihat Anda lagi!"
        >
            <Head title="Login" />

            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email / akun pengguna*</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Masukkan email Anda"
                            className="rounded-md" // Added rounded corners
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password*</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="text-sm" tabIndex={3}>
                                    Lupa kata sandi?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Masukkan password"
                            className="rounded-md" // Added rounded corners
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* "Ingat saya" checkbox removed as per image */}

                    <Button
                        type="submit"
                        className="w-full rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Masuk
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background text-muted-foreground px-2">atau lanjutkan dengan</span>
                    </div>
                </div>

                <Button variant="outline" type="button" className="w-full rounded-md" tabIndex={5} disabled={processing}>
                    {/* Placeholder for Google Icon, assuming one might be added later */}
                    {/* <Icon name="google" className="mr-2 h-4 w-4" /> */}G Masuk dengan Google
                </Button>

                <div className="text-muted-foreground mt-6 text-center text-sm">
                    Belum punya akun?{' '}
                    <TextLink href={route('register')} tabIndex={6}>
                        Daftar
                    </TextLink>
                </div>
            </form>

            {status && <div className="mt-4 mb-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{status}</div>}
        </AuthSplitLayout>
    );
}
