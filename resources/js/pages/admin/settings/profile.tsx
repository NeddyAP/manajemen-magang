import { type BreadcrumbItem, type SharedData, type User } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/admin/settings/profile',
    },
];

interface ProfileForm {
    name: string;
    email: string;
    avatar?: File | null;
    employee_id: string;
    department: string;
    position: string;
    employment_status: string;
    join_date: string;
    phone_number: string;
    address: string;
    supervisor_name: string;
    work_location: string;
}

// This ProfileData interface seems redundant if ProfileForm is used for the form and props.
// Let's define props more directly.
interface ProfilePageProps {
    mustVerifyEmail: boolean;
    status?: string;
    profile?: Partial<Omit<ProfileForm, 'name' | 'email' | 'avatar'>>; // Profile specific data, excluding base user data and avatar
}

export default function Profile({ mustVerifyEmail, status, profile = {} }: ProfilePageProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user as User & { avatar_url?: string | null };
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null);

    const { data, setData, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        employee_id: profile?.employee_id || '',
        department: profile?.department || '',
        position: profile?.position || '',
        employment_status: profile?.employment_status || '',
        join_date: profile?.join_date || '',
        phone_number: profile?.phone_number || '',
        address: profile?.address || '',
        supervisor_name: profile?.supervisor_name || '',
        work_location: profile?.work_location || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const submissionData = {
            ...data,
            _method: 'PATCH',
        } as unknown as FormData;

        router.post(route('profile.update'), submissionData, {
            preserveScroll: true,
            onSuccess: () => {
                if (avatarInputRef.current) {
                    avatarInputRef.current.value = '';
                }
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('avatar', null);
            setAvatarPreview(user.avatar_url || null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your profile information" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid items-center gap-3">
                            <Label htmlFor="avatar">Avatar</Label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={avatarPreview || undefined} alt={auth.user.name} />
                                    <AvatarFallback>{auth.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Input id="avatar" type="file" onChange={handleAvatarChange} ref={avatarInputRef} className="max-w-xs" />
                            </div>
                            <InputError message={errors.avatar} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama</Label>

                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Nama lengkap"
                            />

                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Alamat Email</Label>

                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Alamat email"
                            />

                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="employee_id">Nomor Induk Pegawai</Label>

                            <Input
                                id="employee_id"
                                value={data.employee_id}
                                onChange={(e) => setData('employee_id', e.target.value)}
                                required
                                placeholder="Nomor induk pegawai"
                            />

                            <InputError message={errors.employee_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="department">Departemen</Label>

                            <Input
                                id="department"
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                required
                                placeholder="Departemen"
                            />

                            <InputError message={errors.department} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="position">Jabatan</Label>

                            <Input
                                id="position"
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                required
                                placeholder="Jabatan"
                            />

                            <InputError message={errors.position} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Status Kepegawaian</Label>

                            <Select value={data.employment_status} onValueChange={(value) => setData('employment_status', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih status kepegawaian" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Tetap">Tetap</SelectItem>
                                    <SelectItem value="Kontrak">Kontrak</SelectItem>
                                    <SelectItem value="Magang">Magang</SelectItem>
                                </SelectContent>
                            </Select>

                            <InputError message={errors.employment_status} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Tanggal Bergabung</Label>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn('w-full justify-start text-left font-normal', !data.join_date && 'text-muted-foreground')}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.join_date ? format(new Date(data.join_date), 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.join_date ? new Date(data.join_date) : undefined}
                                        onSelect={(date) => setData('join_date', date?.toISOString() || '')}
                                        initialFocus
                                        locale={id}
                                    />
                                </PopoverContent>
                            </Popover>

                            <InputError message={errors.join_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone_number">Nomor Telepon</Label>

                            <Input
                                id="phone_number"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                                required
                                placeholder="Nomor telepon"
                            />

                            <InputError message={errors.phone_number} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Alamat</Label>

                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                required
                                placeholder="Alamat lengkap"
                            />

                            <InputError message={errors.address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="supervisor_name">Nama Supervisor</Label>

                            <Input
                                id="supervisor_name"
                                value={data.supervisor_name}
                                onChange={(e) => setData('supervisor_name', e.target.value)}
                                required
                                placeholder="Nama supervisor"
                            />

                            <InputError message={errors.supervisor_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="work_location">Lokasi Kerja</Label>

                            <Input
                                id="work_location"
                                value={data.work_location}
                                onChange={(e) => setData('work_location', e.target.value)}
                                required
                                placeholder="Lokasi kerja"
                            />

                            <InputError message={errors.work_location} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Alamat email Anda belum terverifikasi.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Klik di sini untuk mengirim ulang email verifikasi.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        Tautan verifikasi baru telah dikirim ke alamat email Anda.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Simpan</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Tersimpan</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
