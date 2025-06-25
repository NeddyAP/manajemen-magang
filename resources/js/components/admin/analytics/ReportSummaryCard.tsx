import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS: { [key: string]: string } = {
    pending: '#f59e0b', // amber-500
    approved: '#22c55e', // green-500
    rejected: '#ef4444', // red-500
    default: '#a8a29e', // stone-400 for fallback
};

const STATUS_NAMES_ID: { [key: string]: string } = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    default: 'Lainnya',
};

interface ReportSummaryData {
    total_reports: number;
    by_status: { [key: string]: number };
    recent_count_7d: number;
}

export function ReportSummaryCard() {
    const [stats, setStats] = useState<ReportSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.report-summary'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching report summary:', err);
                setError('Gagal memuat ringkasan laporan.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const prepareStatusDataForChart = () => {
        if (!stats?.by_status) return [];
        return Object.entries(stats.by_status).map(([status, total]) => ({
            status,
            displayName: STATUS_NAMES_ID[status] || STATUS_NAMES_ID.default,
            total,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Laporan</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    <div className="space-y-6">
                        {/* Summary metrics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.total_reports}</div>
                                <div className="text-muted-foreground">Total Laporan</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.recent_count_7d}</div>
                                <div className="text-muted-foreground">Baru (7 hari)</div>
                            </div>
                        </div>

                        {/* Status distribution */}
                        <div className="h-72">
                            <h4 className="mb-1 text-center text-sm font-medium">Berdasarkan Status</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 5, bottom: 30, left: 5 }}>
                                    <Pie
                                        data={prepareStatusDataForChart()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="total"
                                        nameKey="displayName"
                                        label={false}
                                    >
                                        {prepareStatusDataForChart().map((entry) => (
                                            <Cell key={`cell-status-${entry.status}`} fill={STATUS_COLORS[entry.status] || STATUS_COLORS.default} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [`${value} (${name})`, null]} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Additional metrics */}
                        <div className="space-y-2 text-sm">
                            {Object.entries(stats.by_status).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: STATUS_COLORS[status] || STATUS_COLORS.default }}
                                        />
                                        <span>{STATUS_NAMES_ID[status] || status}</span>
                                    </div>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
