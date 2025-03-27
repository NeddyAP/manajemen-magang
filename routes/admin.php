<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\GlobalVariableController;
use App\Http\Controllers\Admin\GuidanceClassController;
use App\Http\Controllers\Admin\InternshipController;
use App\Http\Controllers\Admin\LogbookController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\TutorialController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::redirect('/dashboard', '/admin/dashboard');
Route::middleware(['auth', 'role:superadmin|admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/dashboard');

    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('internships', InternshipController::class)->except(['show', 'store', 'create']);
    Route::put('internships/{internship}/status', [InternshipController::class, 'updateStatus'])->name('internships.update-status');
    Route::put('internships/{internship}/progress', [InternshipController::class, 'updateProgress'])->name('internships.update-progress');
    Route::get('internships/{internship}/download', [InternshipController::class, 'downloadApplicationFile'])->name('internships.download');
    Route::delete('internships/bulk-destroy', [InternshipController::class, 'bulkDestroy'])->name('internships.destroy.bulk');

    Route::resource('logbooks', LogbookController::class);
    Route::resource('reports', ReportController::class);

    Route::resource('guidance-classes', GuidanceClassController::class);

    Route::resource('tutorials', TutorialController::class)->except(['show']);
    Route::post('tutorials/{tutorial}/toggle', [TutorialController::class, 'toggle'])->name('tutorials.toggle');
    Route::post('tutorials/bulk-destroy', [TutorialController::class, 'bulkDestroy'])->name('tutorials.destroy.bulk');

    // Users
    Route::resource('users', UserController::class);
    Route::delete('users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.destroy.bulk');

    // FAQS
    Route::resource('faqs', FaqController::class)->except(['show']);
    Route::post('faqs/{faq}/toggle', [FaqController::class, 'toggle'])->name('faqs.toggle');
    Route::post('faqs/bulk-destroy', [FaqController::class, 'bulkDestroy'])->name('faqs.destroy.bulk');

    // Global Variables
    Route::resource('global-variables', GlobalVariableController::class)->except(['show']);
    Route::post('global-variables/{globalVariable}/toggle', [GlobalVariableController::class, 'toggle'])->name('global-variables.toggle');
    Route::post('global-variables/bulk-destroy', [GlobalVariableController::class, 'bulkDestroy'])->name('global-variables.destroy.bulk');

    // Logbooks
    Route::resource('logbooks', LogbookController::class)->except(['create', 'store', 'edit', 'update']);
    Route::post('logbooks/bulk-destroy', [LogbookController::class, 'bulkDestroy'])->name('logbooks.destroy.bulk');
});

require __DIR__ . '/auth.php';
