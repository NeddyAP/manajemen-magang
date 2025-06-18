# Ringkasan Rute Sistem Manajemen Magang

Dokumen ini berisi ringkasan lengkap semua rute yang tersedia dalam sistem manajemen magang Laravel. Rute dikategorikan berdasarkan fungsi dan tingkat akses pengguna.

## Daftar Isi

1. [Rute Utama (Web)](#rute-utama-web)
2. [Rute Autentikasi](#rute-autentikasi)
3. [Rute Admin](#rute-admin)
4. [Rute Pengaturan](#rute-pengaturan)
5. [Rute Konsol](#rute-konsol)

---

## Rute Utama (Web)
*File: [`routes/web.php`](routes/web.php)*

### Halaman Umum

| Metode | URI | Nama Rute | Controller | Akses |
|--------|-----|-----------|------------|-------|
| GET | `/` | `home` | [`HomeController@index`](app/Http/Controllers/HomeController.php) | Publik |
| GET | `/buku-panduan` | `tutorials.index` | [`TutorialController@index`](app/Http/Controllers/TutorialController.php) | Publik |

### Internship Management (Front)
*Middleware: `auth`, `verified`*
*Prefix: `/internships`*
*Nama: `front.internships.*`*

#### Internship Index
| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/internships` | `front.internships.index` | [`Front\InternshipController@index`](app/Http/Controllers/Front/InternshipController.php) | **Mahasiswa**: `internships.view` <br> **Dosen**: `internships.view` |

#### Aplikasi Magang (Applicants)
*Prefix: `/internships/applicants`*
*Nama: `front.internships.applicants.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/internships/applicants` | `front.internships.applicants.index` | [`Front\InternshipApplicantController@index`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.view` |
| GET | `/internships/applicants/create` | `front.internships.applicants.create` | [`Front\InternshipApplicantController@create`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.create` |
| POST | `/internships/applicants` | `front.internships.applicants.store` | [`Front\InternshipApplicantController@store`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.create` |
| GET | `/internships/applicants/{internship}/edit` | `front.internships.applicants.edit` | [`Front\InternshipApplicantController@edit`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.edit` |
| PUT | `/internships/applicants/{internship}` | `front.internships.applicants.update` | [`Front\InternshipApplicantController@update`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.edit` |
| DELETE | `/internships/applicants/{internship}` | `front.internships.applicants.destroy` | [`Front\InternshipApplicantController@destroy`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.edit` |
| GET | `/internships/applicants/{internship}/download` | `front.internships.applicants.download` | [`Front\InternshipApplicantController@downloadApplicationFile`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.view` |
| DELETE | `/internships/applicants` | `front.internships.applicants.destroy.bulk` | [`Front\InternshipApplicantController@bulkDestroy`](app/Http/Controllers/Front/InternshipApplicantController.php) | **Mahasiswa**: `internships.edit` |

#### Logbook Management
*Middleware: `auth`*
*Prefix: `/internships/logbooks`*
*Nama: `front.internships.logbooks.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/internships/logbooks` | `front.internships.logbooks.intern-list` | [`Front\LogbookController@internList`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.view` <br> **Dosen**: `logbooks.view` |
| GET | `/internships/logbooks/{internship}` | `front.internships.logbooks.index` | [`Front\LogbookController@index`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.view` <br> **Dosen**: `logbooks.view` |
| GET | `/internships/logbooks/{internship}/create` | `front.internships.logbooks.create` | [`Front\LogbookController@create`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.create` |
| POST | `/internships/logbooks/{internship}` | `front.internships.logbooks.store` | [`Front\LogbookController@store`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.create` |
| GET | `/internships/logbooks/{internship}/{logbook}/edit` | `front.internships.logbooks.edit` | [`Front\LogbookController@edit`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.edit` |
| PUT | `/internships/logbooks/{internship}/{logbook}` | `front.internships.logbooks.update` | [`Front\LogbookController@update`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.edit` |
| DELETE | `/internships/logbooks/{internship}/{logbook}` | `front.internships.logbooks.destroy` | [`Front\LogbookController@destroy`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.edit` |
| GET | `/internships/logbooks/{internship}/export-word` | `front.internships.logbooks.export.word` | [`Front\LogbookController@exportWord`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.view` <br> **Dosen**: `logbooks.view` |
| GET | `/internships/logbooks/{internship}/export-pdf` | `front.internships.logbooks.export.pdf` | [`Front\LogbookController@exportPdf`](app/Http/Controllers/Front/LogbookController.php) | **Mahasiswa**: `logbooks.view` <br> **Dosen**: `logbooks.view` |

#### Report Management
*Middleware: `auth`*
*Prefix: `/internships/reports`*
*Nama: `front.internships.reports.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/internships/reports` | `front.internships.reports.intern-list` | [`Front\ReportController@internList`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.view` <br> **Dosen**: `reports.view` |
| GET | `/internships/reports/{internship}` | `front.internships.reports.index` | [`Front\ReportController@index`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.view` <br> **Dosen**: `reports.view` |
| GET | `/internships/reports/{internship}/create` | `front.internships.reports.create` | [`Front\ReportController@create`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.create` |
| POST | `/internships/reports/{internship}` | `front.internships.reports.store` | [`Front\ReportController@store`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.create` |
| GET | `/internships/reports/{internship}/{report}/edit` | `front.internships.reports.edit` | [`Front\ReportController@edit`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.edit` |
| PUT | `/internships/reports/{internship}/{report}` | `front.internships.reports.update` | [`Front\ReportController@update`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.edit` |
| DELETE | `/internships/reports/{internship}/{report}` | `front.internships.reports.destroy` | [`Front\ReportController@destroy`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.delete` |
| GET | `/internships/reports/{internship}/{report}/download` | `front.internships.reports.download` | [`Front\ReportController@downloadReportFile`](app/Http/Controllers/Front/ReportController.php) | **Mahasiswa**: `reports.view` <br> **Dosen**: `reports.view` |
| POST | `/internships/reports/{internship}/{report}/approve` | `front.internships.reports.approve` | [`Front\ReportController@approve`](app/Http/Controllers/Front/ReportController.php) | **Dosen**: `reports.approve` |
| POST | `/internships/reports/{internship}/{report}/reject` | `front.internships.reports.reject` | [`Front\ReportController@reject`](app/Http/Controllers/Front/ReportController.php) | **Dosen**: `reports.reject` |
| POST | `/internships/reports/{internship}/{report}/upload-revision` | `front.internships.reports.uploadRevision` | [`Front\ReportController@uploadRevision`](app/Http/Controllers/Front/ReportController.php) | **Dosen**: `reports.comment` |

#### Guidance Classes (Kelas Bimbingan)
*Middleware: `auth`*
*Prefix: `/internships/guidance-classes`*
*Nama: `front.internships.guidance-classes.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/internships/guidance-classes` | `front.internships.guidance-classes.index` | [`Front\GuidanceClassController@index`](app/Http/Controllers/Front/GuidanceClassController.php) | **Mahasiswa**: `guidance-classes.view` <br> **Dosen**: `guidance-classes.view` |
| GET | `/internships/guidance-classes/create` | `front.internships.guidance-classes.create` | [`Front\GuidanceClassController@create`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.create` |
| POST | `/internships/guidance-classes` | `front.internships.guidance-classes.store` | [`Front\GuidanceClassController@store`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.create` |
| GET | `/internships/guidance-classes/{id}` | `front.internships.guidance-classes.show` | [`Front\GuidanceClassController@show`](app/Http/Controllers/Front/GuidanceClassController.php) | **Mahasiswa**: `guidance-classes.view` <br> **Dosen**: `guidance-classes.view` |
| GET | `/internships/guidance-classes/{id}/edit` | `front.internships.guidance-classes.edit` | [`Front\GuidanceClassController@edit`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.edit` |
| PUT | `/internships/guidance-classes/{id}` | `front.internships.guidance-classes.update` | [`Front\GuidanceClassController@update`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.edit` |
| DELETE | `/internships/guidance-classes/{id}` | `front.internships.guidance-classes.destroy` | [`Front\GuidanceClassController@destroy`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.delete` |
| POST | `/internships/guidance-classes/{id}/generate-qr` | `front.internships.guidance-classes.generate-qr` | [`Front\GuidanceClassController@generateQrCode`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.take_attendance` |
| POST | `/internships/guidance-classes/{classId}/attendance/{studentId}` | `front.internships.guidance-classes.mark-attendance` | [`Front\GuidanceClassController@markAttendance`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.take_attendance` |
| DELETE | `/internships/guidance-classes/{classId}/attendance/{studentId}` | `front.internships.guidance-classes.reset-attendance` | [`Front\GuidanceClassController@resetAttendance`](app/Http/Controllers/Front/GuidanceClassController.php) | **Dosen**: `guidance-classes.take_attendance` |

### Attendance via QR Code
| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/guidance-classes/attend/{token}` | `guidance-classes.attend` | [`GuidanceClassAttendanceController@attend`](app/Http/Controllers/GuidanceClassAttendanceController.php) | **Mahasiswa**: `guidance-classes.attend` |

### Notifikasi API
*Middleware: `auth`*
*Prefix: `/api`*
*Nama: `api.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/api/notifications` | `api.notifications.index` | [`NotificationController@index`](app/Http/Controllers/NotificationController.php) | Semua pengguna terautentikasi |
| POST | `/api/notifications/mark-as-read` | `api.notifications.markAsRead` | [`NotificationController@markAsRead`](app/Http/Controllers/NotificationController.php) | Semua pengguna terautentikasi |
| POST | `/api/notifications/mark-all-as-read` | `api.notifications.markAllAsRead` | [`NotificationController@markAllAsRead`](app/Http/Controllers/NotificationController.php) | Semua pengguna terautentikasi |
| POST | `/api/notifications/mark-as-unread` | `api.notifications.markAsUnread` | [`NotificationController@markAsUnread`](app/Http/Controllers/NotificationController.php) | Semua pengguna terautentikasi |
| DELETE | `/api/notifications/{id}` | `api.notifications.destroy` | [`NotificationController@destroy`](app/Http/Controllers/NotificationController.php) | Semua pengguna terautentikasi |

### Halaman Notifikasi
| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/notifications` | `notifications.index` | [`NotificationController@history`](app/Http/Controllers/NotificationController.php) | Semua pengguna terautentikasi & terverifikasi |

### Dashboard Dosen
| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/dosen/students-progress` | `dosen.students-progress` | [`Front\DosenDashboardController@studentsProgress`](app/Http/Controllers/Front/DosenDashboardController.php) | **Dosen**: Terautentikasi & terverifikasi |

---

## Rute Autentikasi
*File: [`routes/auth.php`](routes/auth.php)*

### Rute untuk Tamu (Guest Routes)
*Middleware: `guest`*

| Metode | URI | Nama Rute | Controller | Akses |
|--------|-----|-----------|------------|-------|
| GET | `/register` | `register` | [`Auth\RegisteredUserController@create`](app/Http/Controllers/Auth/RegisteredUserController.php) | Tamu |
| POST | `/register` | - | [`Auth\RegisteredUserController@store`](app/Http/Controllers/Auth/RegisteredUserController.php) | Tamu |
| GET | `/login` | `login` | [`Auth\AuthenticatedSessionController@create`](app/Http/Controllers/Auth/AuthenticatedSessionController.php) | Tamu |
| POST | `/login` | - | [`Auth\AuthenticatedSessionController@store`](app/Http/Controllers/Auth/AuthenticatedSessionController.php) | Tamu |
| GET | `/forgot-password` | `password.request` | [`Auth\PasswordResetLinkController@create`](app/Http/Controllers/Auth/PasswordResetLinkController.php) | Tamu |
| POST | `/forgot-password` | `password.email` | [`Auth\PasswordResetLinkController@store`](app/Http/Controllers/Auth/PasswordResetLinkController.php) | Tamu |
| GET | `/reset-password/{token}` | `password.reset` | [`Auth\NewPasswordController@create`](app/Http/Controllers/Auth/NewPasswordController.php) | Tamu |
| POST | `/reset-password` | `password.store` | [`Auth\NewPasswordController@store`](app/Http/Controllers/Auth/NewPasswordController.php) | Tamu |

### Google OAuth
*Middleware: `guest`*

| Metode | URI | Nama Rute | Controller | Akses |
|--------|-----|-----------|------------|-------|
| GET | `/auth/google/redirect` | `auth.google.redirect` | [`Auth\GoogleLoginController@redirect`](app/Http/Controllers/Auth/GoogleLoginController.php) | Tamu |
| GET | `/auth/google/callback` | `auth.google.callback` | [`Auth\GoogleLoginController@callback`](app/Http/Controllers/Auth/GoogleLoginController.php) | Tamu |

### Rute untuk Pengguna Terautentikasi
*Middleware: `auth`*

| Metode | URI | Nama Rute | Controller | Middleware Tambahan | Akses |
|--------|-----|-----------|------------|-------------------|-------|
| GET | `/verify-email` | `verification.notice` | [`EmailVerificationPromptController`](app/Http/Controllers/Auth/EmailVerificationPromptController.php) | - | Semua pengguna terautentikasi |
| GET | `/verify-email/{id}/{hash}` | `verification.verify` | [`VerifyEmailController`](app/Http/Controllers/Auth/VerifyEmailController.php) | `signed`, `throttle:6,1` | Semua pengguna terautentikasi |
| POST | `/email/verification-notification` | `verification.send` | [`EmailVerificationNotificationController@store`](app/Http/Controllers/Auth/EmailVerificationNotificationController.php) | `throttle:6,1` | Semua pengguna terautentikasi |
| GET | `/confirm-password` | `password.confirm` | [`ConfirmablePasswordController@show`](app/Http/Controllers/Auth/ConfirmablePasswordController.php) | - | Semua pengguna terautentikasi |
| POST | `/confirm-password` | - | [`ConfirmablePasswordController@store`](app/Http/Controllers/Auth/ConfirmablePasswordController.php) | - | Semua pengguna terautentikasi |
| POST | `/logout` | `logout` | [`Auth\AuthenticatedSessionController@destroy`](app/Http/Controllers/Auth/AuthenticatedSessionController.php) | - | Semua pengguna terautentikasi |

---

## Rute Admin
*File: [`routes/admin.php`](routes/admin.php)*

### Dashboard Admin
*Middleware: `auth`, `permission:admin.dashboard.view`*
*Prefix: `/admin`*
*Nama: `admin.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/dashboard` | - | Redirect ke `/admin/dashboard` | - |
| GET | `/admin/` | - | Redirect ke `/dashboard` | - |
| GET | `/admin/dashboard` | `admin.dashboard` | [`Admin\DashboardController`](app/Http/Controllers/Admin/DashboardController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |

### Manajemen Internship (Admin)
*Middleware: `permission:internships.view`*
*Prefix: `/admin/internships`*
*Nama: `admin.internships.*`*

| Metode | URI | Nama Rute | Controller | Middleware Tambahan | Akses Pengguna |
|--------|-----|-----------|------------|-------------------|-------|
| GET | `/admin/internships` | `admin.internships.index` | [`Admin\InternshipController@index`](app/Http/Controllers/Admin/InternshipController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `internships.view` |
| GET | `/admin/internships/{internship}/edit` | `admin.internships.edit` | [`Admin\InternshipController@edit`](app/Http/Controllers/Admin/InternshipController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `internships.view` |
| PUT | `/admin/internships/{internship}` | `admin.internships.update` | [`Admin\InternshipController@update`](app/Http/Controllers/Admin/InternshipController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `internships.view` |
| DELETE | `/admin/internships/{internship}` | `admin.internships.destroy` | [`Admin\InternshipController@destroy`](app/Http/Controllers/Admin/InternshipController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `internships.view` |
| GET | `/admin/internships/{internship}/download` | `admin.internships.download` | [`Admin\InternshipController@downloadApplicationFile`](app/Http/Controllers/Admin/InternshipController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `internships.view` |
| PUT | `/admin/internships/{internship}/status` | `admin.internships.update-status` | [`Admin\InternshipController@updateStatus`](app/Http/Controllers/Admin/InternshipController.php) | `permission:internships.approve` | **Superadmin**: Semua izin <br> **Admin**: `internships.approve` |
| PUT | `/admin/internships/{internship}/progress` | `admin.internships.update-progress` | [`Admin\InternshipController@updateProgress`](app/Http/Controllers/Admin/InternshipController.php) | `permission:internships.approve` | **Superadmin**: Semua izin <br> **Admin**: `internships.approve` |
| DELETE | `/admin/internships/bulk-destroy` | `admin.internships.destroy.bulk` | [`Admin\InternshipController@bulkDestroy`](app/Http/Controllers/Admin/InternshipController.php) | `permission:internships.delete` | **Superadmin**: Semua izin <br> **Admin**: `internships.delete` |

### Manajemen Logbook (Admin)
*Middleware: `permission:logbooks.view`*
*Prefix: `/admin/logbooks`*
*Nama: `admin.logbooks.*`*

| Metode | URI | Nama Rute | Controller | Middleware Tambahan | Akses Pengguna |
|--------|-----|-----------|------------|-------------------|-------|
| GET | `/admin/logbooks` | `admin.logbooks.index` | [`Admin\LogbookController@index`](app/Http/Controllers/Admin/LogbookController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `logbooks.view` |
| GET | `/admin/logbooks/{logbook}` | `admin.logbooks.show` | [`Admin\LogbookController@show`](app/Http/Controllers/Admin/LogbookController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `logbooks.view` |
| DELETE | `/admin/logbooks/{logbook}` | `admin.logbooks.destroy` | [`Admin\LogbookController@destroy`](app/Http/Controllers/Admin/LogbookController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `logbooks.view` |
| POST | `/admin/logbooks/bulk-destroy` | `admin.logbooks.destroy.bulk` | [`Admin\LogbookController@bulkDestroy`](app/Http/Controllers/Admin/LogbookController.php) | `permission:logbooks.delete` | **Superadmin**: Semua izin <br> **Admin**: `logbooks.delete` |

### Manajemen Report (Admin)
*Middleware: `permission:reports.view`*
*Prefix: `/admin/reports`*
*Nama: `admin.reports.*`*

| Metode | URI | Nama Rute | Controller | Middleware Tambahan | Akses Pengguna |
|--------|-----|-----------|------------|-------------------|-------|
| GET | `/admin/reports` | `admin.reports.index` | [`Admin\ReportController@index`](app/Http/Controllers/Admin/ReportController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `reports.view` |
| GET | `/admin/reports/{report}` | `admin.reports.show` | [`Admin\ReportController@show`](app/Http/Controllers/Admin/ReportController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `reports.view` |
| GET | `/admin/reports/{report}/edit` | `admin.reports.edit` | [`Admin\ReportController@edit`](app/Http/Controllers/Admin/ReportController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `reports.view` |
| PUT | `/admin/reports/{report}` | `admin.reports.update` | [`Admin\ReportController@update`](app/Http/Controllers/Admin/ReportController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `reports.view` |
| DELETE | `/admin/reports/{report}` | `admin.reports.destroy` | [`Admin\ReportController@destroy`](app/Http/Controllers/Admin/ReportController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `reports.view` |
| POST | `/admin/reports/bulk-destroy` | `admin.reports.destroy.bulk` | [`Admin\ReportController@bulkDestroy`](app/Http/Controllers/Admin/ReportController.php) | `permission:reports.delete` | **Superadmin**: Semua izin <br> **Admin**: `reports.delete` |

### Manajemen Guidance Classes (Admin)
*Middleware: `permission:guidance-classes.view`*
*Prefix: `/admin/guidance-classes`*
*Nama: `admin.guidance-classes.*`*

| Metode | URI | Nama Rute | Controller | Middleware Tambahan | Akses Pengguna |
|--------|-----|-----------|------------|-------------------|-------|
| GET | `/admin/guidance-classes` | `admin.guidance-classes.index` | [`Admin\GuidanceClassController@index`](app/Http/Controllers/Admin/GuidanceClassController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.view` |
| GET | `/admin/guidance-classes/create` | `admin.guidance-classes.create` | [`Admin\GuidanceClassController@create`](app/Http/Controllers/Admin/GuidanceClassController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.view` |
| POST | `/admin/guidance-classes` | `admin.guidance-classes.store` | [`Admin\GuidanceClassController@store`](app/Http/Controllers/Admin/GuidanceClassController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.view` |
| GET | `/admin/guidance-classes/{guidance_class}` | `admin.guidance-classes.show` | [`Admin\GuidanceClassController@show`](app/Http/Controllers/Admin/GuidanceClassController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.view` |
| GET | `/admin/guidance-classes/{guidance_class}/edit` | `admin.guidance-classes.edit` | [`Admin\GuidanceClassController@edit`](app/Http/Controllers/Admin/GuidanceClassController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.view` |
| PUT | `/admin/guidance-classes/{guidance_class}` | `admin.guidance-classes.update` | [`Admin\GuidanceClassController@update`](app/Http/Controllers/Admin/GuidanceClassController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.view` |
| DELETE | `/admin/guidance-classes/{guidance_class}` | `admin.guidance-classes.destroy` | [`Admin\GuidanceClassController@destroy`](app/Http/Controllers/Admin/GuidanceClassController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.view` |
| POST | `/admin/guidance-classes/bulk-destroy` | `admin.guidance-classes.destroy.bulk` | [`Admin\GuidanceClassController@bulkDestroy`](app/Http/Controllers/Admin/GuidanceClassController.php) | `permission:guidance-classes.delete` | **Superadmin**: Semua izin <br> **Admin**: `guidance-classes.delete` |

### Manajemen Tutorial (Admin)
*Middleware: `permission:admin.dashboard.view`*
*Prefix: `/admin/tutorials`*
*Nama: `admin.tutorials.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/admin/tutorials` | `admin.tutorials.index` | [`Admin\TutorialController@index`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| GET | `/admin/tutorials/create` | `admin.tutorials.create` | [`Admin\TutorialController@create`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| POST | `/admin/tutorials` | `admin.tutorials.store` | [`Admin\TutorialController@store`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| GET | `/admin/tutorials/{tutorial}/edit` | `admin.tutorials.edit` | [`Admin\TutorialController@edit`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| PUT | `/admin/tutorials/{tutorial}` | `admin.tutorials.update` | [`Admin\TutorialController@update`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| DELETE | `/admin/tutorials/{tutorial}` | `admin.tutorials.destroy` | [`Admin\TutorialController@destroy`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| POST | `/admin/tutorials/{tutorial}/toggle` | `admin.tutorials.toggle` | [`Admin\TutorialController@toggle`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| POST | `/admin/tutorials/bulk-destroy` | `admin.tutorials.destroy.bulk` | [`Admin\TutorialController@bulkDestroy`](app/Http/Controllers/Admin/TutorialController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |

### Manajemen User (Admin)
*Middleware: `permission:users.view`*
*Prefix: `/admin/users`*
*Nama: `admin.users.*`*

| Metode | URI | Nama Rute | Controller | Middleware Tambahan | Akses Pengguna |
|--------|-----|-----------|------------|-------------------|-------|
| GET | `/admin/users` | `admin.users.index` | [`Admin\UserController@index`](app/Http/Controllers/Admin/UserController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `users.view` |
| GET | `/admin/users/create` | `admin.users.create` | [`Admin\UserController@create`](app/Http/Controllers/Admin/UserController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `users.view` |
| POST | `/admin/users` | `admin.users.store` | [`Admin\UserController@store`](app/Http/Controllers/Admin/UserController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `users.view` |
| GET | `/admin/users/{user}` | `admin.users.show` | [`Admin\UserController@show`](app/Http/Controllers/Admin/UserController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `users.view` |
| GET | `/admin/users/{user}/edit` | `admin.users.edit` | [`Admin\UserController@edit`](app/Http/Controllers/Admin/UserController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `users.view` |
| PUT | `/admin/users/{user}` | `admin.users.update` | [`Admin\UserController@update`](app/Http/Controllers/Admin/UserController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `users.view` |
| DELETE | `/admin/users/{user}` | `admin.users.destroy` | [`Admin\UserController@destroy`](app/Http/Controllers/Admin/UserController.php) | - | **Superadmin**: Semua izin <br> **Admin**: `users.view` |
| POST | `/admin/users/bulk-destroy` | `admin.users.destroy.bulk` | [`Admin\UserController@bulkDestroy`](app/Http/Controllers/Admin/UserController.php) | `permission:users.delete` | **Superadmin**: Semua izin <br> **Admin**: `users.delete` |

### Manajemen FAQ (Admin)
*Middleware: `permission:admin.dashboard.view`*
*Prefix: `/admin/faqs`*
*Nama: `admin.faqs.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/admin/faqs` | `admin.faqs.index` | [`Admin\FaqController@index`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| GET | `/admin/faqs/create` | `admin.faqs.create` | [`Admin\FaqController@create`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| POST | `/admin/faqs` | `admin.faqs.store` | [`Admin\FaqController@store`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| GET | `/admin/faqs/{faq}/edit` | `admin.faqs.edit` | [`Admin\FaqController@edit`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| PUT | `/admin/faqs/{faq}` | `admin.faqs.update` | [`Admin\FaqController@update`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| DELETE | `/admin/faqs/{faq}` | `admin.faqs.destroy` | [`Admin\FaqController@destroy`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| POST | `/admin/faqs/{faq}/toggle` | `admin.faqs.toggle` | [`Admin\FaqController@toggle`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| POST | `/admin/faqs/bulk-destroy` | `admin.faqs.destroy.bulk` | [`Admin\FaqController@bulkDestroy`](app/Http/Controllers/Admin/FaqController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |

### Manajemen Global Variables (Admin)
*Middleware: `permission:admin.settings.edit`*
*Prefix: `/admin/global-variables`*
*Nama: `admin.global-variables.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/admin/global-variables` | `admin.global-variables.index` | [`Admin\GlobalVariableController@index`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |
| GET | `/admin/global-variables/create` | `admin.global-variables.create` | [`Admin\GlobalVariableController@create`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |
| POST | `/admin/global-variables` | `admin.global-variables.store` | [`Admin\GlobalVariableController@store`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |
| GET | `/admin/global-variables/{global_variable}/edit` | `admin.global-variables.edit` | [`Admin\GlobalVariableController@edit`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |
| PUT | `/admin/global-variables/{global_variable}` | `admin.global-variables.update` | [`Admin\GlobalVariableController@update`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |
| DELETE | `/admin/global-variables/{global_variable}` | `admin.global-variables.destroy` | [`Admin\GlobalVariableController@destroy`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |
| POST | `/admin/global-variables/{globalVariable}/toggle` | `admin.global-variables.toggle` | [`Admin\GlobalVariableController@toggle`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |
| POST | `/admin/global-variables/bulk-destroy` | `admin.global-variables.destroy.bulk` | [`Admin\GlobalVariableController@bulkDestroy`](app/Http/Controllers/Admin/GlobalVariableController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.settings.edit` |

### Manajemen Trash (Admin)
*Middleware: `permission:admin.dashboard.view`*
*Prefix: `/admin/trash`*
*Nama: `admin.trash.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/admin/trash` | `admin.trash.index` | [`Admin\TrashController@index`](app/Http/Controllers/Admin/TrashController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| POST | `/admin/trash/{type}/{id}/restore` | `admin.trash.restore` | [`Admin\TrashController@restore`](app/Http/Controllers/Admin/TrashController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |
| DELETE | `/admin/trash/{type}/{id}/force-delete` | `admin.trash.force-delete` | [`Admin\TrashController@forceDelete`](app/Http/Controllers/Admin/TrashController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.dashboard.view` |

### Analytics API (Admin)
*Middleware: `auth`, `permission:admin.analytics.view`*
*Prefix: `/analytics`*
*Nama: `admin.analytics.*`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/analytics/internship-stats` | `admin.analytics.internship-stats` | [`Admin\AnalyticsController@getInternshipStats`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/student-performance` | `admin.analytics.student-performance` | [`Admin\AnalyticsController@getStudentPerformance`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/system-usage` | `admin.analytics.system-usage` | [`Admin\AnalyticsController@getSystemUsage`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/logbook-summary` | `admin.analytics.logbook-summary` | [`Admin\AnalyticsController@getLogbookSummary`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/report-summary` | `admin.analytics.report-summary` | [`Admin\AnalyticsController@getReportSummary`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/guidance-class-stats` | `admin.analytics.guidance-class-stats` | [`Admin\AnalyticsController@getGuidanceClassStats`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/tutorial-stats` | `admin.analytics.tutorial-stats` | [`Admin\AnalyticsController@getTutorialStats`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/user-stats` | `admin.analytics.user-stats` | [`Admin\AnalyticsController@getUserStats`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/faq-stats` | `admin.analytics.faq-stats` | [`Admin\AnalyticsController@getFaqStats`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/global-variable-stats` | `admin.analytics.global-variable-stats` | [`Admin\AnalyticsController@getGlobalVariableStats`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |
| GET | `/analytics/trash-stats` | `admin.analytics.trash-stats` | [`Admin\AnalyticsController@getTrashStats`](app/Http/Controllers/Admin/AnalyticsController.php) | **Superadmin**: Semua izin <br> **Admin**: `admin.analytics.view` |

---

## Rute Pengaturan
*File: [`routes/settings.php`](routes/settings.php)*

*Middleware: `auth`*

| Metode | URI | Nama Rute | Controller | Akses Pengguna |
|--------|-----|-----------|------------|-------|
| GET | `/settings` | - | Redirect ke `/settings/profile` | Semua pengguna terautentikasi |
| GET | `/settings/profile` | `profile.edit` | [`Settings\ProfileController@edit`](app/Http/Controllers/Settings/ProfileController.php) | Semua pengguna terautentikasi |
| PATCH | `/settings/profile` | `profile.update` | [`Settings\ProfileController@update`](app/Http/Controllers/Settings/ProfileController.php) | Semua pengguna terautentikasi |
| DELETE | `/settings/profile` | `profile.destroy` | [`Settings\ProfileController@destroy`](app/Http/Controllers/Settings/ProfileController.php) | Semua pengguna terautentikasi |
| GET | `/settings/password` | `password.edit` | [`Settings\PasswordController@edit`](app/Http/Controllers/Settings/PasswordController.php) | Semua pengguna terautentikasi |
| PUT | `/settings/password` | `password.update` | [`Settings\PasswordController@update`](app/Http/Controllers/Settings/PasswordController.php) | Semua pengguna terautentikasi |
| GET | `/settings/appearance` | `appearance` | [`Settings\ProfileController@appearance`](app/Http/Controllers/Settings/ProfileController.php) | Semua pengguna terautentikasi |
| POST | `/settings/profile/link-google` | `profile.link-google` | [`Settings\ProfileController@linkGoogleAccount`](app/Http/Controllers/Settings/ProfileController.php) | Semua pengguna terautentikasi |


---

## Ringkasan Permissions Berdasarkan Role

### **Superadmin**
- **Akses**: Semua permissions (bypass)
- **Deskripsi**: Akses tak terbatas ke seluruh sistem

### **Admin**
- **internships.view**, **internships.approve**, **internships.reject**
- **logbooks.view**, **logbooks.add_notes**
- **reports.view**, **reports.approve**, **reports.reject**, **reports.comment**
- **guidance-classes.view**, **guidance-classes.create**, **guidance-classes.edit**, **guidance-classes.delete**
- **users.create**, **users.view**, **users.edit**, **users.delete**, **users.assign_role**
- **admin.dashboard.view**, **admin.settings.edit**, **admin.analytics.view**

### **Dosen**
- **internships.view**, **internships.approve**, **internships.reject**
- **logbooks.view**, **logbooks.add_notes**
- **reports.view**, **reports.approve**, **reports.reject**, **reports.comment**
- **guidance-classes.create**, **guidance-classes.view**, **guidance-classes.edit**, **guidance-classes.delete**, **guidance-classes.take_attendance**

### **Mahasiswa**
- **internships.create**, **internships.view**, **internships.edit**
- **logbooks.create**, **logbooks.view**, **logbooks.edit**
- **reports.create**, **reports.view**, **reports.edit**, **reports.delete**
- **guidance-classes.view**, **guidance-classes.attend**

---

## Catatan Penting

1. **Sistem Role-Based Access Control (RBAC)**: Menggunakan Spatie Laravel Permission
2. **Middleware Berlapis**: Beberapa rute memiliki multiple middleware untuk keamanan berlapis
3. **Bulk Operations**: Tersedia operasi bulk delete untuk efisiensi
4. **File Handling**: Rute khusus untuk download dan upload file
5. **API Endpoints**: Beberapa rute menggunakan prefix `/api` untuk operasi AJAX
6. **QR Code Integration**: Sistem attendance menggunakan QR code dengan token
7. **Google OAuth**: Integrasi dengan Google untuk autentikasi dan account linking
8. **Superadmin Bypass**: Role superadmin memiliki akses bypass ke semua permissions
9. **Permission-Based Access**: Setiap aksi dibatasi oleh permission spesifik berdasarkan role pengguna
10. **Indonesian UI**: Semua teks antarmuka menggunakan bahasa Indonesia

Sistem ini dirancang dengan keamanan berlapis dan kontrol akses yang ketat berdasarkan role dan permission pengguna sesuai dengan definisi di [`RolePermissionSeeder.php`](database/seeders/RolePermissionSeeder.php).