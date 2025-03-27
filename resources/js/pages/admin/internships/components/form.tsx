import InputError from '@/components/input-error';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'; // Import AlertDialog components
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Internship } from '..';

interface Props {
    internship: Internship;
}

export default function InternshipForm({ internship }: Props) {
    const { data, setData, put, errors, processing } = useForm({
        id: internship?.id || '',
        user_id: internship?.user_id || '',
        type: internship?.type || '',
        application_file: internship?.application_file || null,
        company_name: internship?.company_name || '',
        company_address: internship?.company_address || '',
        start_date: internship?.start_date || '',
        end_date: internship?.end_date || '',
        status: internship?.status || 'waiting',
        status_message: internship?.status_message || '',
        progress: internship?.progress || 0,
        progress_percentage: internship?.progress_percentage || 0,
    });

    // Store parsed dates for the calendar UI
    const [startDate, setStartDate] = useState<Date | undefined>(data.start_date ? new Date(data.start_date) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(data.end_date ? new Date(data.end_date) : undefined);

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Admin can only update internships
        // The actual submission logic is moved to the AlertDialogAction
    };

    const handleUpdateConfirm = () => {
        put(route('admin.internships.update', internship?.id));
    };

    // Get the advisor/lecturer information from the mahasiswa_profile relation
    const advisor = internship?.user?.mahasiswa_profile?.advisor;
    return (
        <form onSubmit={onSubmit}>
            <Tabs defaultValue="internship" className="w-full">
                <div className="flex items-start gap-6">
                    {' '}
                    {/* Flex container for list and content */}
                    <TabsList className="bg-muted/50 flex h-auto w-1/4 flex-col space-y-2 rounded-lg p-3">
                        <TabsTrigger
                            value="internship"
                            className="data-[state=active]:bg-background w-full justify-start rounded-md px-4 py-3 text-sm font-medium transition-all data-[state=active]:shadow-sm"
                        >
                            Data Magang
                        </TabsTrigger>
                        <TabsTrigger
                            value="mahasiswa"
                            className="data-[state=active]:bg-background w-full justify-start rounded-md px-4 py-3 text-sm font-medium transition-all data-[state=active]:shadow-sm"
                        >
                            Informasi Mahasiswa
                        </TabsTrigger>
                        <TabsTrigger
                            value="dosen"
                            className="data-[state=active]:bg-background w-full justify-start rounded-md px-4 py-3 text-sm font-medium transition-all data-[state=active]:shadow-sm"
                        >
                            Dosen Pembimbing
                        </TabsTrigger>
                    </TabsList>
                    <div className="w-3/4">
                        {' '}
                        {/* Container for Content Panels */}
                        {/* Student Information Content */}
                        <TabsContent value="mahasiswa">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">Informasi Mahasiswa</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="student_name">Nama Mahasiswa</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {internship?.user?.name || 'Tidak ada data'}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="student_email">Email Mahasiswa</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {internship?.user?.email || 'Tidak ada data'}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="student_number">NIM</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {internship?.user?.mahasiswa_profile?.student_number || 'Tidak ada data'}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="study_program">Program Studi</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {internship?.user?.mahasiswa_profile?.study_program || 'Tidak ada data'}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        {/* Lecturer Information Content */}
                        <TabsContent value="dosen">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">Dosen Pembimbing</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="advisor_name">Nama Dosen</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {advisor?.name || 'Tidak ada data'} {/* Added fallback */}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="advisor_email">Email Dosen</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {advisor?.email || 'Tidak ada data'} {/* Added fallback */}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="advisor_expertise">Bidang Keahlian</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {advisor?.dosen_profile?.expertise || 'Tidak ada data'} {/* Added fallback */}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="advisor_position">Jabatan Akademik</Label>
                                    <div className="mt-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                                        {advisor?.dosen_profile?.academic_position || 'Tidak ada data'} {/* Added fallback */}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        {/* Internship Details Content */}
                        <TabsContent value="internship" className="space-y-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium">Data Magang</h3>
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="waiting">Menunggu</SelectItem>
                                        <SelectItem value="accepted">Disetujui</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            {(data.status === 'accepted' || data.status === 'rejected') && (
                                <div className="space-y-4">
                                    <Label htmlFor="status_message">{data.status === 'accepted' ? 'Pesan Penerimaan' : 'Alasan Penolakan'}</Label>
                                    <Textarea
                                        id="status_message"
                                        value={data.status_message}
                                        onChange={(e) => setData('status_message', e.target.value)}
                                        placeholder={
                                            data.status === 'accepted'
                                                ? 'Tambahkan pesan penerimaan disini...'
                                                : 'Tambahkan alasan penolakan disini...'
                                        }
                                        rows={4}
                                    />
                                    <InputError message={errors.status_message} />
                                </div>
                            )}
                            <div className="space-y-4">
                                <Label htmlFor="type">Tipe Magang</Label>
                                <Select value={data.type} onValueChange={(value) => setData('type', value)} disabled={true}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe magang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kkl">Kuliah Kerja Lapangan (KKL)</SelectItem>
                                        <SelectItem value="kkn">Kuliah Kerja Nyata (KKN)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="company_name">Nama Perusahaan</Label>
                                <Input
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    readOnly
                                />
                                <InputError message={errors.company_name} />
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="company_address">Alamat Perusahaan</Label>
                                <Input
                                    id="company_address"
                                    value={data.company_address}
                                    onChange={(e) => setData('company_address', e.target.value)}
                                    readOnly
                                />
                                <InputError message={errors.company_address} />
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="application_file">File Aplikasi</Label>
                                {data.application_file && typeof data.application_file === 'string' && (
                                    <p className="text-sm text-gray-500">
                                        File saat ini:{' '}
                                        <a
                                            href={'/storage/' + data.application_file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {data.application_file.split('/').pop()}
                                        </a>
                                    </p>
                                )}
                                <InputError message={errors.application_file} />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
                                                disabled={true}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, 'PPP') : <span>Pilih tanggal</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(date) => {
                                                    setStartDate(date);
                                                    setData('start_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                }}
                                                initialFocus
                                                disabled
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.start_date} />
                                </div>

                                <div className="space-y-4">
                                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={`w-full justify-start text-left font-normal ${!endDate && 'text-muted-foreground'}`}
                                                disabled={true}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, 'PPP') : <span>Pilih tanggal</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={(date) => {
                                                    setEndDate(date);
                                                    setData('end_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                }}
                                                initialFocus
                                                disabled
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>
                        </TabsContent>
                    </div>{' '}
                    {/* End Content Panels Container */}
                </div>{' '}
                {/* End Flex Container */}
            </Tabs>{' '}
            {/* End Main Tabs Component */}
            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('admin.internships.index'))}>
                    Batal
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" disabled={processing}>
                            {' '}
                            {/* Change type to button */}
                            Perbarui Magang
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Perubahan</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin memperbarui data magang ini? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUpdateConfirm} disabled={processing}>
                                Ya, Perbarui
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </form>
    );
}
