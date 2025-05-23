import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { SharedData } from '@/types';
import { Logbook } from '@/types/internship';
import { router, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Info } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Props {
    logbook?: Logbook;
    mode: 'create' | 'edit';
    internshipId: number; // Add internshipId prop
}

export default function LogbookForm({ logbook, mode, internshipId }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        // internship_id is handled by the route parameter, no need here
        date: logbook?.date || new Date().toISOString().split('T')[0], // Default to today for create
        activities: logbook?.activities || '',
        supervisor_notes: logbook?.supervisor_notes || '',
    });

    const { role } = usePage<SharedData>().props.auth;
    const isDosen = role === 'dosen';
    // Store parsed dates for the calendar UI
    const [startDate, setStartDate] = useState<Date | undefined>(data.date ? new Date(data.date) : undefined);

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit the form
        if (mode === 'create') {
            // Pass internshipId as route parameter
            post(route('front.internships.logbooks.store', internshipId));
        } else if (logbook) {
            // Pass internshipId and logbook.id as route parameters
            put(route('front.internships.logbooks.update', { internship: internshipId, logbook: logbook.id }));
        }
    };

    // For dosen in edit mode, only show the supervisor_notes field
    const isDosenEditMode = isDosen && mode === 'edit';

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    {isDosenEditMode && (
                        <div className="mb-4 flex items-center rounded-md bg-blue-50 p-3 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Info className="mr-2 h-5 w-5" />
                            <p>Sebagai Dosen, Anda hanya dapat mengedit bagian Catatan Pembimbing.</p>
                        </div>
                    )}

                    {/* Only show date and activities fields if not dosen in edit mode */}
                    {!isDosenEditMode && (
                        <>
                            <div className="space-y-4">
                                <Label htmlFor="question">Tanggal</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
                                            disabled={isDosen}
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
                                                setData('date', date ? format(date, 'yyyy-MM-dd') : '');
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={errors.date} />
                            </div>
                            <div className="space-y-4">
                                <Label htmlFor="activities">Aktivitas</Label>
                                <Textarea
                                    id="activities"
                                    value={data.activities}
                                    onChange={(e) => setData('activities', e.target.value)}
                                    className={errors.activities ? 'border-destructive' : ''}
                                    rows={5}
                                    placeholder="Jelaskan aktivitas yang Anda lakukan hari ini..."
                                    disabled={isDosen}
                                />
                                <InputError message={errors.activities} />
                            </div>
                        </>
                    )}

                    {/* Show supervisor_notes field for dosen or display it for students */}
                    {isDosen ? (
                        <div className="space-y-4">
                            <Label htmlFor="supervisor_notes">Catatan Pembimbing</Label>
                            <Textarea
                                id="supervisor_notes"
                                value={data.supervisor_notes}
                                onChange={(e) => setData('supervisor_notes', e.target.value)}
                                className={errors.supervisor_notes ? 'border-destructive' : ''}
                                rows={5}
                                placeholder="Berikan catatan atau umpan balik untuk aktivitas mahasiswa..."
                            />
                            <InputError message={errors.supervisor_notes} />
                        </div>
                    ) : (
                        mode === 'edit' && data.supervisor_notes && (
                            <div className="space-y-4">
                                <Label htmlFor="supervisor_notes_display">Catatan Pembimbing</Label>
                                <div className="rounded-md border border-input bg-gray-50 p-3 dark:bg-gray-900">
                                    {data.supervisor_notes || 'Belum ada catatan dari pembimbing.'}
                                </div>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('front.internships.logbooks.index', internshipId))}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Buat Logbook' : 'Simpan Perubahan'}
                </Button>
            </div>
        </form>
    );
}
