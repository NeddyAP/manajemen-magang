export interface Role {
    id: number;
    name: string;
    guard_name?: string;
}

export interface User {
    id?: number;
    name: string;
    email: string;
    roles?: { name: string }[];
    permissions?: string[];
    avatar_url?: string | null | undefined;
    profile?: Record<string, unknown>;
    google_id?: string | null;
    admin_profile?: {
        employee_id: string;
        department: string;
        position: string;
        employment_status: string;
        join_date: string;
        phone_number: string;
        address: string;
        supervisor_name: string;
        work_location: string;
    };
    dosen_profile?: {
        employee_number: string;
        expertise: string;
        last_education: string;
        academic_position: string;
        employment_status: string;
        teaching_start_year: string | number;
    };
    mahasiswa_profile?: {
        student_number: string;
        study_program: string;
        class_year: string | number;
        academic_status: string;
        semester: number;
        advisor_id: string | number;
        advisor: {
            name: string;
            email: string;
            roles?: { name: string }[];
            profile?: Record<string, unknown>;
            dosen_profile?: {
                employee_number: string;
                expertise: string;
                last_education: string;
                academic_position: string;
                employment_status: string;
                teaching_start_year: string | number;
            };
        };
        gpa: string | number;
    };
}

export interface Lecturer {
    id: string;
    name: string;
    employee_number: string;
}
