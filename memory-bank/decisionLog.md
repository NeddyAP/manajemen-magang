# Decision Log

This document records significant architectural and project decisions, their rationale, and implications.

[2025-05-11] - Soft Delete Migration Strategy
Decision: Apply soft deletes to individual table migrations rather than using a single consolidated migration file.
Rationale: This approach keeps the history of each table's schema changes, including the addition of soft delete capability, within its original migration file. It makes it easier to understand the evolution of a specific table. The consolidated migration (`2025_03_22_091458_add_soft_deletes_to_all_tables.php`) was deemed less clear for tracking individual table changes and was therefore deleted after its logic was merged into the respective original migration files.
Implications: `softDeletes()` was added to the `up()` method and `dropSoftDeletes()` to the `down()` method of migrations for tables like `users`, `admin_profiles`, `dosen_profiles`, `faqs`, `global_variables`, `guidance_classes`, `internships`, `logbooks`, `mahasiswa_profiles`, `reports`, `tutorials`. This ensures that soft delete functionality is consistently applied and version-controlled with each table.

[2025-05-11] - Logbook Export Functionality Confirmation
Decision: Confirmed existing backend logic for exporting logbooks to Word (.docx) and PDF formats is functional and updated routes for consistency.
Rationale: The application had existing controller methods (`LogbookController@exportWord`, `LogbookController@exportPdf`) for this purpose. The primary action was to verify their continued functionality and align the routes in `routes/web.php` (e.g., `logbooks.export.word`, `logbooks.export.pdf`) with frontend naming conventions and ensure they are correctly invoked.
Implications: Students can download their logbooks in these formats. No new libraries were added as `phpoffice/phpword` and `barryvdh/laravel-dompdf` were already project dependencies.

[2025-05-08 18:55:19] - Dosen Feedback for Reports: Current Implementation Review
Decision: Confirmed that Dosen feedback on reports is partially implemented.
Rationale: The system allows Dosen/Admins to add 'reviewer_notes' when rejecting a student's report. This note is visible to the student.
Implications: While this covers feedback in a rejection scenario, a more general mechanism for Dosen to provide ongoing or non-rejection-related feedback on reports is not yet present and remains a potential future enhancement. The existing `reviewer_notes` field in the `reports` table and associated UI in `ReportActionsCell` ([`resources/js/pages/front/internships/reports/components/column.tsx`](resources/js/pages/front/internships/reports/components/column.tsx:109-143)) and display in `column.tsx` ([`resources/js/pages/front/internships/reports/components/column.tsx`](resources/js/pages/front/internships/reports/components/column.tsx:270-272)) serve this specific purpose.

[2025-05-08 19:02:45] - Guidance Class Attendance Feature: Implementation Review
Decision: Confirmed that the Guidance Class attendance feature is substantially implemented.
Rationale: The system now supports QR code-based attendance (Dosen/Admin generate a unique URL rendered as a QR code; students scan this URL with their device to record attendance) and manual attendance marking by Dosen. This functionality is supported by backend logic in `GuidanceClassAttendanceController` ([`app/Http/Controllers/GuidanceClassAttendanceController.php`](app/Http/Controllers/GuidanceClassAttendanceController.php:1)) and `GuidanceClassController` ([`app/Http/Controllers/Admin/GuidanceClassController.php`](app/Http/Controllers/Admin/GuidanceClassController.php:1) and [`app/Http/Controllers/Front/GuidanceClassController.php`](app/Http/Controllers/Front/GuidanceClassController.php:1)), updates to the `GuidanceClassAttendance` ([`app/Models/GuidanceClassAttendance.php`](app/Models/GuidanceClassAttendance.php:1)) and `GuidanceClass` ([`app/Models/GuidanceClass.php`](app/Models/GuidanceClass.php:1)) models, and corresponding frontend UI components for QR code display and manual management by Dosen (e.g., in `resources/js/pages/front/internships/guidance-classes/components/manage-attendance.tsx`). The `qrcode.react` library is used for QR rendering.
Implications: This fulfills a key planned feature, moving it from 'pending' to 'implemented'. Future enhancements could involve direct in-app QR scanning if desired, but the current URL-based QR method is functional.

[2025-05-09 00:06:00] - Removal of Internship Applicant 'show' Page
Decision: The Internship Applicant 'show' page and its associated route and functionalities were removed.
Rationale: User feedback indicated that a dedicated 'show' page for individual internship applicants was unnecessary. The primary interaction points are the application listing/index and the edit/update functionalities. Simplifying the user flow was prioritized.
Implications: This reduces the number of views and routes to maintain. The `show.tsx` file for applicants was deleted, the 'show' route was removed from `routes/web.php`, and tests in `InternshipCrudTest.php` were updated to reflect this change (e.g., redirecting to index after certain actions instead of show).

[2025-05-09 00:06:00] - Fix for Failing Test: `mahasiswa can update their own internship with valid data if editable`
Decision: Investigated and fixed the failing test `mahasiswa can update their own internship with valid data if editable` in `tests/Feature/InternshipCrudTest.php`.
Rationale: The test was failing due to an incorrect redirect target in the `update` method of the `InternshipApplicantController.php`. After a successful update, the controller was attempting to redirect to a 'show' route that no longer existed (due to the decision above).
Resolution: The redirect in `app/Http/Controllers/Front/InternshipApplicantController.php` was changed from `route('front.internships.applicants.show', $internship->id)` to `route('front.internships.index')`.
Implications: All tests within `InternshipCrudTest.php` are now passing, ensuring the stability of the internship application update functionality for students.

[2025-05-09 00:36:35] - Logbook Field Name Refactoring: `kegiatan` to `activities`
Decision: Reverted the logbook field name for activities from `kegiatan` back to `activities`.
Rationale: To maintain consistency and keep database column names in English. The field was temporarily named `kegiatan` during development.
Implications: This change was applied to the database migration ([`database/migrations/2025_03_19_093218_create_logbooks_table.php`](database/migrations/2025_03_19_093218_create_logbooks_table.php)), model ([`app/Models/Logbook.php`](app/Models/Logbook.php)), factory ([`database/factories/LogbookFactory.php`](database/factories/LogbookFactory.php)), form requests ([`app/Http/Requests/StoreLogbookRequest.php`](app/Http/Requests/StoreLogbookRequest.php), [`app/Http/Requests/UpdateLogbookRequest.php`](app/Http/Requests/UpdateLogbookRequest.php)), controller ([`app/Http/Controllers/Front/LogbookController.php`](app/Http/Controllers/Front/LogbookController.php)), and associated tests ([`tests/Feature/Front/LogbookCrudTest.php`](tests/Feature/Front/LogbookCrudTest.php)). This ensures clarity and aligns with project conventions.

[2025-05-09 01:05:04] - Decision: Added `mahasiswa`, `admin`, `dosen` states to `UserFactory` for easier role-based user creation in tests.
Rationale: Required for testing features specific to user roles.

[2025-05-09 01:05:04] - Decision: Corrected `Internship` factory usage in `ReportCrudTest` to use `user_id` instead of non-existent `mahasiswa_profile_id`.
Rationale: Align tests with the actual `internships` table schema.

[2025-05-09 01:05:04] - Decision: Updated `Internship` status in `ReportCrudTest` setup from 'active' to 'accepted'.
Rationale: Align tests with the valid enum values defined in the `internships` migration.

[2025-05-09 01:05:04] - Decision: Confirmed `reports` table schema uses `report_file` (not `file_path`) and statuses `pending`, `approved`, `rejected`.
Rationale: Correct database schema understanding is crucial for tests and factory definitions.

[2025-05-09 01:05:04] - Decision: Updated `StoreReportRequest` and `UpdateReportRequest` to include authorization logic and validation rules based on the actual `reports` table schema (only `title`, `report_file`).
Rationale: Form requests must reflect the actual data expected and required.

[2025-05-09 01:05:04] - Decision: Updated `ReportFactory` to define default values for required fields (`user_id`, `internship_id`, `title`, `report_file`, `status`, `version`) based on the migration.
Rationale: Ensure factory creates valid model instances for testing.

[2025-05-09 01:05:04] - Decision: Removed non-existent fields (`report_type`, `content`, `report_date`) from test data and assertions in `ReportCrudTest`.
Rationale: Align tests with the actual `reports` table schema.

[2025-05-09 01:05:04] - Decision: Refactored `ReportCrudTest` to use `test()` function format `test('[Actor Role] [can/cannot] [Action] [Subject] [Condition]')` for consistency with other test files.
Rationale: Improve test readability and maintainability.
