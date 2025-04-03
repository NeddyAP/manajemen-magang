import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
        title: 'Profile settings',
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

export default function Profile({ mustVerifyEmail, status, profile = {} }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;
    const isDosen = auth.user.roles?.some((role) => role.name === 'dosen');
    const isMahasiswa = auth.user.roles?.some((role) => role.name === 'mahasiswa');

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        // Dosen fields
        employee_number: profile?.employee_number || '',
        expertise: profile?.expertise || '',
        last_education: profile?.last_education || '',
        academic_position: profile?.academic_position || '',
        employment_status: profile?.employment_status || '',
        teaching_start_year: profile?.teaching_start_year || '',
        // Mahasiswa fields
        student_number: profile?.student_number || '',
        study_program: profile?.study_program || '',
        class_year: profile?.class_year || '',
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
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your profile information" />

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
                                        <Input
                                            id="teaching_start_year"
                                            type="number"
                                            value={data.teaching_start_year}
                                            onChange={(e) => setData('teaching_start_year', e.target.value)}
                                            required
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            placeholder="Tahun mulai mengajar"
                                        />
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
                                        <Input
                                            id="class_year"
                                            type="number"
                                            value={data.class_year}
                                            onChange={(e) => setData('class_year', e.target.value)}
                                            required
                                            min="1900"
                                            max={new Date().getFullYear() + 4}
                                            placeholder="Tahun angkatan"
                                        />
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
