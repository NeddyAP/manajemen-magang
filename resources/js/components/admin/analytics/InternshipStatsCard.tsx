import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Define specific colors based on status
const STATUS_COLORS: { [key: string]: string } = {
    waiting: '#3b82f6', // blue-500
    accepted: '#22c55e', // green-500
    rejected: '#ef4444', // red-500
    default: '#a8a29e', // stone-400 for fallback
};

// Translate status names for display
const STATUS_NAMES_ID: { [key: string]: string } = {
    waiting: 'Menunggu',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    default: 'Lainnya',
};

// Define colors for the type chart (can reuse or define new)
const TYPE_COLORS: { [key: string]: string } = {
    kkl: '#8884d8',
    kkn: '#82ca9d',
};

// Define type names for display
const TYPE_NAMES_ID: { [key: string]: string } = {
    kkl: 'KKL',
    kkn: 'KKN',
    default: 'Lainnya',
};

interface InternshipStatsData {
    total_internships: number;
    by_status: { [key: string]: number }; // Changed to object structure
    by_type: { [key: string]: number }; // Changed to object structure
}

export function InternshipStatsCard() {
    const [stats, setStats] = useState<InternshipStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.internship-stats'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching internship stats:', err);
                setError('Failed to load internship statistics.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // Convert object format to array format for charts
    const prepareStatusDataForChart = () => {
        if (!stats?.by_status) return [];
        return Object.entries(stats.by_status).map(([status, total]) => ({
            status,
            displayName: STATUS_NAMES_ID[status] || STATUS_NAMES_ID.default,
            total,
        }));
    };

    const prepareTypeDataForChart = () => {
        if (!stats?.by_type) return [];
        return Object.entries(stats.by_type).map(([type, total]) => ({
            type,
            displayName: TYPE_NAMES_ID[type] || TYPE_NAMES_ID.default,
            total,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Magang</CardTitle> {/* Translated */}
            </CardHeader>
            <CardContent>
                {loading && <p>Loading...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    // Stack charts vertically
                    <div className="space-y-6">
                        {/* Pie Chart for Status */}
                        <div className="h-72">
                            <h4 className="mb-1 text-center text-sm font-medium">Berdasarkan Status</h4> {/* Translated */}
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 5, bottom: 30, left: 5 }}>
                                    {' '}
                                    {/* Added bottom margin for legend */}
                                    <Pie
                                        data={prepareStatusDataForChart()}
                                        cx="50%"
                                        cy="50%" // Center pie now legend is gone
                                        labelLine={false}
                                        outerRadius={70} // Can potentially increase radius slightly
                                        fill="#8884d8"
                                        dataKey="total"
                                        nameKey="displayName" // Use translated name for legend/tooltip
                                        label={false} // Keep labels disabled
                                    >
                                        {prepareStatusDataForChart().map((entry) => (
                                            <Cell key={`cell-status-${entry.status}`} fill={STATUS_COLORS[entry.status] || STATUS_COLORS.default} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [`${value} (${name})`, null]} />
                                    <Legend verticalAlign="bottom" height={36} /> {/* Ensure Legend is present */}
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart for Type */}
                        <div className="h-72">
                            <h4 className="mb-1 text-center text-sm font-medium">Berdasarkan Jenis</h4> {/* Translated */}
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={prepareTypeDataForChart()} margin={{ top: 5, right: 5, left: 0, bottom: 25 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="displayName" fontSize={10} interval={0} angle={-45} textAnchor="end" height={40} />
                                    <YAxis allowDecimals={false} width={25} fontSize={10} />
                                    <Tooltip formatter={(value: number) => [`${value} magang`, null]} /> {/* Translated tooltip */}
                                    {/* <Legend /> */}
                                    <Bar dataKey="total" fill="#82ca9d">
                                        {prepareTypeDataForChart().map((entry) => (
                                            <Cell key={`cell-type-${entry.type}`} fill={TYPE_COLORS[entry.type] || '#82ca9d'} />
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
