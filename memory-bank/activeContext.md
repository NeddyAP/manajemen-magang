# Active Context

_This file tracks the current work focus, recent changes, immediate next steps, active decisions, important patterns/preferences discovered, and project insights._

**Status:** Active Development
**Last Reviewed:** July 15, 2024
**Current Task:** Reviewing and updating Memory Bank. Preparing for frontend testing implementation.

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
    - Appearance (Light/Dark).
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

- **[2024-07-15] - Memory Bank Update:**
    - Conducted a comprehensive review of the codebase to update the memory bank with current application context.
    - Updated all memory bank files to reflect the current state of the project.
    - Identified empty frontend test directories that need implementation.
- **[2024-07-14] - Backend Test Verification:**
    - Verified all backend tests are passing with Pest PHP.
    - Identified areas where frontend testing is needed, particularly for auth components.
- **[2024-07-13] - Frontend Component Review:**
    - Reviewed React components, particularly in the auth pages directory.
    - Identified the need for frontend tests using Vitest and React Testing Library.
- **[2024-07-12] - Project Structure Analysis:**
    - Analyzed the overall project structure and architecture.
    - Documented the use of Laravel 12 with Spatie Laravel Permission for role-based access control.
    - Documented the use of React 19, TypeScript, and Tailwind CSS for the frontend.

## Active Context - July 15, 2024

### Current Work Focus

1.  Finalizing updates to all Memory Bank files to ensure consistency and reflect the latest project status.
2.  Preparing to implement frontend tests using Vitest and React Testing Library, starting with auth components.

### Recent Changes (Specifically last 24-48 hours)

- **Codebase Review (Completed):**
    - Conducted a thorough review of the codebase structure, focusing on both backend and frontend components.
    - Identified the use of Laravel 12 with Spatie Laravel Permission for role-based access control.
    - Documented the React 19 frontend with TypeScript and Tailwind CSS.
- **Memory Bank Update (In Progress):**
    - Currently updating all core memory bank files to reflect the current state of the project.
    - Documenting the empty frontend test directories that need implementation.
    - **Test Suite Status**: Backend tests using Pest PHP are passing, but frontend tests are not yet implemented.

### Next Steps

- **Development Task**: Implement frontend tests using Vitest and React Testing Library. This includes tests for:
    - Authentication components (login, register, password reset, email verification).
    - CRUD operations for core features (internships, logbooks, reports).
    - Search functionality.
    - Pagination.
    - Form validation.
    - Authorization checks.

### Active Decisions & Considerations

- **Frontend Testing Strategy**: Need to decide on the best approach for testing React components with Inertia.js integration. Vitest and React Testing Library are the chosen tools, but the implementation details need to be worked out.
- **Memory Bank Update Discipline**: Ensuring the memory bank is updated with the current state of the project is crucial for maintaining project context.

### Learnings & Project Insights

- **Comprehensive Backend Testing**: The project has a robust backend test suite using Pest PHP, which provides a good foundation for implementing frontend tests.
- **Role-Based Access Control**: The application has a well-implemented role-based access control system using Spatie Laravel Permission, with superadmin bypass implemented in AuthServiceProvider.
- **Modern Frontend Stack**: The frontend uses React 19 with TypeScript and Tailwind CSS, providing a good foundation for implementing modern frontend testing practices.

### Open Questions & Blockers

- How to effectively test Inertia.js components with Vitest and React Testing Library?
- What mocking strategies should be used for testing components that rely on backend data?

## Current Focus Area

Finalizing Memory Bank updates. Implementing frontend tests for auth components.

## Next Steps (After Documentation Update)

1.  **Testing:** Implement frontend tests using Vitest and React Testing Library for auth components.
2.  **Testing:** Expand frontend test coverage to other core features (CRUD operations, search, pagination).
3.  **Testing:** Continue adding backend tests for any missing functionality.
4.  **Refinement:** Address any remaining `TODO` comments in the code. Improve UI/UX based on feedback. Optimize queries or backend logic where necessary.
5.  **TypeScript:** Continue improving type safety, potentially defining more specific types for shared data structures.

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
