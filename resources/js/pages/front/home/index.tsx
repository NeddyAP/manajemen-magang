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
                    className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-sky-100 via-sky-200 to-teal-600 transition-colors duration-200 dark:from-gray-800 dark:via-gray-900 dark:to-black"
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
                                className="h-auto max-min-h-screen w-auto max-w-full object-contain"
                            />
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl">
                    <section
                        id="tutorial"
                        className="from-background to-secondary/5 flex min-h-screen w-full items-center justify-center bg-gradient-to-b px-6 lg:px-8"
                    >
                        <div className="w-full max-w-5xl py-24">
                            <h2 className="mb-8 text-center text-3xl font-semibold">Panduan Penggunaan Website</h2>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {/* grid looping from globalvariable (video iframe) */}
                                {globalVariables.map((globalVariable) => {
                                    if (globalVariable.type === 'video_tutorial') {
                                        return (
                                            <Card key={globalVariable.id} className="w-full">
                                                <CardHeader>
                                                    <CardTitle>{globalVariable.key}</CardTitle>
                                                    <CardDescription>{globalVariable.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <iframe
                                                        src={globalVariable.value}
                                                        title={globalVariable.key}
                                                        className="h-[400px] w-full rounded-lg"
                                                        allowFullScreen
                                                    ></iframe>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                })}
                            </div>
                        </div>
                    </section>

                    <section
                        id="faq"
                        className="from-secondary/5 to-background flex min-h-screen w-full items-center justify-center bg-gradient-to-b px-6 lg:px-8"
                    >
                        <div className="w-full max-w-4xl py-24">
                            <h2 className="mb-8 text-center text-3xl font-semibold">Pertanyaan yang Sering Diajukan</h2>

                            {faqCategories.length > 0 ? (
                                <Tabs defaultValue={faqCategories[0]} className="w-full">
                                    <TabsList className="mb-6 flex w-full flex-wrap justify-center gap-2">
                                        {faqCategories.map((category) => (
                                            <TabsTrigger key={category} value={category} className="px-4 py-2">
                                                {category}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {faqCategories.map((category) => (
                                        <TabsContent key={category} value={category} className="w-full backdrop-blur-sm">
                                            <Accordion type="single" collapsible className="w-full">
                                                {faqsByCategory[category]?.map((faq, index) => (
                                                    <AccordionItem key={index} value={`item-${category}-${index}`}>
                                                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                                        <AccordionContent>{faq.answer}</AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            ) : (
                                <p className="text-muted-foreground text-center">Tidak ada FAQ tersedia saat ini.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </FrontLayout>
    );
}
