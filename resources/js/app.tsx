import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from './components/toast-provider';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ToastProvider />
            </>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Handle loading screen visibility with progress animation
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
let progress = 0;
let intervalId: number | null = null;

if (loader && progressBar && progressText) {
    // Start simulating progress
    intervalId = window.setInterval(() => {
        progress += Math.random() * 5; // Increment progress randomly
        if (progress >= 99) {
            progress = 99; // Cap at 99% until load event
            if (intervalId) clearInterval(intervalId);
        }
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Memuat... ${Math.floor(progress)}%`;
    }, 100); // Adjust interval timing as needed

    window.addEventListener('load', () => {
        // Ensure progress reaches 100% on load
        if (intervalId) clearInterval(intervalId); // Clear interval if still running
        progress = 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Memuat... ${Math.floor(progress)}%`;

        // Wait a moment to show 100% then hide
        setTimeout(() => {
            loader.classList.add('loader-hidden');
        }, 200); // Short delay before hiding
    });
} else {
    // Fallback for safety if elements aren't found
    window.addEventListener('load', () => {
        if (loader) {
            loader.classList.add('loader-hidden');
        }
    });
}
