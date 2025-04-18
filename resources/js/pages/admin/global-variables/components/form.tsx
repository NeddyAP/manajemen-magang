import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GlobalVariable } from '@/types/global-variable';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    globalVariable?: GlobalVariable;
    mode: 'create' | 'edit';
}

export default function GlobalVariableForm({ globalVariable, mode }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        id: globalVariable?.id || '',
        key: globalVariable?.key || '',
        slug: globalVariable?.slug || '',
        value: globalVariable?.value || '',
        description: globalVariable?.description || '',
        type: globalVariable?.type || '',
        is_active: globalVariable?.is_active === undefined ? true : Boolean(globalVariable?.is_active),
        created_at: globalVariable?.created_at || '',
        updated_at: globalVariable?.updated_at || '',
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit the form
        if (mode === 'create') {
            post(route('admin.global-variables.store'));
        } else {
            put(route('admin.global-variables.update', globalVariable?.id));
        }
    };

    const generateSlug = (key: string) => {
        const slug = key
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9-]/g, '_');
        setData('slug', slug);
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Progress bar */}
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="key">Key</Label>
                        <Input
                            id="key"
                            value={data.key}
                            onChange={(e) => {
                                setData('key', e.target.value);
                                generateSlug(e.target.value);
                            }}
                            required
                        />
                        <InputError message={errors.key} />
                        <Label htmlFor="slug" className="text-gray-500">
                            Nama variable: <br></br> {data.slug}
                        </Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => {
                                setData('slug', e.target.value);
                            }}
                            required
                            hidden
                        />
                        <InputError message={errors.slug} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="value">Value</Label>
                        <Input
                            id="value"
                            value={data.value}
                            onChange={(e) => {
                                setData('value', e.target.value);
                            }}
                            required
                        />
                        <InputError message={errors.value} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="type">Type</Label>
                        <Input
                            id="type"
                            value={data.type}
                            onChange={(e) => {
                                setData('type', e.target.value);
                            }}
                            required
                        />
                        <InputError message={errors.type} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} required />
                        <InputError message={errors.description} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="is_active">Status</Label>
                        <RadioGroup
                            value={data.is_active ? 'aktif' : 'tidak aktif'}
                            onValueChange={(value) => setData('is_active', value === 'active')}
                        >
                            <div className="flex space-x-4">
                                <RadioGroupItem id="aktif" value="aktif" />
                                <Label htmlFor="aktif">Aktif</Label>
                                <RadioGroupItem id="tidak aktif" value="tidak aktif" />
                                <Label htmlFor="tidak aktif">Tidak Aktif</Label>
                            </div>
                        </RadioGroup>
                        <InputError message={errors.is_active} />
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('admin.global-variables.index'))}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Create Global Variable' : 'Update Global Variable'}
                </Button>
            </div>
        </form>
    );
}
