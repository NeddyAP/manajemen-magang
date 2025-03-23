import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Youtube, href: '#', label: 'Youtube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
];

const pages = [
    { name: 'Internships', href: '/internships' },
    { name: 'Documentations', href: '/documentations' },
];

export default function AppFooter() {
    return (
        <footer className="bg-background border-t">
            <div className="container px-4 py-10 md:py-16">
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 md:gap-12 lg:gap-16">
                    {/* Left Section - Company Info */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4 sm:justify-start">
                            <img src="/assets/logo.svg" alt="Company Logo" className="h-16 w-auto" />
                            <div className="space-y-1">
                                <h4 className="text-muted-foreground text-sm font-semibold tracking-wide">FAKULTAS ILMU KOMPUTER</h4>
                                <h2 className="text-2xl font-bold tracking-tight">UNIDA BOGOR</h2>
                                <p className="text-muted-foreground text-xs tracking-[0.3em]">KAMPUS BERTAUHID</p>
                            </div>
                        </div>
                        <div className="flex justify-center gap-4 sm:justify-start">
                            {socialLinks.map((social) => (
                                <Button key={social.label} variant="ghost" size="icon" className="hover:text-primary" asChild>
                                    <a href={social.href} aria-label={social.label}>
                                        <social.icon className="h-5 w-5" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Center Section - Related Pages */}
                    <div className="space-y-4 text-center sm:text-left">
                        <h4 className="text-lg font-semibold">Halaman Terkait</h4>
                        <nav className="flex flex-col space-y-2">
                            {pages.map((page) => (
                                <Link key={page.name} href={page.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                    {page.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Section - Contact Information */}
                    <div className="space-y-4 text-center sm:text-left">
                        <h4 className="text-lg font-semibold">Informasi Kontak</h4>
                        <div className="text-muted-foreground space-y-2">
                            <p>JL. Ir. H. Juanda No. 96, Kota Bogor</p>
                            <p>Email: fasilkom@unida.ac.id</p>
                            <p>Telepon: (0251) 8356884</p>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Bottom Section - Copyright */}
                <div className="text-muted-foreground text-center text-sm">Neddy © 2025. All rights reserved.</div>
            </div>
        </footer>
    );
}
