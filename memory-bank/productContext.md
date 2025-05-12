# Product Context

This document outlines the business logic, user roles, features, and workflows of the internship management system (Manajement Magang).

## User Roles & Responsibilities

### 1. Student (Mahasiswa)

- **Responsibilities:** Apply for internship programs (KKL/KKN), submit daily logbook entries, upload and manage internship reports, attend scheduled guidance classes, manage personal profile and settings.
- **Permissions:**
    - Create/edit own internship applications.
    - Manage personal logbook entries (create, edit, delete).
    - Submit and manage own reports (create, edit, delete).
    - View assigned guidance classes and related details.
    - Access general tutorials and FAQs.
    - View own notifications.
    - Update own profile (name, email, etc.) and password.
    - Manage appearance settings.

### 2. Lecturer (Dosen)

- **Responsibilities:** Supervise assigned students, review student internship applications, review logbook entries and provide feedback, evaluate student reports (including adding `reviewer_notes`, particularly if rejecting or requesting revisions), **upload report revisions**, schedule and conduct guidance classes, manage own profile and settings.
- **Permissions:**
    - View internship applications of assigned advisees.
    - View logbook entries of assigned advisees and add notes/feedback.
    - View reports submitted by assigned advisees.
    - **Upload revised versions of student reports (for accepted/rejected reports).**
    - Create, manage, and view attendance for own guidance classes.
    - Assign students to guidance classes.
    - Access general tutorials and FAQs.
    - View own notifications.
    - Update own profile (name, email, etc.) and password.
    - Manage appearance settings.
    - _(Note: Dosen generally do not directly approve/reject applications or reports in the current workflow; this is handled by Admins, but Dosen provide input/supervision)._

### 3. Administrator (Admin)

- **Responsibilities:** Manage user accounts (all roles), oversee and process internship applications, monitor system activity, manage system content (FAQs, Tutorials, Global Variables), manage guidance classes, view all system data, manage system settings, handle trash recovery/deletion.
- **Permissions:**
    - Full system access (CRUD operations on most resources).
    - Manage all user accounts (create, edit, delete, assign roles).
    - Process all internship applications (review, approve, reject).
    - Review all logbooks and reports.
    - Manage all guidance classes.
    - Manage system content (FAQs, Tutorials, Global Variables).
    - Access system analytics/dashboards.
    - Manage soft-deleted items (restore, force delete).
    - Update own profile (name, email, etc.) and password.
    - Manage appearance settings.

## Business Processes

### 1. Internship Application

- **Flow:**
    1.  Student creates and submits an application with required details and PDF document uploads.
    2.  Application status becomes `waiting`.
    3.  Admin reviews the application.
    4.  Admin changes status to `accepted` or `rejected`.
    5.  Student and relevant Admin/Dosen are notified of status changes via In-App Notifications.
- **Statuses:** `Draft` (Implicit), `waiting`, `accepted`, `rejected`.
- **Requirements:** Valid student profile, completed form fields, required PDF document uploads.

### 2. Logbook Management

- **Flow:**
    1.  Student creates daily logbook entries detailing activities.
    2.  Entries are visible to the student and their assigned Dosen supervisor.
    3.  Dosen can view entries and add feedback/notes (future enhancement).
- **Frequency:** Expected daily during the internship period.
- **Components:** Date, activity description, optional supporting documents (future).

### 3. Report Submission

- **Flow:**
    1.  Student uploads their internship report (PDF, DOCX, etc.).
    2.  Report is visible to the student, assigned Dosen, and Admins.
    3.  Dosen/Admin review the report. Dosen can add `reviewer_notes` to the report, especially if recommending rejection or revisions.
    4.  Admin updates the report status (e.g., `pending`, `approved`, `rejected`).
    5.  Student is notified of status changes and any `reviewer_notes`.
    6.  **Dosen can upload a revised version of the student's report. This revised file is stored in addition to the original and does not replace it. This is typically done after a report has been `accepted` or `rejected` and requires further Dosen input.**
    7.  **Student is notified when a Dosen uploads a report revision.**
- **Versioning:** Student re-uploads/updates create new versions. Dosen-uploaded revisions are stored separately.
- **Requirements:** Standard report format (as defined by institution), file upload. UI text in Indonesian.

### 4. Guidance Classes

- **Flow:**
    1.  Admin or Dosen creates a guidance class, setting the topic, schedule, and location.
    2.  Admin/Dosen assigns relevant students to the class.
    3.  Students are notified about scheduled classes.
    4.  Attendance is tracked (currently manual check-in, QR code planned).
    5.  Materials can be associated (via description or future upload feature).
- **Features:** Scheduling, student assignment, attendance list.

## Product Features

### 1. Dashboards

- **Student Dashboard:** Overview of application status, recent logbook activity, upcoming guidance sessions, notifications.
- **Lecturer Dashboard:** List of supervised students, pending items requiring attention (e.g., recent logbooks - future), scheduled guidance sessions.
- **Admin Dashboard:** System statistics (user counts, application counts by status), links to management sections (Users, FAQs, Tutorials, Global Variables, Trash), recent activity overview.

### 2. Notification System (In-App)

- **Channel:** Database (`notifications` table).
- **UI:**
    - Header dropdown (Bell icon) showing unread count and list of recent unread notifications.
    - Dedicated history page (`/notifications`) displaying all notifications (paginated).
- **Functionality:**
    - Mark notifications as read (individually by clicking, all via button).
    - Mark read notifications as unread (on history page).
    - Delete notifications (individually on history page, with confirmation).
    - Clicking a notification navigates to a relevant link (if provided).
- **Implemented Triggers:**
    - Internship Application Submitted (Notifies Admin/Dosen)
    - Internship Application Status Changed (Notifies Student)
    - Logbook Entry Submitted (Notifies Dosen)
    - Report Submitted (Notifies Dosen)
    - Report Status Changed (Notifies Student, includes `reviewer_notes` if present)
    - **Report Revision Uploaded by Dosen (Notifies Student)**
    - Guidance Class Scheduled/Updated (Notifies assigned Students)
- **Out of Scope (Currently):** Email notifications, Real-time push notifications, System announcements via notifications.

### 3. Document Management

- **Mechanism:** File uploads associated with specific records (Applications, Reports, Logbooks - future).
- **Storage:** Configured via Laravel Filesystem (`local`, `public` disks used).
- **Supported Formats:** Primarily PDF, DOC/DOCX. Other types might be configurable.
- **Features:** Secure storage, access control based on user roles/ownership, download functionality. Version control is implicit (re-upload).

### 4. Content Management (Admin)

- **FAQs:** Create, Read, Update, Delete Frequently Asked Questions.
- **Tutorials:** Create, Read, Update, Delete tutorial entries.
- **Global Variables:** Manage system-wide key-value pairs.

### 5. User Settings

- **Profile:** Update name, email, specific profile details (NIM, NIDN etc.).
- **Password:** Change account password.
- **Appearance:** Select Light/Dark mode, theme settings.

### 6. Trash Management (Admin)

- View soft-deleted records (Users, FAQs, etc.).
- Restore deleted records.
- Permanently delete records.

### 7. Testing

- **Framework:** Pest PHP.
- **Environment:** Uses an in-memory SQLite database (`:memory:`) for isolated testing.
- **Focus:** Feature tests covering core application logic, especially Authentication flows (Registration, Login, Password Reset, Email Verification).

## Quality Standards

- **Application Processing:** Admin review expected within a reasonable timeframe (e.g., 2-3 business days). Clear status updates via notifications.
- **Document Management:** Reliable uploads and downloads. Secure storage preventing unauthorized access.
- **User Experience:** Intuitive navigation within role-specific layouts. Responsive design. Fast page loads (<1s). Clear feedback via toasts and validation messages. Use of Indonesian language for UI text.
- **Code Quality:** Adherence to Laravel and React best practices. Maintainable and readable code. Good test coverage. Minimal technical debt.

## Success Metrics

- **System Performance:** Low page load times, high uptime, low error rates.
- **User Engagement:** High login frequency, regular use of core features (logbooks, reports), high task completion rates.
- **Program Efficiency:** Reduced time for application processing, timely feedback loops, high compliance with logbook/report submissions.
- **Technical Health:** High test coverage (>80%), successful CI/CD pipeline runs, low bug report rate.

## Future Enhancements (Potential)

- Real-time notifications (e.g., using WebSockets).
- Enhanced analytics and reporting module.
- Dosen feedback mechanism for logbooks/reports.
- QR code integration for guidance class attendance.
- Mobile responsiveness improvements.
- Integration with other university systems (SIS, LMS).
- Email notification channel.
