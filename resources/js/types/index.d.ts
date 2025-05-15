import { GlobalVariable } from '@/pages/admin/global-variables';
import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    role: string;
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
    isCurrent?: boolean;
    isActive?: boolean;
    icon?: React.ReactNode;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    app: {
        name: string;
        // Add other app-specific properties if they exist
    };
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    globalVariables: GlobalVariable[];
    mahasiswa_profile: MahasiswaProfile;
    dosen_profile: DosenProfile;
    admin_profile: AdminProfile;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string | null;
    roles?: { name: string }[];
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

// Exporting TableMeta so it can be used by other modules
export interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

// Define the generic PageProps
export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & SharedData;

// Export notification types
export * from './notifications';
