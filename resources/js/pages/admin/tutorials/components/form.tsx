import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Tutorial } from '..';

interface Props {
    tutorial?: Tutorial;
    mode: 'create' | 'edit';
}

export default function TutorialForm({ tutorial, mode }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        id: tutorial?.id || '',
        title: tutorial?.title || '',
        content: tutorial?.content || '',
        file_name: tutorial?.file_name || '',
        file_path: tutorial?.file_path || '',
        access_level: tutorial?.access_level || 'all',
        is_active: tutorial?.is_active || false,
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit the form
        if (mode === 'create') {
            post(route('admin.tutorials.store'));
        } else {
            put(route('admin.tutorials.update', tutorial?.id));
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="title">Judul*</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                        {errors.title && <p className="text-red-500">{errors.title}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="content">Konten*</Label>
                        <Input id="content" value={data.content} onChange={(e) => setData('content', e.target.value)} required />
                        {errors.content && <p className="text-red-500">{errors.content}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="file_name">Nama File*</Label>
                        <Input id="file_name" value={data.file_name} onChange={(e) => setData('file_name', e.target.value)} required />
                        {errors.file_name && <p className="text-red-500">{errors.file_name}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="file_path">File tutorial{mode === 'create' ? '*' : ''}</Label>
                        <Input
                            id="file_path"
                            type="file"
                            onChange={(e) => e.target.files && setData('file_path', e.target.files[0] as unknown as string)}
                            required={mode === 'create'}
                        />
                        {mode === 'edit' && data.file_path && typeof data.file_path === 'string' && (
                            <p className="text-sm text-gray-500">File saat ini: {data.file_path}</p>
                        )}
                        {errors.file_path && <p className="text-red-500">{errors.file_path}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="access_level">Level Akses*</Label>
                        <Select value={data.access_level} onValueChange={(value) => setData('access_level', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="dosen">Dosen</SelectItem>
                                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.access_level && <p className="text-red-500">{errors.access_level}</p>}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('admin.tutorials.index'))}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Create Tutorial' : 'Update Tutorial'}
                </Button>
            </div>
        </form>
    );
}
