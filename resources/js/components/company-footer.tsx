import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "Youtube" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" }
];

const pages = [
    { name: "Internships", href: "/internships" },
    { name: "Documentations", href: "/documentations" }
];

export default function CompanyFooter() {
    return (
        <footer className="border-t bg-background">
            <div className="container px-4 py-10 md:py-16">
                <div className="grid gap-8 md:gap-12 lg:gap-16 md:grid-cols-3">
                    {/* Left Section - Company Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img src="/assets/logo.svg" alt="Company Logo" className="h-16 w-auto" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold tracking-wide text-muted-foreground">FAKULTAS ILMU KOMPUTER</h4>
                                <h2 className="text-2xl font-bold tracking-tight">UNIDA BOGOR</h2>
                                <p className="text-xs tracking-[0.3em] text-muted-foreground">KAMPUS BERTAUHID</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <Button
                                    key={social.label}
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-primary"
                                    asChild
                                >
                                    <a href={social.href} aria-label={social.label}>
                                        <social.icon className="h-5 w-5" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Center Section - Related Pages */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Related Pages</h4>
                        <nav className="flex flex-col space-y-2">
                            {pages.map((page) => (
                                <Link
                                    key={page.name}
                                    href={page.href}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {page.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Section - Contact Information */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold">Contact Information</h4>
                        <div className="space-y-2 text-muted-foreground">
                            <p>JL. Ir. H. Juanda No. 96, Kota Bogor</p>
                            <p>Email: fasilkom@unida.ac.id</p>
                            <p>Phone: (0251) 8356884</p>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                {/* Bottom Section - Copyright */}
                <div className="text-center text-sm text-muted-foreground">
                    © 2025 Manajemen Magang UNIDA Bogor. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
