import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as GlobalUser } from '@/types'; // Rename to avoid conflict
import { UserRound } from 'lucide-react';

// Define a more specific User type for this component's context
interface AdvisorUser extends GlobalUser {
    dosen_profile?: { // Ensure this matches the structure in GlobalUser
        employee_number: string;
        expertise: string;
        academic_position: string;
        // include other fields from GlobalUser.dosen_profile if accessed
        last_education: string; // Added based on User type
        employment_status: string; // Added based on User type
        teaching_start_year: string | number; // Added based on User type
    };
}

interface AdvisorInfoCardProps {
    advisor: AdvisorUser | null; // Use the more specific type
}

export function AdvisorInfoCard({ advisor }: AdvisorInfoCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dosen Pembimbing</CardTitle>
                <UserRound className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
                {!advisor ? (
                    <div className="text-center">
                        <p className="text-muted-foreground text-sm">Anda belum memiliki dosen pembimbing.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                                <UserRound className="text-primary h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{advisor.name}</p>
                                <p className="text-muted-foreground text-xs">{advisor.email}</p>
                            </div>
                        </div>

                        {advisor.dosen_profile && ( // This check should now be fine
                            <div className="space-y-2 rounded-md border p-3">
                                <div className="grid grid-cols-2 gap-1">
                                    <p className="text-muted-foreground text-xs">NIP:</p>
                                    {/* Accessing properties from the typed dosen_profile */}
                                    <p className="text-xs">{advisor.dosen_profile.employee_number}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <p className="text-muted-foreground text-xs">Keahlian:</p>
                                    <p className="text-xs">{advisor.dosen_profile.expertise}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <p className="text-muted-foreground text-xs">Jabatan:</p>
                                    <p className="text-xs">{advisor.dosen_profile.academic_position}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
