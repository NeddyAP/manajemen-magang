import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { BookOpen, Briefcase, Users } from 'lucide-react'; // Import specific icons
import { useEffect, useState } from 'react';

interface SystemUsageData {
    active_users_today: number;
    active_users_7d: number;
    active_users_30d: number;
    total_users: number;
    total_internships: number;
    total_logbooks: number;
    total_reports: number;
    total_guidance_classes: number;
    recent_internships_30d: number;
    recent_logbooks_30d: number;
    recent_reports_30d: number;
    recent_guidance_classes_30d: number;
    total_uploaded_files: number;
    user_engagement_rate: number;
}

export function SystemUsageCard() {
    const [usage, setUsage] = useState<SystemUsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.system-usage'))
            .then((response) => {
                setUsage(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching system usage:', err);
                setError('Gagal memuat data penggunaan sistem.');
                setUsage(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Penggunaan Sistem</CardTitle> {/* Translated */}
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {usage && !loading && !error && (
                    <div className="space-y-4">
                        {/* User Activity Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Aktivitas Pengguna</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                    <div className="text-lg font-bold text-blue-600">{usage.active_users_today}</div>
                                    <div className="text-muted-foreground">Hari Ini</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                    <div className="text-lg font-bold text-green-600">{usage.active_users_30d}</div>
                                    <div className="text-muted-foreground">30 Hari</div>
                                </div>
                            </div>
                        </div>

                        {/* System Totals */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Total Sistem</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Total Pengguna</span>
                                    <span className="font-semibold">{usage.total_users}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Total Magang</span>
                                    <span className="font-semibold">{usage.total_internships}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Total Logbook</span>
                                    <span className="font-semibold">{usage.total_logbooks}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Total Laporan</span>
                                    <span className="font-semibold">{usage.total_reports}</span>
                                </div>
                            </div>
                        </div>

                        {/* Engagement Rate */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Tingkat Keterlibatan</span>
                                <span>{usage.user_engagement_rate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(usage.user_engagement_rate, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
