import { User } from './user';

export interface GuidanceClass {
    id: number;
    title: string;
    lecturer: {
        id: number;
        name: string;
        employee_number: string;
        expertise: string;
        academic_position: string;
    };
    start_date: string;
    end_date: string | null;
    room: string | null;
    description: string | null;
    qr_code: string | null;
    participants_count?: number;
    students?: Array<{
        id: number;
        name: string;
        student_number: string;
        study_program: string;
        semester: number;
        internship: {
            company_name: string;
            status: 'pending' | 'active' | 'ongoing';
        };
        attendance: {
            attended_at: string | null;
            attendance_method: string | null;
            notes: string | null;
        };
    }>;
}

export interface GuidanceClassFormData {
    [key: string]: unknown;
    title: string;
    lecturer_id: number;
    start_date: string;
    end_date?: string;
    room?: string;
    description?: string;
}

export interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    lecturers: User[];
}

// Define the guidance class stats type
export interface GuidanceClassStats {
    total: number;
    upcoming: number;
    ongoing: number;
    finished: number;
}
