import { User } from './user';

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
    logbooks_count?: number;
    reports_count?: number;
}

export interface Logbook {
    id?: number;
    internship_id?: number;
    date?: string;
    activities?: string;
    supervisor_notes?: string;
    created_at?: string;
    updated_at?: string;
    internship?: {
        id?: number;
        company_name?: string;
        company_address?: string;
        start_date?: string;
        end_date?: string;
        user?: User & {
            mahasiswaProfile?: {
                id?: number;
                nim?: string;
                study_program?: string;
                advisor?: {
                    id?: number;
                    name?: string;
                    dosenProfile?: {
                        id?: number;
                        nip?: string;
                    };
                };
            };
        };
    };
}

export interface Report {
    id?: number;
    user_id?: number;
    user?: User;
    internship_id?: number;
    internship?: {
        company_name?: string;
    };
    title?: string;
    report_file?: string;
    version?: number;
    status?: 'pending' | 'approved' | 'rejected';
    reviewer_notes?: string;
    created_at?: string;
    updated_at?: string;
}
