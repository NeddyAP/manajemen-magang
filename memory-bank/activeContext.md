# Active Context

_This file tracks the current work focus, recent changes, immediate next steps, active decisions, important patterns/preferences discovered, and project insights._

**Status:** Active Development
**Last Reviewed:** May 12, 2025
**Current Task:** Fixing `GuidanceClassCrudTest` failure.

## Project Overview

This is a comprehensive internship management system (Manajement Magang) built with Laravel 12.x, React (TypeScript), Inertia.js, and Tailwind CSS (using Shadcn UI). It manages internship programs (KKL/KKN) for educational institutions, covering the entire lifecycle from application to completion, including logbooks, reports, and guidance sessions.

## Key Features (Implemented)

1.  **User Management & Authentication:**
    - Roles: `admin`, `dosen` (lecturer), `mahasiswa` (student).
    - Role-specific profiles (`admin_profiles`, `dosen_profiles`, `mahasiswa_profiles`).
    - Authentication (Login, Registration, Password Reset, Email Verification) via Laravel Fortify/Sanctum adapted for Inertia.
    - Authorization using `spatie/laravel-permission`.
2.  **Internship Management:**
    - Application submission (`internships` table) with PDF uploads.
    - Status tracking (`waiting`, `accepted`, `rejected`).
3.  **Activity Tracking (Logbooks):**
    - Daily logbook entries (`logbooks` table) by students.
    - Visibility for students and assigned Dosen.
    - Dosen supervisor notes can be added via a modal.
4.  **Report Management:**
    - Report submission (`reports` table) with file uploads.
    - Visibility for students, assigned Dosen, and Admins.
    - Dosen Feedback: `reviewer_notes` can be added by Dosen, especially when a report is rejected or needs revisions. Dosen can also upload revised versions of reports.
5.  **Guidance System:**
    - Class scheduling (`guidance_classes` table) by Admin/Dosen.
    - Student assignment to classes (including automatic attachment of eligible students on creation).
    - Attendance tracking (`guidance_class_attendance` table - QR code via URL & manual check-in implemented).
6.  **Support & Content Management (Admin):**
    - FAQs (`faqs` table).
    - Tutorials (`tutorials` table).
    - Global Variables (`global_variables` table).
7.  **Notifications (In-App):**
    - Database-driven (`notifications` table).
    - Header dropdown and dedicated history page (`/notifications`).
    - Mark Read/Unread, Delete functionality.
8.  **User Settings:**
    - Profile updates.
    - Password changes.
    - Appearance (Light/Dark/Green mode).
9.  **Trash Management (Admin):**
    - View, Restore, Force Delete soft-deleted records.
10. **Testing:**
    - Using Pest PHP framework.
    - Utilizes SQLite in-memory database for testing.

## Technical Stack

- **Backend:** Laravel 12.x
- **Frontend:** React 19+ with TypeScript
- **UI Framework:** Tailwind CSS with Shadcn UI components
- **API/Integration:** Inertia.js
- **Database:** MySQL/MariaDB (Development/Production), SQLite `:memory:` (Testing)
- **Build Tool:** Vite
- **Testing:** Pest PHP
- **Key PHP Packages:** `inertiajs/inertia-laravel`, `spatie/laravel-permission`, `tightenco/ziggy`, `laravel/pint`
- **Key JS Packages:** `react`, `@inertiajs/react`, `tailwindcss`, `typescript`, `@vitejs/plugin-react`
- **Other:** `sonner` (toasts), `html5-qrcode` (QR scanning), `qrcode.react` (QR generation), `date-fns` (date utilities), `recharts` (charting)

## Active Patterns & Preferences

1.  **RBAC:** `spatie/laravel-permission` for roles and permissions. Middleware used for route protection. Gates/Policies for fine-grained control.
2.  **Repository/Service Pattern:** Not strictly enforced currently, logic primarily resides within Controllers and Models.
3.  **File Management:** Laravel Filesystem (`local`, `public` disks). Validation for type and size in Form Requests.
4.  **Frontend Architecture:**
    - Component-based UI (`resources/js/components/`, `resources/js/pages/`).
    - Shared layouts (`resources/js/layouts/`).
    - TypeScript for type safety.
    - Shadcn UI components (`resources/js/components/ui/`) heavily used.
    - Inertia forms (`useForm`) for data submission and validation error handling.
    - `sonner` for toast notifications.
    - `<AlertDialog>` for confirmations (e.g., delete actions).
    - `<TooltipProvider>` for icon button hints.
5.  **Routing:** Laravel routes defined in `routes/`. Ziggy used to share routes with the frontend. Inertia handles frontend routing.
6.  **Validation:** Laravel Form Requests used extensively for backend validation. Frontend displays errors provided by Inertia.
7.  **Testing:** Pest PHP for Feature tests. Focus on testing behavior through HTTP requests. Use of `RefreshDatabase` trait with SQLite `:memory:`. Factory helpers for data setup.
8.  **UI Text:** Use Indonesian language for user-facing labels, buttons, messages. Fallback to English if translation is awkward or unclear.

## Recent Changes

- **[2025-05-12] - Fix: Guidance Class Student Attachment.** Updated `GuidanceClassController@store` to automatically find and attach eligible students (creating `guidance_class_attendance` records) when a new guidance class is created. This addresses a failing test in `GuidanceClassCrudTest`.
- **[2025-05-12] - Memory Bank Review:** Reviewed all core memory bank files (`projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`) as requested by the user. No significant content updates were required based on the immediate preceding conversation (context condensation).
- **[2025-05-11] - Feature: Dosen Report Revision Upload.** Implemented backend (model, migration, controller, request, route, notification) and frontend (TypeScript type, UI in table, new modal) for Dosen to upload revised student reports. Added comprehensive Pest feature tests.
- **[2025-05-11] - Clarified Dosen Report Feedback:** Updated Memory Bank to reflect that Dosen can add `reviewer_notes` to reports, in addition to uploading revisions. This is distinct from a more general feedback system which is a future consideration.
- **[2025-05-11] - General Memory Bank Update:** Updated `activeContext.md`, `techContext.md`, `progress.md`, `decisionLog.md` to reflect the current application state.
- **[2025-05-11 09:25:53] - Confirmed and updated backend functionality for logbook export to Word and PDF. Routes in `routes/web.php` were updated to match frontend naming conventions.**
- **Logbook Enhancements:**
    - Enabled 'dosen' users to add supervisor notes to logbooks via a modal.
    - Optimized logbook pages: added back button, incorporated Tailwind CSS animations for better UX.
    - Resolved backend authorization issues for 'dosen' access to logbooks, ensuring correct student data visibility.
- **Features:** Implemented Notification System, User Settings, Admin Trash Management.
- **Backend:** Added Notification controllers/API, refined Dosen access logic for other modules, added soft deletes to individual migrations and removed consolidated one.
- **Frontend:** Built UI for Notifications, Settings, Trash. Added analytics cards. Removed Internship Applicant 'show' page.
- **Testing:** Added Pest Feature tests for Authentication, Logbooks (Student), Reports (Student), Internships (Student). Fixed tests related to Internship 'show' page removal.
- **Documentation:** Ongoing Memory Bank updates.
- \*\*[2025-05-08 18:54:33] - Clarified Dosen report feedback: Dosen can add `reviewer_notes` (especially for rejections/revisions) and upload report revisions. General, non-status-related feedback feature remains a future enhancement.
- **[2025-05-08 19:02:06] - Confirmed substantial implementation of Guidance Class attendance feature (QR code via URL and manual check-in).**
- **[2025-05-09 00:06:00] - Removed Internship Applicant 'show' page and fixed related tests in `InternshipCrudTest.php`.**
- **[2025-05-09 00:36:35] - Completed Logbook CRUD Pest Tests (Student Perspective) and refactored logbook field name from `kegiatan` to `activities`.**
- **[2025-05-09 01:04:37] - Completed Report CRUD Pest Tests (Student Perspective).**

## Current Focus Area

Fixing `GuidanceClassCrudTest` failure.

## Next Steps (After Documentation Update)

1.  **Testing:** Verify the fix for `GuidanceClassCrudTest`.
2.  **Testing:** Continue adding Pest tests for other core features (CRUD operations for Guidance, FAQs, Tutorials, Users, Settings, Admin functions).
3.  **Refinement:** Address any remaining `TODO` comments in the code. Improve UI/UX based on feedback. Optimize queries or backend logic where necessary.
4.  **TypeScript:** Continue improving type safety, potentially defining more specific types for shared data structures (e.g., `NotificationData`).

## Important Preferences

1.  Prioritize clear, maintainable code.
2.  Use TypeScript for frontend development.
3.  Follow Laravel best practices.
4.  Write comprehensive tests using Pest.
5.  Maintain accurate Memory Bank documentation.
6.  Use Indonesian for UI text.

## Insights & Learnings

- **Test-Driven Development:** Test failures often point directly to missing or incorrect business logic in controllers or services.
- **Authorization Specificity:** Ensuring correct ID usage (e.g., `internship_id` for overall internship context vs. `logbook_id` for specific entries) in backend authorization queries is crucial for proper data access control. This was particularly relevant when fixing 'dosen' access to logbooks, where initial queries might have been too broad or used incorrect identifiers, leading to access issues.
- **Modal Interactivity:** When implementing modals for actions like adding supervisor notes, ensure smooth data flow and state management between the modal and the parent page to reflect changes immediately.
- **Component Reusability:** The back button and animation patterns can be abstracted into reusable components or hooks for consistency across different pages.
