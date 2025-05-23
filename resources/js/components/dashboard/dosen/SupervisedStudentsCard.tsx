import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as GlobalUser } from '@/types'; // Rename to avoid conflict
import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { Button } from '../../ui/button';

// Define a more specific User type for this component's context
interface StudentUser extends GlobalUser {
    mahasiswa_profile?: {
        // Ensure this matches the structure in GlobalUser
        student_number: string;
        study_program: string;
        // include other fields from GlobalUser.mahasiswa_profile if accessed
    };
    internships_count?: number; // Add the missing property
}

interface SupervisedStudentsCardProps {
    students: StudentUser[]; // Use the more specific type
    totalAdvisees: number;
}

export function SupervisedStudentsCard({ students, totalAdvisees }: SupervisedStudentsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mahasiswa Bimbingan</CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalAdvisees}</div>
                <p className="text-muted-foreground text-xs">Total Mahasiswa Bimbingan</p>

                <div className="mt-4 space-y-3">
                    {students.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Tidak ada mahasiswa bimbingan.</p>
                    ) : (
                        students.map(
                            (
                                student, // student is now StudentUser
                            ) => (
                                <div key={student.id} className="flex items-center justify-between rounded-md border p-3 shadow-sm">
                                    <div>
                                        <p className="text-sm font-medium">{student.name}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {student.mahasiswa_profile?.student_number} - {student.mahasiswa_profile?.study_program}
                                        </p>
                                    </div>
                                    <div>
                                        {(student.internships_count ?? 0) > 0 ? ( // Added nullish coalescing for safety
                                            <span className="rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Aktif</span>
                                        ) : (
                                            <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">Belum Magang</span>
                                        )}
                                    </div>
                                </div>
                            ),
                        )
                    )}
                </div>

                {students.length > 0 && totalAdvisees > students.length && (
                    <div className="mt-4">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={route('dosen.students-progress')}>Lihat Semua Mahasiswa</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
