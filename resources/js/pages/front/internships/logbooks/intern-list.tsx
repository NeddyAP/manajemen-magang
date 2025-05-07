import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Import Input
import { Progress } from '@/components/ui/progress';
import { useDebounce } from '@/hooks/use-debounce'; // Import custom hook
import FrontLayout from '@/layouts/front-layout';
import { SharedData, type BreadcrumbItem } from '@/types'; // Import SharedData
import { Internship } from '@/types/internship';
import { Head, Link, router, usePage } from '@inertiajs/react'; // Import router and usePage
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { PlusCircle, SearchIcon } from 'lucide-react'; // Import SearchIcon
import { useEffect, useState } from 'react'; // Import hooks (useCallback removed)

interface PageProps {
    internships: Internship[];
    filters: { search?: string }; // Add filters prop
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Magang',
        href: route('front.internships.index'),
    },
    {
        title: 'Logbook',
        href: '#',
    },
];

export default function InternshipList({ internships, filters }: PageProps) {
    const { auth } = usePage<SharedData>().props;
    // Corrected role check based on typical structure
    const isDosen = auth.role === 'dosen';
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 300); // Use the hook

    useEffect(() => {
        const query: Record<string, string> = {};
        if (debouncedSearchTerm) {
            query.search = debouncedSearchTerm;
        }
        router.get(route('front.internships.logbooks.intern-list'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [debouncedSearchTerm]); // Trigger effect when debounced value changes

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <FrontLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Magang" />
            <div className="flex min-h-screen flex-1 flex-col gap-4 p-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl p-6">
                        {' '}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Pilih Magang</h1>
                                <p className="text-muted-foreground">
                                    {isDosen
                                        ? 'Pilih magang mahasiswa untuk melihat logbook.'
                                        : 'Pilih magang Anda untuk melihat atau mengisi logbook.'}
                                </p>
                            </div>
                        </div>
                        {/* Search Input for Dosen */}
                        {isDosen && (
                            <div className="mb-4 max-w-sm">
                                <div className="relative">
                                    <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Cari Nama/NIM Mahasiswa..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        )}
                        {internships.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {internships.map((internship) => (
                                    <Card key={internship.id} className="overflow-hidden">
                                        <CardHeader className="pb-2">
                                            {isDosen && (
                                                <CardTitle className="text-base">
                                                    {internship.user?.name}
                                                </CardTitle>
                                            )}
                                            <p className="text-muted-foreground text-sm font-medium">
                                                {internship.company_name}
                                            </p>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                                <p className="text-muted-foreground">
                                                    <span className="font-medium">Jenis:</span> {internship.type}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    <span className="font-medium">Periode:</span>{' '}
                                                    {internship.start_date
                                                        ? format(new Date(internship.start_date), 'dd/MM/yy', { locale: id })
                                                        : '-'}{' '}
                                                    -{' '}
                                                    {internship.end_date
                                                        ? format(new Date(internship.end_date), 'dd/MM/yy', { locale: id })
                                                        : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <Progress value={internship.progress} className="h-1.5" />
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-muted-foreground text-xs">Progress</p>
                                                    <p className="text-muted-foreground text-xs">{internship.logbooks_count}/30</p>
                                                </div>
                                            </div>
                                            <Button size="sm" className="h-8 w-full mt-1" asChild>
                                                <Link href={route('front.internships.logbooks.index', internship.id)}>
                                                    Lihat Logbook
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                                <h3 className="text-xl font-semibold tracking-tight">
                                    {isDosen && searchTerm ? 'Tidak ada mahasiswa ditemukan.' : 'Tidak ada magang aktif.'}
                                </h3>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {isDosen && searchTerm
                                        ? 'Coba kata kunci pencarian yang berbeda.'
                                        : isDosen
                                            ? 'Belum ada mahasiswa bimbingan Anda yang memiliki magang aktif.'
                                            : 'Silakan ajukan pendaftaran magang terlebih dahulu.'}
                                </p>
                                {!isDosen && (
                                    <Button className="mt-6" asChild>
                                        <Link href={route('front.internships.applicants.create')}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Ajukan Magang Baru
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
