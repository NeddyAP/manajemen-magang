import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GuidanceClass } from '@/types/guidance-class';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FormEventHandler } from 'react';

interface Props {
    mode: 'create' | 'edit';
    guidanceClass?: GuidanceClass;
}

export default function GuidanceClassForm({ mode, guidanceClass }: Props) {
    const { data, setData, errors, processing, reset } = useForm({
        title: guidanceClass?.title ?? '',
        start_date: guidanceClass?.start_date ? new Date(guidanceClass.start_date) : undefined,
        end_date: guidanceClass?.end_date ? new Date(guidanceClass.end_date) : undefined,
        room: guidanceClass?.room ?? '',
        description: guidanceClass?.description ?? '',
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd HH:mm:ss') : null,
            end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd HH:mm:ss') : null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => reset(),
        };

        if (mode === 'create') {
            router.post(route('front.internships.guidance-classes.store'), payload, options);
        } else if (guidanceClass) {
            router.put(route('front.internships.guidance-classes.update', guidanceClass.id), payload, options);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="title">Judul Kelas</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className={errors.title ? 'border-destructive' : ''}
                        placeholder="Masukkan judul kelas"
                    />
                    <InputError message={errors.title} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="start_date">Tanggal Mulai</Label>
                        <DateTimePicker
                            locale={id}
                            value={data.start_date}
                            onChange={(date) => setData('start_date', date)}
                            granularity="minute"
                            hourCycle={24}
                            placeholder="Pilih tanggal mulai"
                            className={errors.start_date ? 'border-destructive' : ''}
                        />
                        <InputError message={errors.start_date} />
                    </div>

                    <div>
                        <Label htmlFor="end_date">Tanggal Selesai (Opsional)</Label>
                        <DateTimePicker
                            locale={id}
                            value={data.end_date}
                            onChange={(date) => setData('end_date', date)}
                            granularity="minute"
                            hourCycle={24}
                            placeholder="Pilih tanggal selesai"
                            className={errors.end_date ? 'border-destructive' : ''}
                        />
                        <InputError message={errors.end_date} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="room">Ruangan (Opsional)</Label>
                    <Input
                        id="room"
                        value={data.room}
                        onChange={(e) => setData('room', e.target.value)}
                        className={errors.room ? 'border-destructive' : ''}
                        placeholder="Masukkan lokasi/ruangan"
                    />
                    <InputError message={errors.room} />
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
                        placeholder="Masukkan deskripsi kelas bimbingan"
                    />
                    <InputError message={errors.description} />
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={processing}>
                    Batal
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Buat Kelas' : 'Perbarui Kelas'}
                </Button>
            </div>
        </form>
    );
}
