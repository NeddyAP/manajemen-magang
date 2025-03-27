<?php

use App\Http\Controllers\Front\InternshipApplicantController;
use App\Http\Controllers\Front\InternshipController;
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
});

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
