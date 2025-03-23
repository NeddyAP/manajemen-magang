import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FrontLayout from '@/layouts/front-layout';
import { Head, Link } from '@inertiajs/react';

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
    const tutorials = [
        {
            title: 'Memulai Magang',
            description: 'Pelajari cara menavigasi sistem manajemen magang dan memaksimalkan pengalaman Anda.',
            youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
        {
            title: 'Mengelola Buku Catatan Anda',
            description: 'Panduan lengkap tentang cara memelihara dan mengirimkan aktivitas magang harian Anda di buku catatan.',
            youtubeLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
    ];

    return (
        <FrontLayout>
            <Head title="Selamat Datang">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="relative">
                <section id="hero" className="from-primary/5 to-background flex min-h-screen w-full items-center bg-gradient-to-b">
                    <div className="container grid grid-cols-1 items-center gap-8 px-6 lg:grid-cols-2 lg:px-8">
                        <div className="flex flex-col items-start space-y-8 text-left">
                            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent sm:text-5xl lg:text-6xl">
                                Sistem Manajemen Magang
                            </h1>
                            <p className="text-muted-foreground text-xl">
                                Sederhanakan perjalanan magang Anda dengan platform manajemen komprehensif kami. Lacak kemajuan, kirim laporan, dan
                                berkolaborasi dengan lancar.
                            </p>
                            <Button asChild size="lg" className="font-semibold">
                                <Link href={route('register')}>Mulai</Link>
                            </Button>
                        </div>
                        <div className="relative h-[500px] w-full overflow-hidden rounded-lg">
                            <img
                                src="/assets/logo.svg"
                                alt="Internship Management Illustration"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="from-background/80 absolute inset-0 bg-gradient-to-t to-transparent backdrop-blur-[2px]" />
                        </div>
                    </div>
                </section>

                <section
                    id="tutorial"
                    className="from-background to-secondary/5 flex min-h-screen w-full items-center justify-center bg-gradient-to-b px-6 lg:px-8"
                >
                    <div className="w-full max-w-5xl py-24">
                        <h2 className="mb-8 text-center text-3xl font-semibold">Sumber Belajar</h2>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {tutorials.map((tutorial, index) => (
                                <Card key={index} className="bg-card/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle>{tutorial.title}</CardTitle>
                                        <CardDescription>{tutorial.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" asChild>
                                            <a href={tutorial.youtubeLink} target="_blank" rel="noopener noreferrer">
                                                Tonton di YouTube
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
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
        </FrontLayout>
    );
}
