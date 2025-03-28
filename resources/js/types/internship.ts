import { User } from '.';

export interface Internship {
    id?: number;
    user_id?: number;
    user?: User;
    type?: string;
    application_file?: string;
    company_name?: string;
    company_address?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    progress?: number;
    progress_percentage?: number;
    created_at?: string;
    updated_at?: string;
    status_message?: string | null;
    logbooks_count?: number; // Optional count
    reports_count?: number; // Optional count
}

export interface Logbook {
    id: number;
    internship_id: number;
    date: string;
    activities: string;
    supervisor_notes: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Report {
    id: number;
    user_id: number;
    internship_id: number;
    title: string;
    report_file: string; // Path to the file
    version: number;
    status: 'pending' | 'approved' | 'rejected';
    reviewer_notes?: string | null;
    created_at: string; // Assuming timestamps are returned
    updated_at: string;
}

// You might have other related types here
