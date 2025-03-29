import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GuidanceClass } from '@/types/guidance-class';
import { User } from '@/types/user';
import { useForm } from '@inertiajs/react';

interface Props {
    mode: 'create' | 'edit';
    lecturers: User[];
    guidanceClass?: GuidanceClass;
}

export default function GuidanceClassForm({ mode, lecturers, guidanceClass }: Props) {
    const form = useForm({
        title: guidanceClass?.title ?? '',
        lecturer_id: guidanceClass?.lecturer.id ?? 0,
        start_date: guidanceClass?.start_date ?? '',
        end_date: guidanceClass?.end_date ?? '',
        room: guidanceClass?.room ?? '',
        description: guidanceClass?.description ?? '',
        max_participants: guidanceClass?.max_participants ?? null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            form.post(route('admin.guidance-classes.store'));
        } else {
            form.put(route('admin.guidance-classes.update', guidanceClass?.id));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="title">Judul</Label>
                    <Input
                        id="title"
                        value={form.data.title}
                        onChange={(e) => form.setData('title', e.target.value)}
                        className={cn(form.errors.title && 'border-destructive')}
                    />
                    {form.errors.title && <p className="text-destructive mt-1 text-sm">{form.errors.title}</p>}
                </div>

                <div>
                    <Label htmlFor="lecturer_id">Dosen</Label>
                    <Select value={String(form.data.lecturer_id)} onValueChange={(value) => form.setData('lecturer_id', Number(value))}>
                        <SelectTrigger className={cn(form.errors.lecturer_id && 'border-destructive')}>
                            <SelectValue placeholder="Pilih dosen" />
                        </SelectTrigger>
                        <SelectContent>
                            {lecturers.map((lecturer) => (
                                <SelectItem key={lecturer.id} value={String(lecturer.id)}>
                                    {lecturer.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.errors.lecturer_id && <p className="text-destructive mt-1 text-sm">{form.errors.lecturer_id}</p>}
                </div>

                <div>
                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                    <Input
                        id="start_date"
                        type="datetime-local"
                        value={form.data.start_date}
                        onChange={(e) => form.setData('start_date', e.target.value)}
                        className={cn(form.errors.start_date && 'border-destructive')}
                    />
                    {form.errors.start_date && <p className="text-destructive mt-1 text-sm">{form.errors.start_date}</p>}
                </div>

                <div>
                    <Label htmlFor="end_date">Tanggal Selesai</Label>
                    <Input
                        id="end_date"
                        type="datetime-local"
                        value={form.data.end_date}
                        onChange={(e) => form.setData('end_date', e.target.value)}
                        className={cn(form.errors.end_date && 'border-destructive')}
                    />
                    {form.errors.end_date && <p className="text-destructive mt-1 text-sm">{form.errors.end_date}</p>}
                </div>

                <div>
                    <Label htmlFor="room">Ruangan</Label>
                    <Input
                        id="room"
                        value={form.data.room}
                        onChange={(e) => form.setData('room', e.target.value)}
                        className={cn(form.errors.room && 'border-destructive')}
                    />
                    {form.errors.room && <p className="text-destructive mt-1 text-sm">{form.errors.room}</p>}
                </div>

                <div>
                    <Label htmlFor="max_participants">Maksimal Peserta</Label>
                    <Input
                        id="max_participants"
                        type="number"
                        min={1}
                        value={form.data.max_participants ?? ''}
                        onChange={(e) => form.setData('max_participants', e.target.value ? Number(e.target.value) : null)}
                        className={cn(form.errors.max_participants && 'border-destructive')}
                    />
                    {form.errors.max_participants && <p className="text-destructive mt-1 text-sm">{form.errors.max_participants}</p>}
                </div>

                <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                        id="description"
                        value={form.data.description}
                        onChange={(e) => form.setData('description', e.target.value)}
                        className={cn(form.errors.description && 'border-destructive')}
                        rows={4}
                    />
                    {form.errors.description && <p className="text-destructive mt-1 text-sm">{form.errors.description}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={form.processing}>
                    {mode === 'create' ? 'Buat Kelas' : 'Simpan Perubahan'}
                </Button>
            </div>
        </form>
    );
}
