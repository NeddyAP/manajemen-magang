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
