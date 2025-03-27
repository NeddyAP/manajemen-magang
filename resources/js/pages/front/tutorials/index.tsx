import FrontLayout from '@/layouts/front-layout';
import { Head, router } from '@inertiajs/react';
import { BookOpen, CalendarDays, Download, GraduationCap, Search, ShieldCheck, User, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface Tutorial {
    id: number;
    title: string;
    content: string;
    file_name: string;
    file_path: string;
    access_level: 'all' | 'admin' | 'mahasiswa' | 'dosen';
    created_at: string;
    updated_at: string;
}

export default function Tutorials({ tutorials }: { tutorials: Tutorial[] }) {
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search') || '';

    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [isSearching, setIsSearching] = useState(false);
    const [animatedCards, setAnimatedCards] = useState<Record<number, boolean>>({});

    // Animation effect for cards
    useEffect(() => {
        const timer = setTimeout(() => {
            tutorials.forEach((tutorial, index) => {
                setTimeout(() => {
                    setAnimatedCards((prev) => ({
                        ...prev,
                        [tutorial.id]: true,
                    }));
                }, index * 100); // Stagger the animations
            });
        }, 100);

        return () => clearTimeout(timer);
    }, [tutorials]);

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSearching(true);

        router.get(
            route('tutorials.index'),
            { search: searchTerm },
            {
                preserveState: true,
                onSuccess: () => setIsSearching(false),
            },
        );
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('tutorials.index'), {}, { preserveState: true });
    };

    // Group tutorials by access_level
    const groupedTutorials = tutorials.reduce(
        (groups, tutorial) => {
            if (!groups[tutorial.access_level]) {
                groups[tutorial.access_level] = [];
            }
            groups[tutorial.access_level].push(tutorial);
            return groups;
        },
        {} as Record<string, Tutorial[]>,
    );

    // Define the order and display names for access levels
    const accessLevelConfig = {
        all: { name: 'Semua Pengguna', icon: <Users className="h-5 w-5" /> },
        admin: { name: 'Administrator', icon: <ShieldCheck className="h-5 w-5" /> },
        mahasiswa: { name: 'Mahasiswa', icon: <User className="h-5 w-5" /> },
        dosen: { name: 'Dosen', icon: <GraduationCap className="h-5 w-5" /> },
    };

    // Sort access levels by the predefined order
    const orderedAccessLevels = Object.keys(groupedTutorials).sort((a, b) => {
        const order = ['all', 'admin', 'mahasiswa', 'dosen'];
        return order.indexOf(a) - order.indexOf(b);
    });

    // Get access level display info with fallback for unknown levels
    const getAccessLevelInfo = (level: string) => {
        if (level in accessLevelConfig) {
            return accessLevelConfig[level as keyof typeof accessLevelConfig];
        }
        // Fallback for unexpected access levels
        return { name: level.charAt(0).toUpperCase() + level.slice(1), icon: <BookOpen className="h-5 w-5" /> };
    };

    // Render tutorial card
    const renderTutorialCard = (tutorial: Tutorial) => (
        <div
            key={tutorial.id}
            className={`flex h-full transform flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 ${
                animatedCards[tutorial.id] ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${tutorials.findIndex((t) => t.id === tutorial.id) * 50}ms` }}
        >
            <div className="flex-grow p-5">
                <div className="mb-3">
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {tutorial.access_level}
                    </span>
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">{tutorial.title}</h2>
                <p className="mb-4 line-clamp-3 text-gray-600 dark:text-gray-300">{tutorial.content}</p>
            </div>

            <div className="flex items-center gap-3 px-5 pb-4 text-sm text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-4 w-4" />
                <span>{new Date(tutorial.created_at).toLocaleDateString()}</span>
            </div>

            <div className="mt-auto border-t border-gray-100 p-4 dark:border-gray-700">
                <a
                    href={tutorial.file_path}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-600 transition-colors duration-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50"
                >
                    <Download className="h-4 w-4" />
                    <span>Unduh {tutorial.file_name.split('.').pop()?.toUpperCase()}</span>
                </a>
            </div>
        </div>
    );

    return (
        <FrontLayout>
            <Head title="Buku Panduan" />
            <div className="container mx-auto px-4 py-20 transition-colors duration-300 md:px-6 lg:px-20 dark:bg-gray-900">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-10 text-center">
                        <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl lg:text-5xl dark:from-blue-400 dark:to-purple-400">
                            Buku Panduan
                        </h1>
                        <p className="mx-auto max-w-2xl text-base text-gray-700 md:text-lg dark:text-gray-300">
                            Selamat datang di bagian Buku Panduan! Di sini Anda akan menemukan berbagai sumber daya untuk membantu Anda menavigasi
                            sistem manajemen magang.
                        </p>
                    </div>

                    <div className="mb-10">
                        <form onSubmit={handleSearch} className="relative mx-auto max-w-md">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    placeholder="Cari panduan..."
                                    className="w-full rounded-full border border-gray-300 bg-white py-3 pr-10 pl-12 text-gray-900 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-4 h-5 w-5 text-gray-400" />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        className="absolute right-16 rounded-full p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="absolute right-3 rounded-full bg-blue-600 p-1.5 text-white transition-colors duration-200 hover:bg-blue-700 disabled:opacity-70"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </form>

                        {initialSearch && (
                            <div className="mt-4 text-center">
                                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                    <span>Hasil pencarian untuk: "{initialSearch}"</span>
                                    <button onClick={clearSearch} className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800">
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {tutorials.length === 0 ? (
                        <div className="py-10 text-center">
                            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {initialSearch
                                    ? `Tidak ada tutorial yang ditemukan untuk pencarian "${initialSearch}"`
                                    : 'Tidak ada tutorial yang tersedia saat ini.'}
                            </p>
                            {initialSearch && (
                                <button
                                    onClick={clearSearch}
                                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
                                >
                                    Reset Pencarian
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {orderedAccessLevels.map((accessLevel) => (
                                <div key={accessLevel} className="mb-8">
                                    <div className="mb-6 flex items-center border-b border-gray-200 pb-3 dark:border-gray-700">
                                        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
                                            {getAccessLevelInfo(accessLevel).icon}
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                                {getAccessLevelInfo(accessLevel).name}
                                            </h2>
                                        </div>
                                        <div className="ml-4 rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                            {groupedTutorials[accessLevel].length}{' '}
                                            {groupedTutorials[accessLevel].length === 1 ? 'panduan' : 'panduan'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {groupedTutorials[accessLevel].map((tutorial) => renderTutorialCard(tutorial))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </FrontLayout>
    );
}
