import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FrontLayout from '@/layouts/front-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan Profil',
        href: '/settings/profile',
    },
];

interface ProfileForm {
    name: string;
    email: string;
    employee_number?: string;
    expertise?: string;
    last_education?: string;
    academic_position?: string;
    employment_status?: string;
    teaching_start_year?: string;
    student_number?: string;
    study_program?: string;
    class_year?: string;
    academic_status?: string;
    semester?: string;
    advisor_id?: string;
    gpa?: string;
}

interface ProfileProps {
    mustVerifyEmail: boolean;
    status?: string;
    profile?: Partial<ProfileForm>;
}

// Generate year options for the combobox
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => (currentYear - i).toString()); // currentYear down to 1970

export default function Profile({ mustVerifyEmail, status, profile = {} }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const isDosen = auth.role === 'dosen';
    const isMahasiswa = auth.role === 'mahasiswa';
    const [openTeachingYearCombobox, setOpenTeachingYearCombobox] = React.useState(false);
    const [openClassYearCombobox, setOpenClassYearCombobox] = React.useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        // Dosen fields
        employee_number: profile?.employee_number || '',
        expertise: profile?.expertise || '',
        last_education: profile?.last_education || '',
        academic_position: profile?.academic_position || '',
        employment_status: profile?.employment_status || '',
        teaching_start_year: profile?.teaching_start_year?.toString() || '', // Ensure it's string
        // Mahasiswa fields
        student_number: profile?.student_number || '',
        study_program: profile?.study_program || '',
        class_year: profile?.class_year?.toString() || '', // Ensure it's string
        academic_status: profile?.academic_status || '',
        semester: profile?.semester || '',
        advisor_id: profile?.advisor_id || '',
        gpa: profile?.gpa || '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Profil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Informasi Profil" description="Perbarui informasi profil Anda" />

                    <form onSubmit={submit} className="space-y-6">
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

                        {isDosen && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="employee_number">Nomor Induk Dosen</Label>
                                        <Input
                                            id="employee_number"
                                            value={data.employee_number}
                                            onChange={(e) => setData('employee_number', e.target.value)}
                                            required
                                            placeholder="Nomor induk dosen"
                                        />
                                        <InputError message={errors.employee_number} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="expertise">Bidang Keahlian</Label>
                                        <Input
                                            id="expertise"
                                            value={data.expertise}
                                            onChange={(e) => setData('expertise', e.target.value)}
                                            required={isDosen}
                                            placeholder="Bidang keahlian"
                                        />
                                        <InputError message={errors.expertise} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="last_education">Pendidikan Terakhir</Label>
                                        <Input
                                            id="last_education"
                                            value={data.last_education}
                                            onChange={(e) => setData('last_education', e.target.value)}
                                            required={isDosen}
                                            placeholder="Pendidikan terakhir"
                                        />
                                        <InputError message={errors.last_education} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="academic_position">Jabatan Akademik</Label>
                                        <Input
                                            id="academic_position"
                                            value={data.academic_position}
                                            onChange={(e) => setData('academic_position', e.target.value)}
                                            required
                                            placeholder="Jabatan akademik"
                                        />
                                        <InputError message={errors.academic_position} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label>Status Kepegawaian</Label>
                                        <Select value={data.employment_status} onValueChange={(value) => setData('employment_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status kepegawaian" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PNS">PNS</SelectItem>
                                                <SelectItem value="Non-PNS">Non-PNS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.employment_status} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Tahun Mulai Mengajar</Label>
                                        <Popover open={openTeachingYearCombobox} onOpenChange={setOpenTeachingYearCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openTeachingYearCombobox}
                                                    className={cn('w-full justify-between', !data.teaching_start_year && 'text-muted-foreground')}
                                                >
                                                    {data.teaching_start_year ? data.teaching_start_year : 'Pilih tahun'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Cari tahun..." />
                                                    <CommandEmpty>Tahun tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {years.map((year) => (
                                                            <CommandItem
                                                                key={year}
                                                                value={year}
                                                                onSelect={(currentValue) => {
                                                                    setData(
                                                                        'teaching_start_year',
                                                                        currentValue === data.teaching_start_year ? '' : currentValue,
                                                                    );
                                                                    setOpenTeachingYearCombobox(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        data.teaching_start_year === year ? 'opacity-100' : 'opacity-0',
                                                                    )}
                                                                />
                                                                {year}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <InputError message={errors.teaching_start_year} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isMahasiswa && (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="student_number">Nomor Induk Mahasiswa</Label>
                                        <Input
                                            id="student_number"
                                            value={data.student_number}
                                            onChange={(e) => setData('student_number', e.target.value)}
                                            required
                                            placeholder="Nomor induk mahasiswa"
                                        />
                                        <InputError message={errors.student_number} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="study_program">Program Studi</Label>
                                        <Input
                                            id="study_program"
                                            value={data.study_program}
                                            onChange={(e) => setData('study_program', e.target.value)}
                                            required
                                            placeholder="Program studi"
                                        />
                                        <InputError message={errors.study_program} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="class_year">Tahun Angkatan</Label>
                                        <Popover open={openClassYearCombobox} onOpenChange={setOpenClassYearCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openClassYearCombobox}
                                                    className={cn('w-full justify-between', !data.class_year && 'text-muted-foreground')}
                                                >
                                                    {data.class_year ? data.class_year : 'Pilih tahun'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[200px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Cari tahun..." />
                                                    <CommandEmpty>Tahun tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {years.map((year) => (
                                                            <CommandItem
                                                                key={year}
                                                                value={year}
                                                                onSelect={(currentValue) => {
                                                                    setData('class_year', currentValue === data.class_year ? '' : currentValue);
                                                                    setOpenClassYearCombobox(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        data.class_year === year ? 'opacity-100' : 'opacity-0',
                                                                    )}
                                                                />
                                                                {year}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <InputError message={errors.class_year} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label>Status Akademik</Label>
                                        <Select value={data.academic_status} onValueChange={(value) => setData('academic_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status akademik" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Aktif">Aktif</SelectItem>
                                                <SelectItem value="Cuti">Cuti</SelectItem>
                                                <SelectItem value="Lulus">Lulus</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.academic_status} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="semester">Semester</Label>
                                        <Input
                                            id="semester"
                                            type="number"
                                            value={data.semester}
                                            onChange={(e) => setData('semester', e.target.value)}
                                            required
                                            min="1"
                                            max="14"
                                            placeholder="Semester saat ini"
                                        />
                                        <InputError message={errors.semester} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="gpa">IPK</Label>
                                        <Input
                                            id="gpa"
                                            type="number"
                                            step="0.01"
                                            value={data.gpa}
                                            onChange={(e) => setData('gpa', e.target.value)}
                                            min="0"
                                            max="4"
                                            placeholder="Indeks Prestasi Kumulatif"
                                        />
                                        <InputError message={errors.gpa} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Alamat email Anda belum terverifikasi.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
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
                                enterTo="opacity-100"
                                leave="transition ease-in-out"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Tersimpan</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </FrontLayout>
    );
}
