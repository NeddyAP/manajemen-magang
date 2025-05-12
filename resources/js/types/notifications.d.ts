// Base structure for all notification data payloads
export interface NotificationDataBase {
    message: string;
    link?: string; // General link, some notifications might use 'url' or have specific link structures
    url?: string; // Alternative for link
}

// Specific Notification Data Payloads

export interface GuidanceClassScheduledData extends NotificationDataBase {
    guidance_class_id: number;
    link: string; // e.g., route('front.guidance-classes.index')
}

export interface InternshipApplicationStatusChangedData extends NotificationDataBase {
    internship_id: number;
    status: 'accepted' | 'rejected' | string; // string for fallback
    link: string; // e.g., route('front.internships.applicants.index')
}

export interface InternshipApplicationSubmittedData extends NotificationDataBase {
    internship_id: number;
    applicant_id: number;
    applicant_name: string;
    link: string; // e.g., route('admin.internships.edit', internship_id)
}

export interface LogbookEntrySubmittedData extends NotificationDataBase {
    logbook_id: number;
    internship_id: number;
    student_id: number;
    student_name: string;
    link: string; // e.g., route('front.logbooks.index') + '?internship_id='
}

export interface ReportRevisionUploadedData extends NotificationDataBase {
    report_id: number;
    report_title: string;
    internship_id: number;
    dosen_id: number;
    dosen_name: string;
    url: string; // e.g., route('front.internships.reports.index', internship_id)
}

export interface ReportStatusChangedData extends NotificationDataBase {
    report_id: number;
    internship_id: number;
    status: 'approved' | 'rejected' | string; // string for fallback
    link: string; // e.g., route('front.internships.reports.index', internship_id)
}

export interface ReportSubmittedData extends NotificationDataBase {
    report_id: number;
    internship_id: number;
    student_id: number;
    student_name: string;
    link: string; // e.g., route('front.reports.index', { internship_id })
}

// Union type for any known notification data structure
export type SpecificNotificationData =
    | GuidanceClassScheduledData
    | InternshipApplicationStatusChangedData
    | InternshipApplicationSubmittedData
    | LogbookEntrySubmittedData
    | ReportRevisionUploadedData
    | ReportStatusChangedData
    | ReportSubmittedData;

// Structure of a Laravel Database Notification object
export interface DatabaseNotification {
    id: string; // UUID
    type: string; // Full class name of the notification, e.g., "App\\Notifications\\Internship\\ApplicationSubmitted"
    data: SpecificNotificationData | NotificationDataBase; // The actual payload, should be one of the specific types
    read_at: string | null;
    created_at: string;
    // Laravel might add other fields like notifiable_id, notifiable_type but these are primary
}

// Paginated response structure for notifications (from NotificationController@history)
export interface PaginatedNotifications {
    current_page: number;
    data: DatabaseNotification[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Response from NotificationController@index
export interface NotificationIndexResponse {
    unread: DatabaseNotification[];
    unread_count: number;
    // read?: DatabaseNotification[]; // If uncommented in controller
}
