import { Icon } from '@/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { Activity, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const ROLE_COLORS: { [key: string]: string } = {
    superadmin: '#8b5cf6', // violet-500
    admin: '#3b82f6', // blue-500
    dosen: '#22c55e', // green-500
    mahasiswa: '#f59e0b', // amber-500
    default: '#a8a29e', // stone-400 for fallback
};

const ROLE_NAMES_ID: { [key: string]: string } = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    dosen: 'Dosen',
    mahasiswa: 'Mahasiswa',
    default: 'Lainnya',
};

interface UserStatsData {
    total_users: number;
    users_by_role: Array<{ role: string; total: number }>;
    active_users_30d: number;
    recent_registrations_7d: number;
}

export function UserStatsCard() {
    const [stats, setStats] = useState<UserStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route('admin.analytics.user-stats'))
            .then((response) => {
                setStats(response.data);
                setError(null);
            })
            .catch((err) => {
                console.error('Error fetching user stats:', err);
                setError('Gagal memuat statistik pengguna.');
                setStats(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const prepareRoleDataForChart = () => {
        if (!stats?.users_by_role) return [];
        return stats.users_by_role.map((item) => ({
            role: item.role,
            displayName: ROLE_NAMES_ID[item.role] || ROLE_NAMES_ID.default,
            total: item.total,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
                {loading && <p>Memuat...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {stats && !loading && !error && (
                    <div className="space-y-6">
                        {/* Summary metrics */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                                <Icon iconNode={Users} className="mx-auto mb-1 h-5 w-5 text-blue-600" />
                                <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
                                <div className="text-muted-foreground">Total</div>
                            </div>
                            <div className="text-center">
                                <Icon iconNode={Activity} className="mx-auto mb-1 h-5 w-5 text-green-600" />
                                <div className="text-2xl font-bold text-green-600">{stats.active_users_30d}</div>
                                <div className="text-muted-foreground">Aktif</div>
                            </div>
                            <div className="text-center">
                                <Icon iconNode={UserPlus} className="mx-auto mb-1 h-5 w-5 text-purple-600" />
                                <div className="text-2xl font-bold text-purple-600">{stats.recent_registrations_7d}</div>
                                <div className="text-muted-foreground">Baru</div>
                            </div>
                        </div>

                        {/* Role distribution chart */}
                        <div className="h-72">
                            <h4 className="mb-1 text-center text-sm font-medium">Distribusi Berdasarkan Role</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, right: 5, bottom: 30, left: 5 }}>
                                    <Pie
                                        data={prepareRoleDataForChart()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        dataKey="total"
                                        nameKey="displayName"
                                        label={false}
                                    >
                                        {prepareRoleDataForChart().map((entry) => (
                                            <Cell key={`cell-role-${entry.role}`} fill={ROLE_COLORS[entry.role] || ROLE_COLORS.default} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number, name: string) => [`${value} (${name})`, null]} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Role breakdown */}
                        <div className="space-y-2 text-sm">
                            {stats.users_by_role.map((item) => (
                                <div key={item.role} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: ROLE_COLORS[item.role] || ROLE_COLORS.default }}
                                        />
                                        <span>{ROLE_NAMES_ID[item.role] || item.role}</span>
                                    </div>
                                    <span className="font-semibold">{item.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
