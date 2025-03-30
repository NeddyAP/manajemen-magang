import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GuidanceClass } from '@/types/guidance-class';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    mode: 'create' | 'edit';
    guidanceClass?: GuidanceClass;
}

export default function GuidanceClassForm({ mode, guidanceClass }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        title: guidanceClass?.title ?? '',
        start_date: guidanceClass?.start_date ?? '',
        end_date: guidanceClass?.end_date ?? '',
        room: guidanceClass?.room ?? '',
        description: guidanceClass?.description ?? '',
        max_participants: guidanceClass?.max_participants ?? null,
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (mode === 'create') {
            post(route('front.internships.guidance-classes.store'));
        } else if (guidanceClass) {
            put(route('front.internships.guidance-classes.update', guidanceClass.id));
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
                        <Input
                            id="start_date"
                            type="datetime-local"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            className={errors.start_date ? 'border-destructive' : ''}
                        />
                        <InputError message={errors.start_date} />
                    </div>

                    <div>
                        <Label htmlFor="end_date">Tanggal Selesai (Opsional)</Label>
                        <Input
                            id="end_date"
                            type="datetime-local"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
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
                    <Label htmlFor="max_participants">Jumlah Maksimal Peserta (Opsional)</Label>
                    <Input
                        id="max_participants"
                        type="number"
                        value={data.max_participants === null ? '' : data.max_participants}
                        onChange={(e) => setData('max_participants', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        className={errors.max_participants ? 'border-destructive' : ''}
                        placeholder="Kosongkan untuk tidak ada batasan"
                    />
                    <p className="text-muted-foreground mt-1 text-xs">Biarkan kosong jika tidak ada batasan jumlah peserta</p>
                    <InputError message={errors.max_participants} />
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
