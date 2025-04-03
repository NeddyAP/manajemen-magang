export interface Tutorial {
    id: number;
    title: string;
    content: string;
    file_name: string;
    file_path: string;
    access_level: 'all' | 'admin' | 'mahasiswa' | 'dosen';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}
