import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import FrontLayout from "@/layouts/front-layout";
import CompanyFooter from "@/components/company-footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
    const { auth } = usePage<SharedData>().props;

    const tutorials = [
        {
            title: "Getting Started with Internships",
            description: "Learn how to navigate through the internship management system and make the most of your experience.",
            youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
            title: "Managing Your Logbook",
            description: "A comprehensive guide on how to maintain and submit your daily internship activities in the logbook.",
            youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    ];

    const faqs = [
        {
            question: "How do I register for an internship?",
            answer: "To register for an internship, first login to your account and navigate to the 'Internships' section. Fill out the required information including your preferred company and duration. Your request will be reviewed by your advisor."
        },
        {
            question: "What documents do I need to submit?",
            answer: "You'll need to submit your CV, a recommendation letter from your department, and a formal application letter. All documents should be in PDF format and can be uploaded through the documents section of your profile."
        },
        {
            question: "How often should I update my logbook?",
            answer: "You should update your logbook daily with your internship activities. Each entry should include what you learned, tasks completed, and any challenges encountered. Regular updates are required for successful internship completion."
        }
    ];

    return (
        <FrontLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="relative">
                <section id="hero" className="min-h-screen w-full flex items-center bg-gradient-to-b from-primary/5 to-background">
                    <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-6 lg:px-8">
                        <div className="flex flex-col items-start text-left space-y-8">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Internship Management System
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Streamline your internship journey with our comprehensive management platform. Track progress, submit reports, and collaborate seamlessly.
                            </p>
                            <Button asChild size="lg" className="font-semibold">
                                <Link href={route('register')}>
                                    Get Started
                                </Link>
                            </Button>
                        </div>
                        <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
                            <img
                                src="/assets/logo.svg"
                                alt="Internship Management Illustration"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent backdrop-blur-[2px]" />
                        </div>
                    </div>
                </section>

                <section id="tutorial" className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-background to-secondary/5 px-6 lg:px-8">
                    <div className="w-full max-w-5xl py-24">
                        <h2 className="text-3xl font-semibold mb-8 text-center">Learning Resources</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {tutorials.map((tutorial, index) => (
                                <Card key={index} className="backdrop-blur-sm bg-card/50">
                                    <CardHeader>
                                        <CardTitle>{tutorial.title}</CardTitle>
                                        <CardDescription>{tutorial.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" asChild>
                                            <a href={tutorial.youtubeLink} target="_blank" rel="noopener noreferrer">
                                                Watch on YouTube
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="faq" className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-secondary/5 to-background px-6 lg:px-8">
                    <div className="w-full max-w-4xl py-24">
                        <h2 className="text-3xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
                        <Accordion type="single" collapsible className="w-full backdrop-blur-sm">
                            {faqs.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </section>
            </div>
            <CompanyFooter />
        </FrontLayout>
    );
}
