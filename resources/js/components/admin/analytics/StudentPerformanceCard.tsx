import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

interface StudentPerformanceData {
    logbook_completion_avg: number;
    report_approval_rate: number;
    guidance_attendance_avg: number;
}

export function StudentPerformanceCard() {
    const [performance, setPerformance] = useState<StudentPerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.student-performance'))
            .then((response) => {
                setPerformance(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching student performance:', err);
                setError('Gagal memuat data performa mahasiswa.'); // Translated error message
                setPerformance(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performa Mahasiswa (Rata-rata)</CardTitle> {/* Translated */}
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>} {/* Translated loading message */}
                {error && <p className="text-red-500">{error}</p>}
                {performance && !loading && !error && (
                    <div className="h-80">
                        {' '}
                        {/* Increased height further */}
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                                cx="50%"
                                cy="50%"
                                outerRadius="70%"
                                data={[
                                    { subject: 'Logbook', A: performance.logbook_completion_avg, fullMark: 100 }, // Simplified subject
                                    { subject: 'Laporan', A: performance.report_approval_rate, fullMark: 100 }, // Translated subject
                                    { subject: 'Kehadiran', A: performance.guidance_attendance_avg, fullMark: 100 }, // Translated subject
                                ]}
                                margin={{ top: 5, right: 40, bottom: 25, left: 40 }}
                            >
                                <PolarGrid gridType="circle" />
                                <PolarAngleAxis dataKey="subject" fontSize={10} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} tickFormatter={(value) => `${value}%`} fontSize={9} />
                                <Radar name="Rata-rata %" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} /> {/* Translated name */}
                                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Rata-rata']} /> {/* Translated tooltip */}
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
