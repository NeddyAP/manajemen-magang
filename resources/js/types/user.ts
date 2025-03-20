export interface Role {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles?: { name: string }[];
    profile?: {
        // Admin Profile
        employee_id?: string;
        department?: string;
        position?: string;
        employment_status?: string;
        join_date?: string;
        phone_number?: string;
        address?: string;
        supervisor_name?: string;
        work_location?: string;

        // Dosen Profile
        employee_number?: string;
        expertise?: string;
        last_education?: string;
        academic_position?: string;
        teaching_start_year?: number;

        // Mahasiswa Profile
        student_number?: string;
        study_program?: string;
        class_year?: number;
        academic_status?: string;
        semester?: number;
        advisor_id?: number;
        gpa?: number;
    };
}
