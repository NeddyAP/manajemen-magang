import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Internship {
    id: number;
    user_id: number;
    lecturer_id?: number;
    type: 'kkl' | 'kkn';
    application_file: string;
    company_name: string;
    company_address: string;
    start_date: string;
    end_date: string;
    status: 'waiting' | 'accepted' | 'rejected';
    progress: string;
    created_at: string;
    updated_at: string;
    user?: User;
    lecturer?: User;
}

interface Props {
    internship?: Internship;
    mode: 'create' | 'edit';
    students: User[];
    lecturers: User[];
}

export default function InternshipForm({ internship, mode, students, lecturers }: Props) {
    const { data, setData, post, put, errors, processing, setError, clearErrors } = useForm<any>({
        user_id: internship?.user_id || '',
        lecturer_id: internship?.lecturer_id || '',
        type: internship?.type || 'kkl',
        application_file: '',
        company_name: internship?.company_name || '',
        company_address: internship?.company_address || '',
        start_date: internship?.start_date || '',
        end_date: internship?.end_date || '',
        status: internship?.status || 'waiting',
        progress: internship?.progress || '0',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('application_file', 'File must be less than 2MB');
                return;
            }

            // Check file type (only PDF)
            if (file.type !== 'application/pdf') {
                setError('application_file', 'Only PDF files are allowed');
                return;
            }

            clearErrors('application_file');
            setData('application_file', file);
        }
    };

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Submit the form
        if (mode === 'create') {
            post(route('admin.internships.store'));
        } else {
            put(route('admin.internships.update', internship?.id));
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label htmlFor="user_id">Student</Label>
                        <Select value={data.user_id.toString()} onValueChange={(value) => setData('user_id', value)}>
                            <SelectTrigger id="user_id">
                                <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((student) => (
                                    <SelectItem key={student.id} value={student.id.toString()}>
                                        {student.name} ({student.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.user_id} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="lecturer_id">Supervisor (Optional)</Label>
                        <Select value={data.lecturer_id ? data.lecturer_id.toString() : ''} onValueChange={(value) => setData('lecturer_id', value)}>
                            <SelectTrigger id="lecturer_id">
                                <SelectValue placeholder="Select a supervisor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {lecturers.map((lecturer) => (
                                    <SelectItem key={lecturer.id} value={lecturer.id.toString()}>
                                        {lecturer.name} ({lecturer.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.lecturer_id} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="type">Internship Type</Label>
                        <RadioGroup
                            value={data.type}
                            onValueChange={(value: 'kkl' | 'kkn') => setData('type', value)}
                            className="flex items-center space-x-4"
                            id="type"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="kkl" id="kkl" />
                                <Label htmlFor="kkl">KKL (Kuliah Kerja Lapangan)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="kkn" id="kkn" />
                                <Label htmlFor="kkn">KKN (Kuliah Kerja Nyata)</Label>
                            </div>
                        </RadioGroup>
                        <InputError message={errors.type} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="application_file">Application File (PDF)</Label>
                        <Input id="application_file" type="file" accept=".pdf" onChange={handleFileChange} />
                        <p className="text-muted-foreground text-xs">Upload application letter in PDF format (max 2MB)</p>
                        {mode === 'edit' && internship?.application_file && (
                            <div className="flex items-center gap-2 text-sm">
                                <span>Current file:</span>
                                <a
                                    href={route('admin.internships.download', internship.id)}
                                    className="text-primary underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download PDF
                                </a>
                            </div>
                        )}
                        <InputError message={errors.application_file} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="company_name">Company/Institution Name</Label>
                        <Input id="company_name" value={data.company_name} onChange={(e) => setData('company_name', e.target.value)} />
                        <InputError message={errors.company_name} />
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="company_address">Company/Institution Address</Label>
                        <Textarea id="company_address" value={data.company_address} onChange={(e) => setData('company_address', e.target.value)} />
                        <InputError message={errors.company_address} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-4">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Input id="start_date" type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                            <InputError message={errors.start_date} />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input id="end_date" type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                            <InputError message={errors.end_date} />
                        </div>
                    </div>

                    {mode === 'edit' && (
                        <div className="space-y-4">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="waiting">Waiting</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
                    )}

                    {mode === 'edit' && (
                        <div className="space-y-4">
                            <Label htmlFor="progress">Progress (%)</Label>
                            <Input
                                id="progress"
                                type="number"
                                min="0"
                                max="100"
                                value={data.progress}
                                onChange={(e) => setData('progress', e.target.value)}
                            />
                            <InputError message={errors.progress} />
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('admin.internships.index'))}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {mode === 'create' ? 'Create Internship' : 'Update Internship'}
                </Button>
            </div>
        </form>
    );
}
