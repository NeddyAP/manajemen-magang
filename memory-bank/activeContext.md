# Active Context

_This file tracks the current work focus, recent changes, immediate next steps, active decisions, important patterns/preferences discovered, and project insights._

**Status:** Active Development
**Last Reviewed:** May 13, 2025
**Current Task:** Reviewing and updating Memory Bank. Preparing for next testing cycle (Settings pages).

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
10. **Global Variable Management (Admin):**
    - Global value to make some part is dynamicly adjustable.
11. **Testing:**
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
    - TypeScript for type safety (`resources/js/types/`).
    - Shadcn UI components (`resources/js/components/ui/`) heavily used.
    - Inertia forms (`useForm`) for data submission and validation error handling.
    - `sonner` for toast notifications.
    - `<AlertDialog>` for confirmations (e.g., delete actions).
    - `<TooltipProvider>` for icon button hints.
5.  **Routing:** Laravel routes defined in `routes/`. Ziggy used to share routes with the frontend. Inertia handles frontend routing.
6.  **Validation:** Laravel Form Requests used extensively for backend validation. Frontend displays errors provided by Inertia.
7.  **Testing:** Pest PHP for Feature tests. Focus on testing behavior through HTTP requests. Use of `RefreshDatabase` trait with SQLite `:memory:`. Factory helpers for data setup.
8.  **UI Text:** Use Indonesian language for user-facing labels, buttons, messages. Fallback to English if translation is awkward or unclear.

## Recent Changes (Consolidated - Reflecting last ~week, see progress.md for more detail)

- **[2025-05-13] - User CRUD Tests & Memory Bank Update:**
    - Verified existing Admin User CRUD tests (`tests/Feature/Admin/UserCrudTest.php`) are comprehensive and passing.
    - Removed redundant `tests/Feature/AdminUserCrudTest.php` file.
    - Updated `activeContext.md` and `progress.md` to reflect these changes.
- **[2025-05-13] - Test Suite Refinement & Memory Bank Synchronization:**
    - Successfully refactored `FrontSearchTest.php` from Pest to a PHPUnit class-based structure to resolve test failures and improve clarity.
    - Updated `AdminSearchTest.php` with class name changes, `use Tests\TestCase;`, and corrected URLs.
    - Verified all 192 tests are passing.
    - Completed and verified Pest feature tests for FAQ and Tutorial CRUD operations.
    - Updated `activeContext.md` and `progress.md` to reflect the latest test completions, refactoring, and consolidated recent changes.
- **[2025-05-12] - Guidance System Enhancement:**
    - Fixed an issue in `GuidanceClassController@store` to ensure automatic attachment of eligible students and creation of attendance records when a new guidance class is created.
- **[2025-05-11] - Reporting Feature Enhancement:**
    - Implemented functionality for Dosen to upload revised student reports.
    - Added comprehensive Pest feature tests for the report revision upload feature.

## Active Context - May 13, 2025

### Current Work Focus

1.  Finalizing updates to all Memory Bank files to ensure consistency and reflect the latest project status.
2.  Preparing to start the next development task: "Write Pest tests for Settings pages (all roles)".

### Recent Changes (Specifically last 24-48 hours)

- **User CRUD Tests Verification & Cleanup (Completed):**
    - Identified and ran existing `tests/Feature/Admin/UserCrudTest.php`. All 12 tests passed.
    - Removed the newly generated (and now redundant) `tests/Feature/AdminUserCrudTest.php`.
- **Memory Bank Update (In Progress):**
    - Consolidated "Recent Changes" in `progress.md`.
    - Currently reviewing and updating all core memory bank files (`activeContext.md`, `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`).
    - **Test Suite Status**: All 192 tests (including the 12 User CRUD tests) are confirmed passing after the modifications and cleanup.

### Next Steps

- **Development Task (Completed):** Write Pest tests for User CRUD operations (Admin).
    - Admin can view list of users. - ✅
    - Admin can view a single user. - ✅
    - Admin can create a new user (student, admin, dosen) with appropriate roles and profiles. - ✅
    - Admin can edit an existing user's details, roles, and profile. - ✅
    - Admin can delete a user. - ✅
    - Validation for user creation and updates. - ✅ (Covered in existing tests)
    - Authorization checks (only admin can perform these actions). - ✅ (Covered in existing tests)
- **Development Task**: Write Pest tests for Settings pages (all roles). This includes tests for:
    - Each role (admin, dosen, mahasiswa) can view their respective settings page.
    - Users can update their profile information.
    - Users can change their password.
    - Users can update appearance settings.
    - Validation for profile and password updates.
    - Authorization checks (users can only update their own settings).

### Active Decisions & Considerations

- **Test Structure Standardization**: The conversion of `FrontSearchTest.php` to PHPUnit was done to resolve persistent test failures and to align its structure with other class-based feature tests like `AdminSearchTest.php`. This suggests a preference for PHPUnit's class-based approach for more complex feature tests if Pest syntax leads to issues.
- **Memory Bank Update Discipline**: Ensuring the memory bank is updated after significant changes (like major test refactoring) is crucial for maintaining project context.

### Learnings & Project Insights

- **Robust Test Suite**: A comprehensive and consistently passing test suite is vital for confident refactoring and development. The recent fixes highlight the importance of this.
- **Test Framework Flexibility**: While Pest offers a concise syntax, PHPUnit's traditional class structure provided a clearer path to resolving issues in `FrontSearchTest.php`. Being able to switch or adapt testing styles as needed is beneficial.
- **URL Accuracy in Tests**: Incorrect URLs were a source of test failures in `AdminSearchTest.php`. Double-checking route names and parameters in tests is essential.

### Open Questions & Blockers

- None at present. The path is clear for the next development task.

## Current Focus Area

Finalizing Memory Bank updates. Expanding Pest test coverage to Settings pages.

## Next Steps (After Documentation Update)

1.  **Testing:** Write Pest tests for Settings pages (all roles).
2.  **Testing:** Continue adding Pest tests for other core features (e.g., Dosen-specific interactions, Mahasiswa view flows).
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
