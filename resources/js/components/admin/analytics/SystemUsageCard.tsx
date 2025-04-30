import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { BookOpen, Briefcase, Users } from 'lucide-react'; // Import specific icons
import { useEffect, useState } from 'react';

interface SystemUsageData {
    active_users_last_30d: number;
    total_internships: number;
    total_logbooks: number;
    // Add more metrics as needed
}

export function SystemUsageCard() {
    const [usage, setUsage] = useState<SystemUsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { props: _props } = usePage(); // Prefixed to fix lint error

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
                setError('Failed to load system usage data.');
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
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {usage && !loading && !error && (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <Icon iconNode={Users} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Pengguna Aktif (30hr)</span> {/* Translated */}
                                <span className="font-semibold">{usage.active_users_last_30d}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={Briefcase} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Total Magang</span> {/* Translated */}
                                <span className="font-semibold">{usage.total_internships}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Icon iconNode={BookOpen} className="text-muted-foreground mr-3 h-5 w-5" />
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-muted-foreground">Total Logbook</span> {/* Translated */}
                                <span className="font-semibold">{usage.total_logbooks}</span>
                            </div>
                        </div>
                        {/* Add more metrics here */}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
