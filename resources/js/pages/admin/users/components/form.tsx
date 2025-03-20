import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { router, useForm } from '@inertiajs/react';
import * as React from 'react';
import { FormEventHandler } from 'react';

interface Role {
    id: number;
    name: string;
}

interface User {
    id?: number;
    name: string;
    email: string;
    roles?: { name: string }[];
    profile?: any;
    admin_profile?: any;
    dosen_profile?: any;
    mahasiswa_profile?: any;
}

interface Props {
    roles: Role[];
    user?: User;
    mode: 'create' | 'edit';
}

export default function UserForm({ roles, user, mode }: Props) {
    const [activeTab, setActiveTab] = React.useState('user');

    const { data, setData, post, put, errors, processing } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        roles: user?.roles?.map((r) => r.name) || [],
        // Admin Profile
        employee_id: user?.admin_profile?.employee_id || '',
        department: user?.admin_profile?.department || '',
        position: user?.admin_profile?.position || '',
        employment_status: user?.admin_profile?.employment_status || '',
        join_date: user?.admin_profile?.join_date || '',
        phone_number: user?.admin_profile?.phone_number || '',
        address: user?.admin_profile?.address || '',
        supervisor_name: user?.admin_profile?.supervisor_name || '',
        work_location: user?.admin_profile?.work_location || '',
        // Dosen Profile
        employee_number: user?.dosen_profile?.employee_number || '',
        expertise: user?.dosen_profile?.expertise || '',
        last_education: user?.dosen_profile?.last_education || '',
        academic_position: user?.dosen_profile?.academic_position || '',
        teaching_start_year: user?.dosen_profile?.teaching_start_year || '',
        // Mahasiswa Profile
        student_number: user?.mahasiswa_profile?.student_number || '',
        study_program: user?.mahasiswa_profile?.study_program || '',
        class_year: user?.mahasiswa_profile?.class_year || '',
        academic_status: user?.mahasiswa_profile?.academic_status || 'Aktif',
        semester: user?.mahasiswa_profile?.semester || 1,
        advisor_id: user?.mahasiswa_profile?.advisor_id || '',
        gpa: user?.mahasiswa_profile?.gpa || '',
    });

    const selectedRole = mode === 'create' ? data.roles[0] : user?.roles?.[0]?.name;

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Convert numeric fields based on role
        if (selectedRole === 'dosen') {
            if (data.teaching_start_year) {
                setData('teaching_start_year', parseInt(data.teaching_start_year.toString()));
            }
        }

        if (selectedRole === 'mahasiswa') {
            if (data.class_year) {
                setData('class_year', parseInt(data.class_year.toString()));
            }
            if (data.semester) {
                setData('semester', parseInt(data.semester.toString()));
            }
            if (data.gpa) {
                setData('gpa', parseFloat(data.gpa.toString()));
            }
            if (data.advisor_id) {
                setData('advisor_id', parseInt(data.advisor_id.toString()));
            }
        }

        // Submit the form
        if (mode === 'create') {
            post(route('admin.users.store'));
        } else {
            put(route('admin.users.update', user?.id));
        }
    };

    const onRoleChange = (value: string) => {
        setData('roles', [value]);
        // Reset to user tab when role changes
        setActiveTab('user');
    };

    const onTabChange = (value: string) => {
        // Only allow changing to profile tab if role is selected
        if (value === 'profile' && !selectedRole && mode === 'create') {
            return;
        }
        setActiveTab(value);
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Progress bar */}
            <Progress value={activeTab === 'user' ? 50 : 100} className="mb-4" />

            <Tabs value={activeTab} className="w-full" onValueChange={onTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user">User Information</TabsTrigger>
                    <TabsTrigger
                        value="profile"
                        disabled={mode === 'create' && !selectedRole}
                        className={mode === 'create' && !selectedRole ? 'cursor-not-allowed opacity-50' : ''}
                    >
                        Profile Information
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="user">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            {/* Role Selection - Only shown on create */}
                            {mode === 'create' && (
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={selectedRole} onValueChange={onRoleChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.roles && <p className="text-sm text-red-500">{errors.roles}</p>}
                                    {mode === 'create' && !selectedRole && (
                                        <p className="text-muted-foreground text-sm">Please select a role to access profile information.</p>
                                    )}
                                </div>
                            )}

                            {/* Basic User Info */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Password fields - Required on create, optional on edit */}
                            {(mode === 'create' || data.password) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            {/* Admin Profile Fields */}
                            {selectedRole === 'admin' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_id">Employee ID</Label>
                                        <Input id="employee_id" value={data.employee_id} onChange={(e) => setData('employee_id', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input id="department" value={data.department} onChange={(e) => setData('department', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Input id="position" value={data.position} onChange={(e) => setData('position', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employment_status">Employment Status</Label>
                                        <Select value={data.employment_status} onValueChange={(value) => setData('employment_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tetap">Tetap</SelectItem>
                                                <SelectItem value="Kontrak">Kontrak</SelectItem>
                                                <SelectItem value="Magang">Magang</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="join_date">Join Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.join_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.join_date ? format(new Date(data.join_date), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.join_date ? new Date(data.join_date) : undefined}
                                                    onSelect={(date) => setData('join_date', date ? date.toISOString().split('T')[0] : '')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone_number">Phone Number</Label>
                                        <Input
                                            id="phone_number"
                                            value={data.phone_number}
                                            onChange={(e) => setData('phone_number', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="supervisor_name">Supervisor Name</Label>
                                        <Input
                                            id="supervisor_name"
                                            value={data.supervisor_name}
                                            onChange={(e) => setData('supervisor_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="work_location">Work Location</Label>
                                        <Input
                                            id="work_location"
                                            value={data.work_location}
                                            onChange={(e) => setData('work_location', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Dosen Profile Fields */}
                            {selectedRole === 'dosen' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="employee_number">Employee Number (NIP)</Label>
                                        <Input
                                            id="employee_number"
                                            value={data.employee_number}
                                            onChange={(e) => setData('employee_number', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expertise">Expertise</Label>
                                        <Input id="expertise" value={data.expertise} onChange={(e) => setData('expertise', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_education">Last Education</Label>
                                        <Input
                                            id="last_education"
                                            value={data.last_education}
                                            onChange={(e) => setData('last_education', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="academic_position">Academic Position</Label>
                                        <Input
                                            id="academic_position"
                                            value={data.academic_position}
                                            onChange={(e) => setData('academic_position', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="employment_status">Employment Status</Label>
                                        <Select value={data.employment_status} onValueChange={(value) => setData('employment_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PNS">PNS</SelectItem>
                                                <SelectItem value="Non-PNS">Non-PNS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="teaching_start_year">Teaching Start Year</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.teaching_start_year && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.teaching_start_year || <span>Select year</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown-buttons"
                                                    selected={data.teaching_start_year ? new Date(data.teaching_start_year, 0) : undefined}
                                                    onSelect={(date) => setData('teaching_start_year', date ? date.getFullYear() : '')}
                                                    fromYear={1950}
                                                    toYear={new Date().getFullYear()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </>
                            )}

                            {/* Mahasiswa Profile Fields */}
                            {selectedRole === 'mahasiswa' && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="student_number">Student Number (NIM)</Label>
                                        <Input
                                            id="student_number"
                                            value={data.student_number}
                                            onChange={(e) => setData('student_number', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="study_program">Study Program</Label>
                                        <Input
                                            id="study_program"
                                            value={data.study_program}
                                            onChange={(e) => setData('study_program', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="class_year">Class Year</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.class_year && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.class_year || <span>Select year</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown-buttons"
                                                    selected={data.class_year ? new Date(data.class_year, 0) : undefined}
                                                    onSelect={(date) => setData('class_year', date ? date.getFullYear() : '')}
                                                    fromYear={2000}
                                                    toYear={new Date().getFullYear()}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="academic_status">Academic Status</Label>
                                        <Select value={data.academic_status} onValueChange={(value) => setData('academic_status', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Aktif">Aktif</SelectItem>
                                                <SelectItem value="Cuti">Cuti</SelectItem>
                                                <SelectItem value="Lulus">Lulus</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="semester">Semester</Label>
                                        <Input
                                            id="semester"
                                            type="number"
                                            min="1"
                                            max="14"
                                            value={data.semester}
                                            onChange={(e) => setData('semester', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gpa">GPA (IPK)</Label>
                                        <Input
                                            id="gpa"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={data.gpa}
                                            onChange={(e) => setData('gpa', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('admin.users.index'))}>
                    Cancel
                </Button>
                {activeTab === 'user' ? (
                    <Button type="button" onClick={() => setActiveTab('profile')} disabled={mode === 'create' && !selectedRole}>
                        Next
                    </Button>
                ) : (
                    <>
                        <Button type="button" variant="outline" onClick={() => setActiveTab('user')}>
                            Previous
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {mode === 'create' ? 'Create User' : 'Update User'}
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
}
