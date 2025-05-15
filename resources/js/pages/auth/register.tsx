import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout'; // Changed to AuthSplitLayout

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout
            title="Daftar Akun"
            description="Isi detail di bawah untuk membuat akun baru"
            brandingHeadline="Buat Akun Baru"
            brandingSubHeadline="Daftar dan Mulai Perjalananmu"
            brandingDescription="Bergabunglah dengan kami dan mulailah pengalaman KKL dan KKN yang tak terlupakan. Proses pendaftaran cepat dan mudah!"
            brandingButtonText="Pelajari Lebih Lanjut"
        >
            <Head title="Daftar Akun" />
            <form className="space-y-6" onSubmit={submit}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap*</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nama lengkap Anda"
                            className="rounded-md" // Added rounded corners
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email / akun pengguna*</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan email Anda"
                            className="rounded-md" // Added rounded corners
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password*</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan password"
                            className="rounded-md" // Added rounded corners
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password*</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Konfirmasi password Anda"
                            className="rounded-md" // Added rounded corners
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="w-full rounded-md bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Daftar
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">atau lanjutkan dengan</span>
                    </div>
                </div>

                <Button variant="outline" type="button" className="w-full rounded-md" tabIndex={6} disabled={processing}>
                    {/* Placeholder for Google Icon */}
                    {/* <Icon name="google" className="mr-2 h-4 w-4" /> */}
                    G Masuk dengan Google
                </Button>

                <div className="text-muted-foreground mt-6 text-center text-sm">
                    Sudah punya akun?{' '}
                    <TextLink href={route('login')} tabIndex={7}>
                        Masuk
                    </TextLink>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
