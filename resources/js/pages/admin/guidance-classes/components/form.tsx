import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GuidanceClass } from '@/types/guidance-class';
import { User } from '@/types/user';
import { useForm } from '@inertiajs/react';
import { id } from 'date-fns/locale';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

interface Props {
    mode: 'create' | 'edit';
    lecturers: User[];
    guidanceClass?: GuidanceClass;
}

export default function GuidanceClassForm({ mode, lecturers, guidanceClass }: Props) {
    const [open, setOpen] = React.useState(false);

    const form = useForm({
        title: guidanceClass?.title ?? '',
        lecturer_id: guidanceClass?.lecturer.id ?? 0,
        start_date: guidanceClass?.start_date ? new Date(guidanceClass.start_date) : undefined,
        end_date: guidanceClass?.end_date ? new Date(guidanceClass.end_date) : undefined,
        room: guidanceClass?.room ?? '',
        description: guidanceClass?.description ?? '',
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
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className={cn(
                                    'w-full justify-between',
                                    !form.data.lecturer_id && 'text-muted-foreground',
                                    form.errors.lecturer_id && 'border-destructive',
                                )}
                            >
                                {form.data.lecturer_id ? lecturers.find((lecturer) => lecturer.id === form.data.lecturer_id)?.name : 'Pilih dosen...'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Cari dosen..." />
                                <CommandList>
                                    <CommandEmpty>Dosen tidak ditemukan.</CommandEmpty>
                                    <CommandGroup>
                                        {lecturers.map((lecturer) => (
                                            <CommandItem
                                                key={lecturer.id}
                                                value={String(lecturer.id)}
                                                onSelect={(currentValue) => {
                                                    const selectedId = Number(currentValue);
                                                    form.setData('lecturer_id', selectedId === form.data.lecturer_id ? 0 : selectedId);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        form.data.lecturer_id === lecturer.id ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                                {lecturer.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {form.errors.lecturer_id && <p className="text-destructive mt-1 text-sm">{form.errors.lecturer_id}</p>}
                </div>

                <div>
                    <Label htmlFor="start_date">Tanggal & Waktu Mulai</Label>
                    <DateTimePicker
                        locale={id}
                        value={form.data.start_date}
                        onChange={(date) => form.setData('start_date', date)}
                        granularity="minute"
                        hourCycle={24}
                        placeholder="Pilih tanggal dan waktu mulai"
                        className={cn(form.errors.start_date && 'border-destructive')}
                    />
                    {form.errors.start_date && <p className="text-destructive mt-1 text-sm">{form.errors.start_date}</p>}
                </div>

                <div>
                    <Label htmlFor="end_date">Tanggal & Waktu Selesai</Label>
                    <DateTimePicker
                        locale={id}
                        value={form.data.end_date}
                        onChange={(date) => form.setData('end_date', date)}
                        granularity="minute"
                        hourCycle={24}
                        placeholder="Pilih tanggal dan waktu selesai"
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
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Batal
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {mode === 'create' ? 'Buat Kelas' : 'Simpan Perubahan'}
                </Button>
            </div>
        </form>
    );
}
