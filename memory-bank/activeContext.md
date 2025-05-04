# Active Context

_This file tracks the current work focus, recent changes, immediate next steps, active decisions, important patterns/preferences discovered, and project insights._

**Status:** Active Development
**Last Reviewed:** May 4, 2025
**Current Task:** Update Memory Bank Documentation

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
4.  **Report Management:**
    *   Report submission (`reports` table) with file uploads.
    *   Visibility for students, assigned Dosen, and Admins.
5.  **Guidance System:**
    *   Class scheduling (`guidance_classes` table) by Admin/Dosen.
    *   Student assignment to classes.
    *   Attendance tracking (`guidance_class_attendance` table - basic structure).
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

## Recent Changes (Summary - Pre-Documentation Update)

*   Implementation of Notification system (backend logic, API endpoints, frontend UI/actions).
*   Refinement of Dosen access controls for viewing advisee data (Internships, Logbooks, Reports).
*   Addition of analytics/summary cards to various index pages.
*   Implementation of User Settings pages (Profile, Password, Appearance).
*   Implementation of Admin Trash Management feature.
*   **Addition of Pest Feature tests for Authentication flows (Registration, Login, Password Reset, Email Verification).**

## Current Focus Area

*   **Task:** Updating all Memory Bank documentation (`*.md` files in `memory-bank/`) to accurately reflect the current project state, including technology stack, features, patterns, and testing setup.

## Next Steps (After Documentation Update)

1.  **Testing:** Continue adding Pest tests for other core features (CRUD operations for Internships, Logbooks, Reports, Guidance Classes, FAQs, Tutorials, etc.). Aim for higher test coverage.
2.  **Guidance Class Attendance:** Implement QR code generation/scanning or a simpler check-in mechanism.
3.  **Dosen Feedback:** Add functionality for Dosen to add notes/feedback to Logbooks and Reports.
4.  **Refinement:** Address any remaining `TODO` comments in the code. Improve UI/UX based on feedback. Optimize queries or backend logic where necessary.
5.  **TypeScript:** Continue improving type safety, potentially defining more specific types for shared data structures (e.g., `NotificationData`).

## Important Preferences

1.  Prioritize clear, maintainable code.
2.  Use TypeScript for frontend development.
3.  Follow Laravel best practices.
4.  Write comprehensive tests using Pest.
5.  Maintain accurate Memory Bank documentation.
6.  Use Indonesian for UI text.
