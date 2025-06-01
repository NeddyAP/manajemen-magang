import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FrontLayout from '@/layouts/front-layout';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export interface FAQ {
    id?: number;
    question: string;
    answer: string;
    category: string;
    is_active: boolean;
    order: number;
}

interface HomeProps {
    faqCategories: string[];
    faqsByCategory: Record<string, FAQ[]>;
}

export default function Home({ faqCategories = [], faqsByCategory = {} }: HomeProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { globalVariables } = page.props;
    return (
        <FrontLayout>
            <Head title="Selamat Datang">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="relative -mx-[max(0px,calc((100%-96rem)/2))]">
                <section
                    id="hero"
                    className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-600 transition-colors duration-200 dark:from-gray-800 dark:via-gray-900 dark:to-black"
                >
                    <div className="container mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2 lg:px-8">
                        <div className="flex flex-col items-start space-y-8 text-left">
                            <p className="text-muted-foreground text-xl">
                                {auth.user ? `Selamat datang, ${auth.user.name}!` : 'Selamat datang di platform manajemen magang kami!'}
                            </p>
                            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent sm:text-2xl lg:text-4xl">
                                {auth.user
                                    ? `Semangat melaksanakan kuliah kerja lapangan  & kuliah kerja nyata.`
                                    : `
                                Sederhanakan perjalanan magang Anda dengan platform manajemen komprehensif kami`}{' '}
                                <br />
                            </h1>
                            <p className="text-muted-foreground text-xl">
                                {auth.user
                                    ? `Terus semangat untuk mendapatkan hasil yang luar biasa, Isi sekarang yu.`
                                    : `Ajukan tempat magang, Catat logbook, Kumpulkan laporan`}
                            </p>
                            <Button asChild size="lg" className="font-semibold">
                                <Link href="/internships">Mulai</Link>
                            </Button>
                        </div>
                        {/* Container for the image */}
                        <div className="relative flex min-h-screen items-center justify-center overflow-hidden rounded-lg">
                            <img
                                src="/assets/hero-image.webp"
                                alt="Ilustrasi Manajemen Magang"
                                className="max-min-h-screen h-auto w-auto max-w-full object-contain"
                            />
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl">
                    <section id="tutorial" className="min-h-screen w-full items-center justify-center px-6 py-8 lg:px-8">
                        <div className="w-full max-w-6xl py-24">
                            <div className="mb-12 text-center">
                                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Pelajari Cara Kerja Sistem</h2>
                                <p className="text-muted-foreground mt-4 text-lg">
                                    Video panduan singkat untuk membantu Anda memulai dan memaksimalkan penggunaan platform kami.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-2">
                                {globalVariables.filter((gv) => gv.type === 'video_tutorial').length > 0 ? (
                                    globalVariables.map((globalVariable) => {
                                        if (globalVariable.type === 'video_tutorial') {
                                            return (
                                                <Card
                                                    key={globalVariable.id}
                                                    className="group w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-gray-700"
                                                >
                                                    <CardHeader className="p-0">
                                                        <div className="aspect-video overflow-hidden">
                                                            <iframe
                                                                src={globalVariable.value}
                                                                title={globalVariable.key}
                                                                className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-6">
                                                        <CardTitle className="mb-2 text-2xl font-semibold group-hover:text-sky-500 dark:group-hover:text-sky-400">
                                                            {globalVariable.key}
                                                        </CardTitle>
                                                        <CardDescription className="text-muted-foreground text-base">
                                                            {globalVariable.description}
                                                        </CardDescription>
                                                    </CardContent>
                                                </Card>
                                            );
                                        }
                                        return null;
                                    })
                                ) : (
                                    <p className="text-muted-foreground col-span-full text-center text-xl">Video tutorial akan segera tersedia.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section id="faq" className="mb-20 flex min-h-screen w-full items-center justify-center bg-gradient-to-b px-6 lg:px-8">
                        <div className="w-full max-w-5xl py-24">
                            <div className="mb-12 text-center">
                                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Ada Pertanyaan?</h2>
                                <p className="text-muted-foreground mt-4 text-lg">
                                    Temukan jawaban atas pertanyaan umum di sini. Jika tidak menemukan yang Anda cari, jangan ragu untuk menghubungi
                                    kami.
                                </p>
                            </div>

                            {faqCategories.length > 0 ? (
                                <Tabs defaultValue={faqCategories[0]} className="w-full">
                                    <TabsList className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center">
                                        {faqCategories.map((category) => (
                                            <TabsTrigger
                                                key={category}
                                                value={category}
                                                className="rounded-md border border-transparent px-4 py-3 text-base font-medium transition-all hover:bg-sky-100 data-[state=active]:border-sky-500 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-md dark:hover:bg-gray-800 dark:data-[state=active]:border-sky-500 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-sky-300"
                                            >
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {faqCategories.map((category) => (
                                        <TabsContent key={category} value={category} className="w-full">
                                            <Accordion type="single" collapsible className="w-full space-y-4">
                                                {faqsByCategory[category]?.map((faq, index) => (
                                                    <AccordionItem
                                                        key={index}
                                                        value={`item-${category}-${index}`}
                                                        className="rounded-lg border bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                                    >
                                                        <AccordionTrigger className="px-6 py-4 text-left text-lg font-medium hover:no-underline data-[state=open]:text-sky-600 dark:data-[state=open]:text-sky-400">
                                                            {faq.question}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="text-muted-foreground px-6 pt-0 pb-6 text-base">
                                                            <div
                                                                className="prose dark:prose-invert max-w-none"
                                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                            />
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            ) : (
                                <p className="text-muted-foreground text-center text-xl">
                                    Belum ada pertanyaan yang sering diajukan. Silakan periksa kembali nanti.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </FrontLayout>
    );
}
