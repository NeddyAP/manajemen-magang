import { User } from './user';

export interface Internship {
    id?: number;
    user_id?: number;
    user?: User;
    type?: string;
    application_file?: string;
    spp_payment_file?: string;
    kkl_kkn_payment_file?: string;
    practicum_payment_file?: string;
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
    completion_status?: string;
    mahasiswa_name?: string | null; // Added for Dosen view in applicants table
    mahasiswa_nim?: string | null; // Added for Dosen view in applicants table
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
    revised_file_path?: string | null; // Added for Dosen's revised file
    version?: number;
    status?: 'pending' | 'approved' | 'rejected';
    reviewer_notes?: string;
    created_at?: string;
    updated_at?: string;
    revision_uploaded_at?: string | null; // Added for Dosen's revised file upload time
}

/**
 * Represents statistics related to internships.
 * - `total`: Total number of internships.
 * - `waiting`: Number of internships waiting for approval.
 * - `accepted`: Number of approved internships.
 * - `rejected`: Number of rejected internships.
 */
export interface InternshipStats {
    total: number;
    waiting: number;
    accepted: number;
    rejected: number;
}

/**
 * Represents statistics related to reports.
 * - `total`: Total number of reports.
 * - `pending`: Number of reports pending review.
 * - `approved`: Number of approved reports.
 * - `rejected`: Number of rejected reports.
 */
export interface ReportStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}
