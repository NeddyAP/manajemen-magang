# Active Context

_This file tracks the current work focus, recent changes, immediate next steps, active decisions, important patterns/preferences discovered, and project insights._

**Status:** Active Development
**Last Reviewed:** May 2, 2025

## Project Overview

This is a comprehensive internship management system built with Laravel, focusing on managing internship programs (KKL/KKN) for educational institutions. The system handles the entire internship lifecycle from application to completion.

## Key Features

1. **User Management**

    - Multiple roles: admin, dosen (lecturer), mahasiswa (student)
    - Role-specific profiles and permissions
    - Authentication and authorization system

2. **Internship Management**

    - Two types: KKL and KKN
    - Application process with file uploads
    - Status tracking (waiting, accepted, rejected)
    - Progress monitoring

3. **Activity Tracking**

    - Daily logbook system
    - Activity reporting
    - Supervisor notes and feedback

4. **Report Management**

    - Version control for reports
    - Review process with approval states
    - File management for report submissions

5. **Guidance System**

    - Class scheduling and management
    - Attendance tracking with QR code
    - Student-lecturer interactions

6. **Support Systems**
    - FAQ management by categories
    - Tutorial system with role-based access
    - File storage for learning materials

## Technical Stack

- **Backend:** Laravel 12.x
- **Frontend:** React with TypeScript
- **UI Framework:** Custom components with Tailwind CSS
- **Database:** Supports multiple (configured for SQLite, MySQL/MariaDB)
- **File Storage:** Local disk with public accessibility
- **Authentication:** Laravel's built-in auth with Inertia.js
- **API Integration:** Inertia.js for seamless SPA experience

## Active Patterns

1. **Role-Based Access Control (RBAC)**

    - Using spatie/laravel-permission
    - Granular permission system
    - Role-specific interfaces

2. **Repository Pattern**

    - Organized model structure
    - Clear separation of concerns
    - Consistent data access patterns

3. **File Management**

    - Centralized storage configuration
    - Type-restricted uploads
    - Secure file access control

4. **Frontend Architecture**
    - Component-based UI development
    - Shared layouts and components
    - TypeScript for type safety
    - Use of `<Card>` for list items with actions.
    - Use of `<TooltipProvider>`, `<Tooltip>`, `<TooltipTrigger>`, `<TooltipContent>` for icon buttons.
    - Use of `<AlertDialog>` for confirmation dialogs.

## Recent Changes

- Modified `app/Http/Controllers/Front/InternshipApplicantController.php`:
    - Updated `index` method to display internships based on user role ('mahasiswa' sees own, 'dosen' sees advisees').
    - Adjusted analytics query to match the role-based data scope.
    - Updated `show` and `downloadApplicationFile` methods to allow 'dosen' access for their advisees.
    - Restricted `edit`, `update`, `destroy`, and `bulkDestroy` methods to prevent 'dosen' from modifying student applications via this controller.
- Modified `app/Http/Controllers/Front/LogbookController.php`:
    - Updated `index` and `internList` methods to allow 'dosen' to view logbooks/internship lists for their advisees.
    - Added authorization checks to ensure only the owner ('mahasiswa') can perform `create`, `store`, `edit`, `update`, `destroy` actions.
    - Corrected `internList` to use `withCount('logbooks')`.
- Modified `app/Http/Controllers/Front/ReportController.php`:
    - Updated `index` and `internList` methods to allow 'dosen' to view reports/internship lists for their advisees.
    - Added `downloadReportFile` method with authorization for owner, advisor ('dosen'), and admin.
    - Added authorization checks to ensure only the owner ('mahasiswa') can perform `create`, `store`, `edit`, `update`, `destroy` actions.
    - Corrected `internList` to use `withCount('reports')`.
- **Enhanced Notification System:**
    - **Header:** Fixed unread count badge display (`app-header.tsx`). Added link to notification history page.
    - **History Page:** Created a dedicated page (`/notifications` mapped to `front/notifications/index.tsx`) using `FrontLayout` to display all user notifications (paginated).
    - **Actions:** Implemented "Mark as Unread" and "Delete" actions on the notification history page.
        - Added API endpoints (`/api/notifications/mark-as-unread`, `/api/notifications/{id}`) and controller methods (`markAsUnread`, `destroy`) in `NotificationController`.
        - Added corresponding action handlers and UI elements (icon buttons with tooltips, delete confirmation dialog) in `front/notifications/index.tsx`.
    - **Links:** Corrected link generation in `ApplicationStatusChanged` notification to point to `front.internships.applicants.index`.
    - **Structure:** Moved notification frontend page to `resources/js/pages/front/notifications/index.tsx` (lowercase).

## Current Focus Areas

1. Implementing and maintaining core features
2. Ensuring data integrity and security
3. Optimizing user experience
4. Managing file uploads and storage
5. Maintaining documentation

## Next Steps

1.  **Testing:** Implement comprehensive tests for the notification system (backend dispatch, API, frontend display, actions: mark read/unread, delete).
2.  **Notification Links:** Review and potentially refine links generated by other notification types (Logbook, Report) to point to more specific resources if routes exist.
3.  **TypeScript:** Address remaining `any` type warnings, potentially by defining more specific types for `NotificationData`.
4.  **File Uploads:** Verify and potentially optimize file upload mechanisms across the application.
5.  **Validation:** Review and complete any missing validation rules.
6.  **Error Handling:** Enhance global and specific error handling.
7.  **Documentation:** Update API documentation for new notification endpoints (mark unread, delete).

## Important Preferences

1. Use TypeScript for frontend development
2. Follow Laravel best practices for backend
3. Maintain comprehensive documentation
4. Implement proper error handling
5. Ensure secure file management
