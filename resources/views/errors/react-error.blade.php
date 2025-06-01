<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title>{{ $title ?? 'Error' }} - {{ config('app.name', 'Manajemen Magang') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        <link rel="shortcut icon" href="{{ asset('assets/logo.svg') }}">
        
        @viteReactRefresh
        @vite(['resources/js/error.tsx'])
    </head>
    <body class="font-sans antialiased">
        <div id="error-app"></div>
        
        {{-- Pass error data to React --}}
        <script>
            window.errorProps = {
                code: '{{ $code }}',
                title: '{{ $title }}', 
                messageTitle: '{{ $messageTitle }}',
                message: `{{ $message }}`
            };
        </script>
    </body>
</html>