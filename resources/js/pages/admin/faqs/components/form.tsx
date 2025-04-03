import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Faq } from '@/types/faq';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    faq?: Faq;
    mode: 'create' | 'edit';
}

export default function FaqForm({ faq, mode }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        id: faq?.id || '',
        question: faq?.question || '',
        answer: faq?.answer || '',
        category: faq?.category || '',
        is_active: faq?.is_active === undefined ? true : Boolean(faq?.is_active),
        order: faq?.order || '',
        created_at: faq?.created_at || '',
        updated_at: faq?.updated_at || '',
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit the form
        if (mode === 'create') {
            post(route('admin.faqs.store'));
        } else {
            put(route('admin.faqs.update', faq?.id));
        }
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Progress bar */}
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="question">Pertanyaan</Label>
                        <Input id="question" value={data.question} onChange={(e) => setData('question', e.target.value)} />
                        <InputError message={errors.question} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="answer">Jawaban</Label>
                        <Input id="answer" value={data.answer} onChange={(e) => setData('answer', e.target.value)} />
                        <InputError message={errors.answer} />
                        <Label htmlFor="category">Kategori</Label>
                        <Input id="category" value={data.category} onChange={(e) => setData('category', e.target.value)} />
                        <InputError message={errors.category} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="status">Status</Label>
                        <RadioGroup
                            value={data.is_active ? 'active' : 'inactive'}
                            onValueChange={(value) => setData('is_active', value === 'active')}
                            className="flex items-center space-x-4"
                            id="is_active"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="active" id="active" />
                                <Label htmlFor="active">Active</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="inactive" id="inactive" />
                                <Label htmlFor="inactive">Inactive</Label>
                            </div>
                        </RadioGroup>
                        <InputError message={errors.is_active} />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="order">Urutan</Label>
                        <Input id="order" type="number" value={data.order} onChange={(e) => setData('order', e.target.value)} />
                        <InputError message={errors.order} />
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('admin.faqs.index'))}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Create FAQ' : 'Update FAQ'}
                </Button>
            </div>
        </form>
    );
}
