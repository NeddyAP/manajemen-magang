<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\GlobalVariableController;
use App\Http\Controllers\Admin\GuidanceClassController;
use App\Http\Controllers\Admin\InternshipController;
use App\Http\Controllers\Admin\LogbookController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\TrashController;
use App\Http\Controllers\Admin\TutorialController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::redirect('/dashboard', '/admin/dashboard');
Route::middleware(['auth', 'role:superadmin|admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::redirect('/', '/dashboard');

    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('internships', InternshipController::class)->except(['show', 'store', 'create']);
    Route::put('internships/{internship}/status', [InternshipController::class, 'updateStatus'])->name('internships.update-status');
    Route::put('internships/{internship}/progress', [InternshipController::class, 'updateProgress'])->name('internships.update-progress');
    Route::get('internships/{internship}/download', [InternshipController::class, 'downloadApplicationFile'])->name('internships.download');
    Route::delete('internships/bulk-destroy', [InternshipController::class, 'bulkDestroy'])->name('internships.destroy.bulk');

    // Logbooks
    Route::resource('logbooks', LogbookController::class)->except(['create', 'store', 'edit', 'update']);
    Route::post('logbooks/bulk-destroy', [LogbookController::class, 'bulkDestroy'])->name('logbooks.destroy.bulk');

    // Reports
    Route::resource('reports', ReportController::class)->except(['create', 'store']);
    Route::post('reports/bulk-destroy', [ReportController::class, 'bulkDestroy'])->name('reports.destroy.bulk');

    // Guidance Classes
    Route::resource('guidance-classes', GuidanceClassController::class);
    Route::post('guidance-classes/bulk-destroy', [GuidanceClassController::class, 'bulkDestroy'])->name('guidance-classes.destroy.bulk');

    Route::resource('tutorials', TutorialController::class)->except(['show']);
    Route::post('tutorials/{tutorial}/toggle', [TutorialController::class, 'toggle'])->name('tutorials.toggle');
    Route::post('tutorials/bulk-destroy', [TutorialController::class, 'bulkDestroy'])->name('tutorials.destroy.bulk');

    // Users
    Route::resource('users', UserController::class);
    Route::post('users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.destroy.bulk');

    // FAQS
    Route::resource('faqs', FaqController::class)->except(['show']);
    Route::post('faqs/{faq}/toggle', [FaqController::class, 'toggle'])->name('faqs.toggle');
    Route::post('faqs/bulk-destroy', [FaqController::class, 'bulkDestroy'])->name('faqs.destroy.bulk');

    // Global Variables
    Route::resource('global-variables', GlobalVariableController::class)->except(['show']);
    Route::post('global-variables/{globalVariable}/toggle', [GlobalVariableController::class, 'toggle'])->name('global-variables.toggle');
    Route::post('global-variables/bulk-destroy', [GlobalVariableController::class, 'bulkDestroy'])->name('global-variables.destroy.bulk');

    // Trash
    Route::get('/trash', [TrashController::class, 'index'])->name('trash.index');
    Route::post('/trash/{type}/{id}/restore', [TrashController::class, 'restore'])->name('trash.restore');
    Route::delete('/trash/{type}/{id}/force-delete', [TrashController::class, 'forceDelete'])->name('trash.force-delete');
});

require __DIR__.'/auth.php';

use App\Http\Controllers\Admin\AnalyticsController;

// Analytics Routes
Route::middleware(['auth', 'role:superadmin|admin'])->prefix('analytics')->name('admin.analytics.')->group(function (): void {
    Route::get('/internship-stats', [AnalyticsController::class, 'getInternshipStats'])->name('internship-stats');
    Route::get('/student-performance', [AnalyticsController::class, 'getStudentPerformance'])->name('student-performance');
    Route::get('/system-usage', [AnalyticsController::class, 'getSystemUsage'])->name('system-usage');

    // New routes for specific sections
    Route::get('/logbook-summary', [AnalyticsController::class, 'getLogbookSummary'])->name('logbook-summary');
    Route::get('/report-summary', [AnalyticsController::class, 'getReportSummary'])->name('report-summary');
    Route::get('/guidance-class-stats', [AnalyticsController::class, 'getGuidanceClassStats'])->name('guidance-class-stats');
    Route::get('/tutorial-stats', [AnalyticsController::class, 'getTutorialStats'])->name('tutorial-stats');
    Route::get('/user-stats', [AnalyticsController::class, 'getUserStats'])->name('user-stats');
    Route::get('/faq-stats', [AnalyticsController::class, 'getFaqStats'])->name('faq-stats');
    Route::get('/global-variable-stats', [AnalyticsController::class, 'getGlobalVariableStats'])->name('global-variable-stats');
    Route::get('/trash-stats', [AnalyticsController::class, 'getTrashStats'])->name('trash-stats');
});
