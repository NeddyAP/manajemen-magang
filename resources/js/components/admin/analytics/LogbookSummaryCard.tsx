import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STATUS_COLORS: { [key: string]: string } = {
    waiting: '#3b82f6', // blue-500
    accepted: '#22c55e', // green-500
    rejected: '#ef4444', // red-500
    default: '#a8a29e', // stone-400 for fallback
};

const STATUS_NAMES_ID: { [key: string]: string } = {
    waiting: 'Menunggu',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    default: 'Lainnya',
};

interface LogbookSummaryData {
    total_logbooks: number;
    recent_count_7d: number;
    recent_count_30d: number;
    with_supervisor_notes: number;
    without_supervisor_notes: number;
    by_internship_status: { [key: string]: number };
    average_per_internship: number;
}

export function LogbookSummaryCard() {
    const [stats, setStats] = useState<LogbookSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.logbook-summary'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching logbook summary:', err);
                setError('Gagal memuat ringkasan logbook.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const prepareSupervisorNotesDataForChart = () => {
        if (!stats) return [];
        return [
            {
                category: 'Dengan Catatan',
                total: stats.with_supervisor_notes,
            },
            {
                category: 'Tanpa Catatan',
                total: stats.without_supervisor_notes,
            },
        ];
    };

    const prepareStatusDataForChart = () => {
        if (!stats?.by_internship_status) return [];
        return Object.entries(stats.by_internship_status).map(([status, total]) => ({
            status,
            displayName: STATUS_NAMES_ID[status] || STATUS_NAMES_ID.default,
            total,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Logbook</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    <div className="space-y-6">
                        {/* Summary metrics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.total_logbooks}</div>
                                <div className="text-muted-foreground">Total Logbook</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.recent_count_7d}</div>
                                <div className="text-muted-foreground">Baru (7 hari)</div>
                            </div>
                        </div>

                        {/* Supervisor Notes Chart */}
                        <div className="h-48">
                            <h4 className="mb-1 text-center text-sm font-medium">Catatan Supervisor</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 5, bottom: 30, left: 5 }}>
                                    <Pie
                                        data={prepareSupervisorNotesDataForChart()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        dataKey="total"
                                        nameKey="category"
                                        label={false}
                                    >
                                        {prepareSupervisorNotesDataForChart().map((entry, index) => (
                                            <Cell key={`cell-notes-${index}`} fill={index === 0 ? '#22c55e' : '#94a3b8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [`${value} (${name})`, null]} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Status distribution */}
                        <div className="h-48">
                            <h4 className="mb-1 text-center text-sm font-medium">Berdasarkan Status Magang</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prepareStatusDataForChart()} margin={{ top: 5, right: 5, left: 0, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="displayName" fontSize={10} interval={0} angle={-45} textAnchor="end" height={40} />
                                    <YAxis allowDecimals={false} width={25} fontSize={10} />
                                    <Tooltip formatter={(value: number) => [`${value} logbook`, null]} />
                                    <Bar dataKey="total" fill="#82ca9d">
                                        {prepareStatusDataForChart().map((entry) => (
                                            <Cell key={`cell-status-${entry.status}`} fill={STATUS_COLORS[entry.status] || STATUS_COLORS.default} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
