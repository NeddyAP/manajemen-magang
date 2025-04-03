export interface Faq {
    id?: number;
    question: string;
    answer: string;
    category: string;
    is_active: boolean;
    order: number;
    created_at?: string;
    updated_at?: string;
}
