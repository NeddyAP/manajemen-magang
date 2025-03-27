import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Logbook } from '..';

interface Props {
    logbook: Logbook;
}

export default function LogbookForm({ logbook }: Props) {
    const user = logbook.internship?.user;
    const mahasiswaProfile = user?.mahasiswaProfile;
    const advisor = mahasiswaProfile?.advisor;

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-4">
                        <Label>Student Information</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p>{user?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">NIM</p>
                                <p>{mahasiswaProfile?.nim || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Study Program</p>
                                <p>{mahasiswaProfile?.prodi?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Faculty</p>
                                <p>{mahasiswaProfile?.fakultas?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Advisor</p>
                                <p>{advisor?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Advisor NIP</p>
                                <p>{advisor?.dosenProfile?.nip || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Internship Information</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Company</p>
                                <p>{logbook.internship?.company_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p>{logbook.internship?.company_address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Start Date</p>
                                <p>{logbook.internship?.start_date ? new Date(logbook.internship.start_date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">End Date</p>
                                <p>{logbook.internship?.end_date ? new Date(logbook.internship.end_date).toLocaleDateString() : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Logbook Details</Label>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Date</p>
                                <p>{logbook.date ? new Date(logbook.date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Activities</p>
                                <p className="whitespace-pre-wrap">{logbook.activities || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Supervisor Notes</p>
                                <p className="whitespace-pre-wrap">{logbook.supervisor_notes || '-'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
