import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { User as UserType } from '@/types/user';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Award as AwardIcon,
    BookOpen,
    Briefcase,
    Building,
    Edit as EditIcon,
    GitBranch,
    GraduationCap,
    Hash as HashIcon,
    Mail as MailIcon,
    MapPin,
    Milestone,
    Newspaper,
    Phone,
    UserCheck as UserCheckIcon,
    User as UserIcon,
    Users as UsersIcon,
    UsersRound,
} from 'lucide-react';
import React from 'react';

// Locally defined profile types based on User interface from @/types/user.ts
interface AdminProfileType {
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

interface DosenProfileType {
    employee_number: string;
    expertise: string;
    last_education: string;
    academic_position: string;
    employment_status: string;
    teaching_start_year: string | number;
}

interface MahasiswaProfileType {
    student_number: string;
    study_program: string;
    class_year: string | number;
    academic_status: string;
    semester: number;
    advisor_id: string | number;
    advisor: {
        name: string;
        email: string;
        roles?: { name: string }[];
        profile?: Record<string, unknown>;
        dosen_profile?: DosenProfileType; // Use local DosenProfileType
    };
    gpa: string | number;
}

interface ShowUserProps {
    user: UserType;
}

// Translation dictionary for profile keys
const fieldTranslations: Record<string, string> = {
    employee_id: 'ID Karyawan',
    department: 'Departemen',
    position: 'Posisi',
    employment_status: 'Status Kepegawaian',
    join_date: 'Tanggal Bergabung',
    phone_number: 'Nomor Telepon',
    address: 'Alamat',
    supervisor_name: 'Nama Supervisor',
    work_location: 'Lokasi Kerja',
    employee_number: 'NIDN/NIP',
    expertise: 'Keahlian',
    last_education: 'Pendidikan Terakhir',
    academic_position: 'Jabatan Akademik',
    teaching_start_year: 'Tahun Mulai Mengajar',
    student_number: 'NIM',
    study_program: 'Program Studi',
    class_year: 'Angkatan',
    academic_status: 'Status Akademik',
    semester: 'Semester',
    gpa: 'IPK',
    created_at: 'Dibuat Pada',
    updated_at: 'Diperbarui Pada',
    // Add other common fields here if needed
};

// Updated function to translate and format labels
const translateAndFormatDisplayLabel = (key: string) => {
    const translatedKey = fieldTranslations[key.toLowerCase()] || key;
    return translatedKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to format date-time strings
const formatReadableDateTime = (isoString: string | undefined | null): string => {
    if (!isoString || typeof isoString !== 'string') return isoString || '-'; // Return original or '-' if not a valid string
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) {
            // Check for invalid date
            return isoString; // Return original if date is invalid
        }
        // Example: "7 Mei 2025, 14:01"
        const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const formattedTime = date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
        });
        return `${formattedDate}, ${formattedTime}`;
    } catch {
        // Removed unused _error variable
        // console.error('Error formatting date:'); // Optional: log error without the variable
        return isoString; // Return original if parsing fails
    }
};

// New DetailItem component
interface DetailItemProps {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode | string | number | null | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => {
    if (value === null || typeof value === 'undefined' || value === '') {
        return null; // Don't render if value is empty, null, or undefined
    }
    return (
        <div className="flex flex-col py-2 sm:flex-row sm:items-start">
            <dt className="flex min-w-[180px] items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {icon && <span className="mr-2 h-5 w-5">{icon}</span>}
                {label}:
            </dt>
            <dd className="mt-1 text-sm break-words text-gray-900 sm:col-span-2 sm:mt-0 dark:text-gray-100">
                {typeof value === 'string' && value.startsWith('http') ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                        {value}
                    </a>
                ) : (
                    value
                )}
            </dd>
        </div>
    );
};

// UserProfileSection using DetailItem
const UserProfileSection: React.FC<{
    title: string;
    data: Partial<AdminProfileType | DosenProfileType | MahasiswaProfileType> | undefined | null;
    excludeKeys?: string[];
    iconMapping?: Record<string, React.ReactNode>;
}> = ({ title, data, excludeKeys = [], iconMapping = {} }) => {
    if (!data) return null;
    const currentData = data || {};
    const entries = Object.entries(currentData).filter(
        ([key]) => !excludeKeys.includes(key) && key !== 'id' && key !== 'user_id' && currentData[key as keyof typeof currentData],
    );
    if (entries.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map(([key, value]) => {
                    let finalDisplayValue: React.ReactNode | string | number | null | undefined;

                    if (typeof value === 'string' && (key === 'created_at' || key === 'updated_at')) {
                        finalDisplayValue = formatReadableDateTime(value);
                    } else if (typeof value === 'object' && value !== null && !React.isValidElement(value)) {
                        // For plain objects that are not React elements, convert to string to avoid type errors
                        // and mimic previous behavior of String(value).
                        // Consider a more sophisticated display for objects if needed.
                        finalDisplayValue = JSON.stringify(value, null, 2); // Pretty print JSON
                    } else {
                        // This covers primitives, React elements, null, undefined
                        finalDisplayValue = value;
                    }

                    return (
                        <DetailItem
                            key={key}
                            label={translateAndFormatDisplayLabel(key)}
                            value={finalDisplayValue} // Pass the processed value
                            icon={iconMapping[key]}
                        />
                    );
                })}
            </CardContent>
        </Card>
    );
};

// Icon mapping for profiles
const adminProfileIcons: Record<string, React.ReactNode> = {
    employee_id: <HashIcon />,
    department: <Building />,
    position: <Briefcase />,
    employment_status: <Newspaper />,
    join_date: <Milestone />,
    phone_number: <Phone />,
    address: <MapPin />,
    supervisor_name: <UserCheckIcon />,
    work_location: <MapPin />,
};

const dosenProfileIcons: Record<string, React.ReactNode> = {
    employee_number: <HashIcon />,
    expertise: <AwardIcon />,
    last_education: <GraduationCap />,
    academic_position: <Briefcase />,
    employment_status: <Newspaper />,
    teaching_start_year: <Milestone />,
};

const mahasiswaProfileIcons: Record<string, React.ReactNode> = {
    student_number: <HashIcon />,
    study_program: <BookOpen />,
    class_year: <UsersRound />,
    academic_status: <Newspaper />,
    semester: <GitBranch />,
    // advisor_id is excluded, advisor info shown separately
    gpa: <AwardIcon />,
};

export default function ShowUser({ user }: ShowUserProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Pengguna',
            href: route('admin.users.index'),
        },
        {
            title: user.name,
            href: route('admin.users.show', { user: user.id! }),
            isActive: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pengguna - ${user.name}`} />
            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-2xl font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                            {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                            <p className="text-md flex items-center text-gray-500 dark:text-gray-400">
                                <MailIcon className="mr-1.5 h-4 w-4" /> {user.email}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {user.roles?.map((role) => (
                                    <Badge key={role.name} variant="secondary" className="text-sm">
                                        <UsersIcon className="mr-1.5 h-3.5 w-3.5" /> {role.name.toUpperCase()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 self-start md:self-center">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.users.index')} className="flex items-center gap-1.5">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.users.edit', { user: user.id! })} className="flex items-center gap-1.5">
                                <EditIcon className="h-4 w-4" />
                                Ubah
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Umum</CardTitle>
                            </CardHeader>
                            <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                                <DetailItem icon={<HashIcon />} label="ID Pengguna" value={user.id} />
                                <DetailItem icon={<UserIcon />} label="Nama Lengkap" value={user.name} />
                                <DetailItem icon={<MailIcon />} label="Alamat Email" value={user.email} />
                                <DetailItem
                                    icon={<UsersIcon />}
                                    label="Peran"
                                    value={user.roles?.map((r) => (
                                        <Badge key={r.name} variant="outline" className="mr-1">
                                            {r.name}
                                        </Badge>
                                    ))}
                                />
                            </CardContent>
                        </Card>

                        {user.admin_profile && (
                            <UserProfileSection title="Profil Admin" data={user.admin_profile as AdminProfileType} iconMapping={adminProfileIcons} />
                        )}
                        {user.dosen_profile && (
                            <UserProfileSection title="Profil Dosen" data={user.dosen_profile as DosenProfileType} iconMapping={dosenProfileIcons} />
                        )}
                        {user.mahasiswa_profile && (
                            <UserProfileSection
                                title="Profil Mahasiswa"
                                data={user.mahasiswa_profile as MahasiswaProfileType}
                                excludeKeys={['advisor']}
                                iconMapping={mahasiswaProfileIcons}
                            />
                        )}
                    </div>

                    <div className="space-y-6 lg:col-span-2">
                        {user.roles?.some((role) => role.name === 'mahasiswa') && user.mahasiswa_profile?.advisor && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dosen Pembimbing</CardTitle>
                                </CardHeader>
                                <CardContent className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <DetailItem icon={<UserCheckIcon />} label="Nama" value={user.mahasiswa_profile.advisor.name} />
                                    <DetailItem icon={<MailIcon />} label="Alamat Email" value={user.mahasiswa_profile.advisor.email} />
                                    {user.mahasiswa_profile.advisor.dosen_profile && (
                                        <DetailItem
                                            icon={<HashIcon />}
                                            label="NIP"
                                            value={user.mahasiswa_profile.advisor.dosen_profile.employee_number}
                                        />
                                    )}
                                    {user.mahasiswa_profile.advisor.dosen_profile && (
                                        <DetailItem
                                            icon={<AwardIcon />}
                                            label="Keahlian"
                                            value={user.mahasiswa_profile.advisor.dosen_profile.expertise}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}
                        {/* Future cards for activity, etc. can go here */}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
