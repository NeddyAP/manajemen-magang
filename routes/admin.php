<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FaqController;
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

    Route::resource('internships', InternshipController::class);
    Route::resource('logbooks', LogbookController::class);
    Route::resource('reports', ReportController::class);

    Route::resource('guidance-classes', GuidanceClassController::class);

    Route::resource('tutorials', TutorialController::class);
    Route::resource('faqs', FaqController::class)->except(['show']);
    Route::post('faqs/{faq}/toggle', [FaqController::class, 'toggle'])->name('faqs.toggle');
    Route::post('faqs/bulk-destroy', [FaqController::class, 'bulkDestroy'])->name('faqs.destroy.bulk');

    Route::resource('users', UserController::class);
    Route::delete('users/bulk-destroy', [UserController::class, 'bulkDestroy'])->name('users.destroy.bulk');
});

require __DIR__ . '/auth.php';
