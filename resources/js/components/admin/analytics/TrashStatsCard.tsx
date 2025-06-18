import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { Trash2, Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MODEL_COLORS: { [key: string]: string } = {
    users: '#3b82f6', // blue-500
    internships: '#22c55e', // green-500
    logbooks: '#f59e0b', // amber-500
    reports: '#ef4444', // red-500
    tutorials: '#8b5cf6', // violet-500
    faqs: '#06b6d4', // cyan-500
    global_variables: '#84cc16', // lime-500
    guidance_classes: '#f97316', // orange-500
    default: '#a8a29e', // stone-400 for fallback
};

const MODEL_NAMES_ID: { [key: string]: string } = {
    users: 'Pengguna',
    internships: 'Magang',
    logbooks: 'Logbook',
    reports: 'Laporan',
    tutorials: 'Tutorial',
    faqs: 'FAQ',
    global_variables: 'Variabel Global',
    guidance_classes: 'Kelas Bimbingan',
    default: 'Lainnya',
};

interface TrashStatsData {
    total_items_in_trash: number;
    recently_trashed_7d: number;
    by_model: { [key: string]: number };
}

export function TrashStatsCard() {
    const [stats, setStats] = useState<TrashStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.trash-stats'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching trash stats:', err);
                setError('Gagal memuat statistik sampah.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const prepareModelDataForChart = () => {
        if (!stats?.by_model) return [];
        return Object.entries(stats.by_model)
            .filter(([_, count]) => count > 0) // Only show models with items in trash
            .map(([model, count]) => ({
                model,
                displayName: MODEL_NAMES_ID[model] || MODEL_NAMES_ID.default,
                total: count,
            }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Sampah</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    <div className="space-y-6">
                        {/* Summary metrics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <Icon iconNode={Trash2} className="mx-auto mb-1 h-5 w-5 text-red-600" />
                                <div className="text-2xl font-bold text-red-600">{stats.total_items_in_trash}</div>
                                <div className="text-muted-foreground">Total Item</div>
                            </div>
                            <div className="text-center">
                                <Icon iconNode={Clock} className="mx-auto mb-1 h-5 w-5 text-orange-600" />
                                <div className="text-2xl font-bold text-orange-600">{stats.recently_trashed_7d}</div>
                                <div className="text-muted-foreground">Baru (7 hari)</div>
                            </div>
                        </div>

                        {/* Warning if trash is not empty */}
                        {stats.total_items_in_trash > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <Icon iconNode={AlertTriangle} className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm text-yellow-800">
                                    Ada {stats.total_items_in_trash} item di sampah yang dapat dipulihkan atau dihapus permanen.
                                </span>
                            </div>
                        )}

                        {/* Distribution chart - only show if there are items in trash */}
                        {prepareModelDataForChart().length > 0 && (
                            <div className="h-64">
                                <h4 className="mb-1 text-center text-sm font-medium">Distribusi Berdasarkan Jenis</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 0, right: 5, bottom: 30, left: 5 }}>
                                        <Pie
                                            data={prepareModelDataForChart()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={60}
                                            fill="#8884d8"
                                            dataKey="total"
                                            nameKey="displayName"
                                            label={false}
                                        >
                                            {prepareModelDataForChart().map((entry) => (
                                                <Cell key={`cell-model-${entry.model}`} fill={MODEL_COLORS[entry.model] || MODEL_COLORS.default} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number, name: string) => [`${value} (${name})`, null]} />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Model breakdown */}
                        {stats.total_items_in_trash > 0 && (
                            <div className="space-y-2 text-sm">
                                {Object.entries(stats.by_model)
                                    .filter(([_, count]) => count > 0)
                                    .map(([model, count]) => (
                                        <div key={model} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: MODEL_COLORS[model] || MODEL_COLORS.default }}
                                                />
                                                <span>{MODEL_NAMES_ID[model] || model}</span>
                                            </div>
                                            <span className="font-semibold">{count}</span>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {stats.total_items_in_trash === 0 && (
                            <div className="text-center py-8">
                                <Icon iconNode={Trash2} className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <p className="text-muted-foreground">Sampah kosong - tidak ada item yang dihapus.</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}