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
                        <Label>Informasi Mahasiswa</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Nama</p>
                                <p>{user?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">NIM</p>
                                <p>{mahasiswaProfile?.nim || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Program Studi</p>
                                <p>{mahasiswaProfile?.prodi?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fakultas</p>
                                <p>{mahasiswaProfile?.fakultas?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pembimbing</p>
                                <p>{advisor?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">NIP Pembimbing</p>
                                <p>{advisor?.dosenProfile?.nip || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Informasi Magang</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Perusahaan</p>
                                <p>{logbook.internship?.company_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Alamat</p>
                                <p>{logbook.internship?.company_address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal Mulai</p>
                                <p>{logbook.internship?.start_date ? new Date(logbook.internship.start_date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal Selesai</p>
                                <p>{logbook.internship?.end_date ? new Date(logbook.internship.end_date).toLocaleDateString() : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Detail Logbook</Label>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Tanggal</p>
                                <p>{logbook.date ? new Date(logbook.date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Aktivitas</p>
                                <p className="whitespace-pre-wrap">{logbook.activities || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Catatan Pembimbing</p>
                                <p className="whitespace-pre-wrap">{logbook.supervisor_notes || '-'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
