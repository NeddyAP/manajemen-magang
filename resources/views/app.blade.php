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

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        <link rel="shortcut icon" href="{{ asset('assets/logo.svg') }}">
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <style>
        .loader-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: oklch(1 0 0); /* Match light theme background */
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.5s ease-out, visibility 0.5s ease-out;
            opacity: 1;
            visibility: visible;
        }

        html.dark .loader-wrapper {
            background-color: oklch(0.145 0 0); /* Match dark theme background */
        }

        .progress-bar-container {
            width: 300px; /* Adjust width as needed */
            height: 20px; /* Adjust height as needed */
            background-color: oklch(0.9 0 0); /* Light grey background */
            border-radius: 10px;
            overflow: hidden;
            position: relative; /* Needed for percentage text positioning */
            margin-bottom: 10px; /* Space between bar and text */
        }

        html.dark .progress-bar-container {
             background-color: oklch(0.3 0 0); /* Darker grey background */
        }

        .progress-bar {
            width: 0%; /* Start at 0% */
            height: 100%;
            background-color: oklch(0.6 0.15 250); /* Accent color */
            border-radius: 10px;
            transition: width 0.1s linear; /* Smooth width transition */
        }

        .progress-text {
            font-size: 14px;
            color: oklch(0.3 0 0); /* Dark text color */
            text-align: center;
        }

         html.dark .progress-text {
             color: oklch(0.9 0 0); /* Light text color */
         }

        .loader-hidden {
            opacity: 0;
            visibility: hidden;
        }
    </style>
    <body class="font-sans antialiased">
        <div id="loader" class="loader-wrapper">
             {{-- Flex container to center progress bar and text vertically --}}
            <div style="display: flex; flex-direction: column; align-items: center;">
                <div class="progress-bar-container">
                    <div id="progress-bar" class="progress-bar"></div>
                </div>
                <div id="progress-text" class="progress-text">Memuat... 0%</div> {{-- Initial text --}}
            </div>
        </div>
        @inertia

    </body>
</html>
