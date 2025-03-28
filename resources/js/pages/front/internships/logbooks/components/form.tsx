import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Logbook } from '@/types/internship';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
        activities: logbook?.activities || '', // Rename activity to activities
    });

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

    return (
        <form onSubmit={onSubmit}>
            {/* Progress bar */}
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="question">Tanggal</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`w-full justify-start text-left font-normal ${!startDate && 'text-muted-foreground'}`}
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
                        <Label htmlFor="activities">Aktivitas</Label> {/* Change htmlFor and id */}
                        <Textarea // Use Textarea instead of Input
                            id="activities"
                            value={data.activities} // Change data field name
                            onChange={(e) => setData('activities', e.target.value)} // Change setData field name
                            className={errors.activities ? 'border-destructive' : ''} // Check errors.activities
                            rows={5}
                            placeholder="Jelaskan aktivitas yang Anda lakukan hari ini..."
                        />
                        <InputError message={errors.activities} /> {/* Check errors.activities */}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                {/* Pass internshipId to the index route */}
                <Button type="button" variant="outline" onClick={() => router.get(route('front.internships.logbooks.index', internshipId))}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Buat Logbook' : 'Update Logbook'}
                </Button>
            </div>
        </form>
    );
}
