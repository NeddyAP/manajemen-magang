<?php

use App\Http\Controllers\Front\GuidanceClassController;
use App\Http\Controllers\Front\InternshipApplicantController;
use App\Http\Controllers\Front\InternshipController;
use App\Http\Controllers\Front\LogbookController;
use App\Http\Controllers\Front\ReportController; // Import ReportController
use App\Http\Controllers\GuidanceClassAttendanceController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\TutorialController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/buku-panduan', [TutorialController::class, 'index'])->name('tutorials.index');

// Front Internship Routes
Route::middleware(['auth', 'verified'])->prefix('internships')->name('front.internships.')->group(function () {
    Route::get('/', [InternshipController::class, 'index'])->name('index');

    // Applicants routes
    Route::prefix('applicants')->name('applicants.')->group(function () {
        Route::get('/', [InternshipApplicantController::class, 'index'])->name('index');
        Route::get('/create', [InternshipApplicantController::class, 'create'])->name('create');
        Route::post('/', [InternshipApplicantController::class, 'store'])->name('store');
        Route::get('/{internship}', [InternshipApplicantController::class, 'show'])->name('show');
        Route::get('/{internship}/edit', [InternshipApplicantController::class, 'edit'])->name('edit');
        Route::put('/{internship}', [InternshipApplicantController::class, 'update'])->name('update');
        Route::delete('/{internship}', [InternshipApplicantController::class, 'destroy'])->name('destroy');
        Route::get('/{internship}/download', [InternshipApplicantController::class, 'downloadApplicationFile'])->name('download');

        // Add bulk destroy route
        Route::delete('/', [InternshipApplicantController::class, 'bulkDestroy'])->name('destroy.bulk');
    });

    // Logbook routes
    Route::middleware(['auth'])->group(function () {
        Route::get('/logbooks', [LogbookController::class, 'internList'])->name('logbooks.intern-list');
        Route::get('/logbooks/{internship}', [LogbookController::class, 'index'])->name('logbooks.index');
        Route::get('/logbooks/{internship}/create', [LogbookController::class, 'create'])->name('logbooks.create');
        Route::post('/logbooks/{internship}', [LogbookController::class, 'store'])->name('logbooks.store');
        Route::get('/logbooks/{internship}/{logbook}/edit', [LogbookController::class, 'edit'])->name('logbooks.edit');
        Route::put('/logbooks/{internship}/{logbook}', [LogbookController::class, 'update'])->name('logbooks.update');
        Route::delete('/logbooks/{internship}/{logbook}', [LogbookController::class, 'destroy'])->name('logbooks.destroy');
    });

    // Report routes
    Route::middleware(['auth'])->group(function () {
        Route::get('/reports', [ReportController::class, 'internList'])->name('reports.intern-list');
        Route::get('/reports/{internship}', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/{internship}/create', [ReportController::class, 'create'])->name('reports.create');
        Route::post('/reports/{internship}', [ReportController::class, 'store'])->name('reports.store');
        Route::get('/reports/{internship}/{report}/edit', [ReportController::class, 'edit'])->name('reports.edit');
        Route::put('/reports/{internship}/{report}', [ReportController::class, 'update'])->name('reports.update'); // Use PUT for updates
        Route::delete('/reports/{internship}/{report}', [ReportController::class, 'destroy'])->name('reports.destroy');
    });

    // Guidance Classes routes
    Route::middleware(['auth'])->group(function () {
        // all front Guidance Classes route here
        Route::get('/guidance-classes', [GuidanceClassController::class, 'index'])->name('guidance-classes.index');
        Route::get('/guidance-classes/create', [GuidanceClassController::class, 'create'])->name('guidance-classes.create');
        Route::post('/guidance-classes', [GuidanceClassController::class, 'store'])->name('guidance-classes.store');
        Route::get('/guidance-classes/{id}', [GuidanceClassController::class, 'show'])->name('guidance-classes.show');
        Route::get('/guidance-classes/{id}/edit', [GuidanceClassController::class, 'edit'])->name('guidance-classes.edit');
        Route::put('/guidance-classes/{id}', [GuidanceClassController::class, 'update'])->name('guidance-classes.update');
        Route::delete('/guidance-classes/{id}', [GuidanceClassController::class, 'destroy'])->name('guidance-classes.destroy');
        Route::post('/guidance-classes/{id}/generate-qr', [GuidanceClassController::class, 'generateQrCode'])->name('guidance-classes.generate-qr');
        Route::post('/guidance-classes/{classId}/attendance/{studentId}', [GuidanceClassController::class, 'markAttendance'])->name('guidance-classes.mark-attendance');
        Route::delete('/guidance-classes/{classId}/attendance/{studentId}', [GuidanceClassController::class, 'resetAttendance'])->name('guidance-classes.reset-attendance');
    });
});
// Guidance Class Attendance
Route::get('guidance-classes/attend/{token}', [GuidanceClassAttendanceController::class, 'attend'])
    ->middleware('auth')
    ->name('guidance-classes.attend');

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
