import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface CardItem {
    id: string;
    title: string;
    description: string;
    icon: ReactNode;
    route: string;
    buttonText: string;
    buttonVariant: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
    requiredPermissions?: string[];
}

interface CardViewProps {
    cards: CardItem[];
}

export function CardView({ cards }: CardViewProps) {
    return (
        <div className="flex flex-col">
            <div className="mb-8 text-center">
                <h1 className="mt-10 text-3xl font-bold tracking-tight">Program Magang</h1>
                <p className="text-muted-foreground">Kelola semua kebutuhan program magang Anda di satu tempat.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                    <Card key={card.id} className="flex flex-col text-center">
                        <CardHeader className="flex flex-col items-center pt-8">
                            {card.icon}
                            <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
                            <CardDescription className="mt-1 text-sm">{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto flex flex-col items-center pb-8">
                            <Button asChild variant={card.buttonVariant} className="mt-4 w-full max-w-xs">
                                <Link href={card.route}>{card.buttonText}</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
