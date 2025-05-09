# Active Context

_This file tracks the current work focus, recent changes, immediate next steps, active decisions, important patterns/preferences discovered, and project insights._

**Status:** Active Development
**Last Reviewed:** May 9, 2025
**Current Task:** Performing a general review and update of Memory Bank files based on recent activities (Internship Applicant 'show' page removal and `InternshipCrudTest.php` fix).

## Project Overview

This is a comprehensive internship management system (Manajement Magang) built with Laravel 12.x, React (TypeScript), Inertia.js, and Tailwind CSS (using Shadcn UI). It manages internship programs (KKL/KKN) for educational institutions, covering the entire lifecycle from application to completion, including logbooks, reports, and guidance sessions.

## Key Features (Implemented)

1.  **User Management & Authentication:**
    *   Roles: `admin`, `dosen` (lecturer), `mahasiswa` (student).
    *   Role-specific profiles (`admin_profiles`, `dosen_profiles`, `mahasiswa_profiles`).
    *   Authentication (Login, Registration, Password Reset, Email Verification) via Laravel Fortify/Sanctum adapted for Inertia.
    *   Authorization using `spatie/laravel-permission`.
2.  **Internship Management:**
    *   Application submission (`internships` table) with PDF uploads.
    *   Status tracking (`Submitted`, `Approved`, `Rejected`).
3.  **Activity Tracking (Logbooks):**
    *   Daily logbook entries (`logbooks` table) by students.
    *   Visibility for students and assigned Dosen.
    *   Dosen supervisor notes can be added via a modal.
4.  **Report Management:**
    *   Report submission (`reports` table) with file uploads.
    *   Visibility for students, assigned Dosen, and Admins.
    *   Partial Dosen Feedback: `reviewer_notes` can be added when a report is rejected.
5.  **Guidance System:**
    *   Class scheduling (`guidance_classes` table) by Admin/Dosen.
    *   Student assignment to classes.
    *   Attendance tracking (`guidance_class_attendance` table - QR code via URL & manual check-in implemented).
6.  **Support & Content Management (Admin):**
    *   FAQs (`faqs` table).
    *   Tutorials (`tutorials` table).
    *   Global Variables (`global_variables` table).
7.  **Notifications (In-App):**
    *   Database-driven (`notifications` table).
    *   Header dropdown and dedicated history page (`/notifications`).
    *   Mark Read/Unread, Delete functionality.
8.  **User Settings:**
    *   Profile updates.
    *   Password changes.
    *   Appearance (Light/Dark mode).
9.  **Trash Management (Admin):**
    *   View, Restore, Force Delete soft-deleted records.
10. **Testing:**
    *   Using Pest PHP framework.
    *   Feature tests for Authentication flows implemented (`tests/Feature/Auth/`).
    *   Utilizes SQLite in-memory database for testing.

## Technical Stack

*   **Backend:** Laravel 12.x
*   **Frontend:** React 18+ with TypeScript
*   **UI Framework:** Tailwind CSS with Shadcn UI components
*   **API/Integration:** Inertia.js
*   **Database:** MySQL/MariaDB (Development/Production), SQLite `:memory:` (Testing)
*   **Build Tool:** Vite
*   **Testing:** Pest PHP
*   **Key PHP Packages:** `inertiajs/inertia-laravel`, `spatie/laravel-permission`, `tightenco/ziggy`, `laravel/pint`
*   **Key JS Packages:** `react`, `@inertiajs/react`, `tailwindcss`, `typescript`, `@vitejs/plugin-react`

## Active Patterns & Preferences

1.  **RBAC:** `spatie/laravel-permission` for roles and permissions. Middleware used for route protection. Gates/Policies for fine-grained control.
2.  **Repository/Service Pattern:** Not strictly enforced currently, logic primarily resides within Controllers and Models.
3.  **File Management:** Laravel Filesystem (`local`, `public` disks). Validation for type and size in Form Requests.
4.  **Frontend Architecture:**
    *   Component-based UI (`resources/js/components/`, `resources/js/pages/`).
    *   Shared layouts (`resources/js/layouts/`).
    *   TypeScript for type safety.
    *   Shadcn UI components (`resources/js/components/ui/`) heavily used.
    *   Inertia forms (`useForm`) for data submission and validation error handling.
    *   `sonner` for toast notifications.
    *   `<AlertDialog>` for confirmations (e.g., delete actions).
    *   `<TooltipProvider>` for icon button hints.
5.  **Routing:** Laravel routes defined in `routes/`. Ziggy used to share routes with the frontend. Inertia handles frontend routing.
6.  **Validation:** Laravel Form Requests used extensively for backend validation. Frontend displays errors provided by Inertia.
7.  **Testing:** Pest PHP for Feature tests. Focus on testing behavior through HTTP requests. Use of `RefreshDatabase` trait with SQLite `:memory:`. Factory helpers for data setup.
8.  **UI Text:** Use Indonesian language for user-facing labels, buttons, messages. Fallback to English if translation is awkward or unclear.

## Recent Changes

*   **Logbook Enhancements:** Enabled 'dosen' users to add supervisor notes to logbooks via a modal. Optimized logbook pages for performance and user experience, including adding a back button and incorporating Tailwind CSS animations. Resolved backend authorization issues ensuring 'dosen' can correctly access and manage logbooks for their assigned students.
*   Implementation of Notification system (backend logic, API endpoints, frontend UI/actions).
*   Refinement of Dosen access controls for viewing advisee data (Internships, Reports).
*   Addition of analytics/summary cards to various index pages.
*   Implementation of User Settings pages (Profile, Password, Appearance).
*   Implementation of Admin Trash Management feature.
*   **Addition of Pest Feature tests for Authentication flows (Registration, Login, Password Reset, Email Verification).**
*   **[2025-05-08 18:55:02] - Confirmed partial implementation of Dosen feedback for reports (via rejection notes). General feedback feature remains a future enhancement.**
*   **[2025-05-08 19:02:28] - Guidance Class attendance feature (QR code via URL, manual Dosen check-in) confirmed as substantially implemented.**
*   **[2025-05-09 00:06:00] - Removed Internship Applicant 'show' page:** Based on user feedback, the dedicated 'show' page for internship applicants, its route, and associated frontend file ([`resources/js/pages/front/internships/applicants/show.tsx`](resources/js/pages/front/internships/applicants/show.tsx:1)) were removed to simplify user flow. Test redirects in [`tests/Feature/InternshipCrudTest.php`](tests/Feature/InternshipCrudTest.php:1) were updated accordingly.
*   **[2025-05-09 00:06:00] - Fixed `InternshipCrudTest.php`:** Resolved failing test `mahasiswa can update their own internship with valid data if editable` by correcting an incorrect redirect in [`app/Http/Controllers/Front/InternshipApplicantController.php`](app/Http/Controllers/Front/InternshipApplicantController.php:1) from the (now removed) 'show' route to the 'index' route. All tests in [`tests/Feature/InternshipCrudTest.php`](tests/Feature/InternshipCrudTest.php:1) are now passing.

## Current Focus Area

*   **Task:** Updating Memory Bank files ([`memory-bank/progress.md`](memory-bank/progress.md:1), [`memory-bank/decisionLog.md`](memory-bank/decisionLog.md:1), [`memory-bank/activeContext.md`](memory-bank/activeContext.md:1), and others as needed) to reflect the removal of the Internship Applicant 'show' page and the fix for tests in [`tests/Feature/InternshipCrudTest.php`](tests/Feature/InternshipCrudTest.php:1).

## Next Steps (After Documentation Update)

1.  **Testing:** Continue adding Pest tests for other core features (CRUD operations for Internships, Logbooks, Reports, Guidance Classes, FAQs, Tutorials, etc.). Aim for higher test coverage.
2.  **Dosen Feedback (Reports):** Implement a general feedback mechanism for Dosen on Reports (beyond rejection notes). (Logbook feedback partially implemented via supervisor notes; Report rejection notes also provide a feedback channel).
4.  **Refinement:** Address any remaining `TODO` comments in the code. Improve UI/UX based on feedback. Optimize queries or backend logic where necessary.
5.  **TypeScript:** Continue improving type safety, potentially defining more specific types for shared data structures (e.g., `NotificationData`).

## Important Preferences

1.  Prioritize clear, maintainable code.
2.  Use TypeScript for frontend development.
3.  Follow Laravel best practices.
4.  Write comprehensive tests using Pest.
5.  Maintain accurate Memory Bank documentation.
6.  Use Indonesian for UI text.

## Insights & Learnings

*   **Authorization Specificity:** Ensuring correct ID usage (e.g., `internship_id` for overall internship context vs. `logbook_id` for specific entries) in backend authorization queries is crucial for proper data access control. This was particularly relevant when fixing 'dosen' access to logbooks, where initial queries might have been too broad or used incorrect identifiers, leading to access issues.
*   **Modal Interactivity:** When implementing modals for actions like adding supervisor notes, ensure smooth data flow and state management between the modal and the parent page to reflect changes immediately.
*   **Component Reusability:** The back button and animation patterns can be abstracted into reusable components or hooks for consistency across different pages.


[2025-05-09 01:05:21] - Recent Changes: Created and debugged Pest tests for student report CRUD (`tests/Feature/Front/ReportCrudTest.php`). Ensured consistency with database schema, factories, requests, and other test files. Refactored test descriptions.
