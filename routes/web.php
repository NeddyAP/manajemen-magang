<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\TutorialController;
use App\Http\Controllers\Front\InternshipController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/buku-panduan', [TutorialController::class, 'index'])->name('tutorials.index');

// Front Internship Routes
Route::middleware(['auth', 'verified'])->prefix('internships')->name('front.internships.')->group(function () {
    Route::get('/', [InternshipController::class, 'index'])->name('index');

    // Applicants routes
    Route::prefix('applicants')->name('applicants.')->group(function () {
        Route::get('/', [InternshipController::class, 'applicantsIndex'])->name('index');
        Route::get('/create', [InternshipController::class, 'create'])->name('create');
        Route::post('/', [InternshipController::class, 'store'])->name('store');
        Route::get('/{internship}', [InternshipController::class, 'show'])->name('show');
        Route::get('/{internship}/edit', [InternshipController::class, 'edit'])->name('edit');
        Route::put('/{internship}', [InternshipController::class, 'update'])->name('update');
        Route::delete('/{internship}', [InternshipController::class, 'destroy'])->name('destroy');
        Route::get('/{internship}/download', [InternshipController::class, 'downloadApplicationFile'])->name('download');

        // Add bulk destroy route
        Route::delete('/', [InternshipController::class, 'bulkDestroy'])->name('destroy.bulk');
    });
});

require __DIR__ . '/admin.php';
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
