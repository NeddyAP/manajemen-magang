import FrontLayout from '@/layouts/front-layout';
import { Tutorial } from '@/types/tutorial';
import { Head, router } from '@inertiajs/react';
import { BookOpen, CalendarDays, Download, GraduationCap, Search, ShieldCheck, User, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Tutorials({ tutorials }: { tutorials: Tutorial[] }) {

    return (
        <FrontLayout>
            <Head title="Buku Panduan" />
            <div>test 123</div>
        </FrontLayout>
    );
}
