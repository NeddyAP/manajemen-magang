import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Lecturer, Role, User } from '@/types/user';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { FormEventHandler } from 'react';

interface Props {
    roles: Role[];
    user?: User;
    lecturers: Lecturer[];
    mode: 'create' | 'edit';
}

// Generate year options for the combobox
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => (currentYear - i).toString()); // currentYear down to 1970

export default function UserForm({ roles, user, lecturers, mode }: Props) {
    const [activeTab, setActiveTab] = React.useState('user');
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [openTeachingYearCombobox, setOpenTeachingYearCombobox] = React.useState(false);
    const [openClassYearCombobox, setOpenClassYearCombobox] = React.useState(false);

    const { data, setData, post, errors, processing } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        roles: user?.roles?.map((r) => r.name) || [],
        // Admin Profile
        employee_id: user?.admin_profile?.employee_id || '',
        department: user?.admin_profile?.department || '',
        position: user?.admin_profile?.position || '',
        employment_status: user?.admin_profile?.employment_status || user?.dosen_profile?.employment_status || '',
        join_date: user?.admin_profile?.join_date || '',
        phone_number: user?.admin_profile?.phone_number || '',
        address: user?.admin_profile?.address || '',
        supervisor_name: user?.admin_profile?.supervisor_name || '',
        work_location: user?.admin_profile?.work_location || '',
        // Dosen Profile
        employee_number: user?.dosen_profile?.employee_number || '',
        expertise: user?.dosen_profile?.expertise || '',
        last_education: user?.dosen_profile?.last_education || '',
        academic_position: user?.dosen_profile?.academic_position || '',
        teaching_start_year: user?.dosen_profile?.teaching_start_year?.toString() || '',
        // Mahasiswa Profile
        student_number: user?.mahasiswa_profile?.student_number || '',
        study_program: user?.mahasiswa_profile?.study_program || '',
        class_year: user?.mahasiswa_profile?.class_year?.toString() || '',
        academic_status: user?.mahasiswa_profile?.academic_status || 'Aktif',
        semester: user?.mahasiswa_profile?.semester || '',
        advisor_id: user?.mahasiswa_profile?.advisor_id || '',
        gpa: user?.mahasiswa_profile?.gpa || '',
    });

    const selectedRole = mode === 'create' ? data.roles[0] : user?.roles?.[0]?.name;

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Prepare payload with a general record type using 'any'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: Record<string, any> = { ...data };

        if (selectedRole === 'mahasiswa') {
            payload.semester = data.semester ? parseInt(data.semester.toString(), 10) || null : null;
            payload.gpa = data.gpa ? parseFloat(data.gpa.toString()) || null : null;
            payload.advisor_id = data.advisor_id ? parseInt(data.advisor_id.toString(), 10) || null : null;
        }

        // Use payload in post/put calls
        if (mode === 'create') {
            post(route('admin.users.store'), payload);
        } else {
            router.put(route('admin.users.update', user?.id), payload, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const onRoleChange = (value: string) => {
        setData('roles', [value]);
        setActiveTab('user');
    };

    const onTabChange = (value: string) => {
        if (value === 'profile' && !selectedRole && mode === 'create') {
            return;
        }
        setActiveTab(value);
    };

    return (
        <form onSubmit={onSubmit}>
            <Progress value={activeTab === 'user' ? 50 : 100} className="mb-4" />

            <Tabs value={activeTab} className="w-full" onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user">Informasi Pengguna</TabsTrigger>
                    <TabsTrigger
                        value="profile"
                        disabled={mode === 'create' && !selectedRole}
                        className={mode === 'create' && !selectedRole ? 'cursor-not-allowed opacity-50' : ''}
                    >
                        Informasi Profil
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="user">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            {mode === 'create' && (
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={selectedRole} onValueChange={onRoleChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.roles} />
                                    {mode === 'create' && !selectedRole && (
                                        <p className="text-muted-foreground text-sm">Silakan pilih role untuk mengakses informasi profil.</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Masukkan alamat email"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {(mode === 'create' || data.password) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder={mode === 'create' ? 'Masukkan password' : 'Kosongkan jika tidak ingin mengubah'}
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            placeholder="Konfirmasi password baru"
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            {selectedRole === 'admin' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">ID Karyawan</Label>
                                        <Input
                                            id="employee_id"
                                            value={data.employee_id}
                                            onChange={(e) => setData('employee_id', e.target.value)}
                                            placeholder="Masukkan ID Karyawan"
                                        />
                                        <InputError message={errors.employee_id} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Departemen</Label>
                                        <Input
                                            id="department"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                            placeholder="Masukkan departemen"
                                        />
                                        <InputError message={errors.department} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Posisi</Label>
                                        <Input
                                            id="position"
                                            value={data.position}
                                            onChange={(e) => setData('position', e.target.value)}
                                            placeholder="Masukkan posisi"
                                        />
                                        <InputError message={errors.position} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employment_status">Status Kepegawaian</Label>
                                        <Select value={data.employment_status} onValueChange={(value) => setData('employment_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tetap">Tetap</SelectItem>
                                                <SelectItem value="Kontrak">Kontrak</SelectItem>
                                                <SelectItem value="Magang">Magang</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.employment_status} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="join_date">Tanggal Bergabung</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !data.join_date && 'text-muted-foreground',
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.join_date ? (
                                                        format(new Date(data.join_date), 'PPP', { locale: id })
                                                    ) : (
                                                        <span>Pilih tanggal</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.join_date ? new Date(data.join_date) : undefined}
                                                    onSelect={(date) => setData('join_date', date ? format(date, 'yyyy-MM-dd') : '')}
                                                    initialFocus
                                                    locale={id}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <InputError message={errors.join_date} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number">Nomor Telepon</Label>
                                        <Input
                                            id="phone_number"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                            placeholder="Masukkan nomor telepon"
                                        />
                                        <InputError message={errors.phone_number} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Masukkan alamat"
                                        />
                                        <InputError message={errors.address} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="supervisor_name">Nama Supervisor</Label>
                                        <Input
                                            id="supervisor_name"
                                            value={data.supervisor_name}
                                            onChange={(e) => setData('supervisor_name', e.target.value)}
                                            placeholder="Masukkan nama supervisor"
                                        />
                                        <InputError message={errors.supervisor_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="work_location">Lokasi Kerja</Label>
                                        <Input
                                            id="work_location"
                                            value={data.work_location}
                                            onChange={(e) => setData('work_location', e.target.value)}
                                            placeholder="Masukkan lokasi kerja"
                                        />
                                        <InputError message={errors.work_location} />
                                    </div>
                                </>
                            )}

                            {selectedRole === 'dosen' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_number">Nomor Induk Pegawai (NIP)</Label>
                                        <Input
                                            id="employee_number"
                                            value={data.employee_number}
                                            onChange={(e) => setData('employee_number', e.target.value)}
                                            placeholder="Masukkan NIP"
                                        />
                                        <InputError message={errors.employee_number} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expertise">Keahlian</Label>
                                        <Input
                                            id="expertise"
                                            value={data.expertise}
                                            onChange={(e) => setData('expertise', e.target.value)}
                                            placeholder="Masukkan bidang keahlian"
                                        />
                                        <InputError message={errors.expertise} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_education">Pendidikan Terakhir</Label>
                                        <Input
                                            id="last_education"
                                            value={data.last_education}
                                            onChange={(e) => setData('last_education', e.target.value)}
                                            placeholder="Contoh: S2 Teknik Informatika"
                                        />
                                        <InputError message={errors.last_education} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="academic_position">Jabatan Akademik</Label>
                                        <Input
                                            id="academic_position"
                                            value={data.academic_position}
                                            onChange={(e) => setData('academic_position', e.target.value)}
                                            placeholder="Contoh: Lektor Kepala"
                                        />
                                        <InputError message={errors.academic_position} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employment_status">Status Kepegawaian</Label>
                                        <Select value={data.employment_status} onValueChange={(value) => setData('employment_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PNS">PNS</SelectItem>
                                                <SelectItem value="Non-PNS">Non-PNS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.employment_status} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="teaching_start_year">Tahun Mulai Mengajar</Label>
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
                                </>
                            )}

                            {selectedRole === 'mahasiswa' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="student_number">Nomor Induk Mahasiswa (NIM)</Label>
                                        <Input
                                            id="student_number"
                                            value={data.student_number}
                                            onChange={(e) => setData('student_number', e.target.value)}
                                            placeholder="Masukkan NIM"
                                        />
                                        <InputError message={errors.student_number} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="advisor_id">Dosen Pembimbing Akademik</Label>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openCombobox}
                                                    className="w-full justify-between"
                                                >
                                                    {data.advisor_id
                                                        ? lecturers.find((lecturer) => lecturer.id === data.advisor_id)?.name
                                                        : 'Pilih pembimbing'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Cari dosen..." />
                                                    <CommandEmpty>Dosen tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandItem
                                                            value="none"
                                                            onSelect={() => {
                                                                setData('advisor_id', '');
                                                                setOpenCombobox(false);
                                                            }}
                                                        >
                                                            <Check className={cn('mr-2 h-4 w-4', !data.advisor_id ? 'opacity-100' : 'opacity-0')} />
                                                            Tidak ada Pembimbing
                                                        </CommandItem>
                                                        {lecturers.map((lecturer) => (
                                                            <CommandItem
                                                                key={lecturer.id}
                                                                value={lecturer.name}
                                                                onSelect={() => {
                                                                    setData('advisor_id', lecturer.id.toString());
                                                                    setOpenCombobox(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        data.advisor_id === lecturer.id.toString() ? 'opacity-100' : 'opacity-0',
                                                                    )}
                                                                />
                                                                {lecturer.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <InputError message={errors.advisor_id} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="study_program">Program Studi</Label>
                                        <Input
                                            id="study_program"
                                            value={data.study_program}
                                            onChange={(e) => setData('study_program', e.target.value)}
                                            placeholder="Masukkan program studi"
                                        />
                                        <InputError message={errors.study_program} />
                                    </div>
                                    <div className="space-y-2">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="academic_status">Status Akademik</Label>
                                        <Select value={data.academic_status} onValueChange={(value) => setData('academic_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Aktif">Aktif</SelectItem>
                                                <SelectItem value="Cuti">Cuti</SelectItem>
                                                <SelectItem value="Lulus">Lulus</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.academic_status} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Semester</Label>
                                        <Input
                                            id="semester"
                                            type="number"
                                            min="1"
                                            max="14"
                                            value={data.semester}
                                            onChange={(e) => setData('semester', e.target.value)}
                                            placeholder="Masukkan semester saat ini (1-14)"
                                        />
                                        <InputError message={errors.semester} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gpa">IPK</Label>
                                        <Input
                                            id="gpa"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={data.gpa}
                                            onChange={(e) => setData('gpa', e.target.value)}
                                            placeholder="Masukkan IPK (0.00 - 4.00)"
                                        />
                                        <InputError message={errors.gpa} />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('admin.users.index'))}>
                    Batal
                </Button>
                {activeTab === 'user' ? (
                    <Button type="button" onClick={() => setActiveTab('profile')} disabled={mode === 'create' && !selectedRole}>
                        Selanjutnya
                    </Button>
                ) : (
                    <>
                        <Button type="button" variant="outline" onClick={() => setActiveTab('user')}>
                            Sebelumnya
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {mode === 'create' ? 'Buat Pengguna' : 'Update Pengguna'}
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
}
