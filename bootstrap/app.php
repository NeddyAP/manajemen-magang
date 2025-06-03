<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandleViewPreference;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleViewPreference::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias(
            [
                'role' => RoleMiddleware::class,
                'permission' => PermissionMiddleware::class,
                'role_or_permission' => RoleOrPermissionMiddleware::class,
            ]

        );
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            $statusCode = $e->getStatusCode();

            // Handle known error codes with React components
            if (in_array($statusCode, [403, 404, 500, 503])) {
                $errorData = match ($statusCode) {
                    403 => [
                        'title' => '403 Akses Ditolak',
                        'messageTitle' => 'Akses Ditolak',
                        'message' => 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.',
                    ],
                    404 => [
                        'title' => '404 Tidak Ditemukan',
                        'messageTitle' => 'Halaman Tidak Ditemukan',
                        'message' => 'Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau alamat URL salah.',
                    ],
                    500 => [
                        'title' => '500 Kesalahan Server',
                        'messageTitle' => 'Kesalahan Server Internal',
                        'message' => 'Maaf, terjadi kesalahan pada server. Tim kami telah diberitahu dan sedang menangani masalah ini. Silakan coba lagi nanti.',
                    ],
                    503 => [
                        'title' => '503 Layanan Tidak Tersedia',
                        'messageTitle' => 'Layanan Sedang Dalam Pemeliharaan',
                        'message' => 'Layanan sedang dalam pemeliharaan untuk meningkatkan kualitas layanan. Silakan coba lagi dalam beberapa saat.',
                    ]
                };

                return response()->view('errors.react-error', [
                    'code' => $statusCode,
                    'title' => $errorData['title'],
                    'messageTitle' => $errorData['messageTitle'],
                    'message' => $errorData['message'],
                ], $statusCode);
            }

            return null; // Let Laravel handle other status codes normally
        });
    })->create();
