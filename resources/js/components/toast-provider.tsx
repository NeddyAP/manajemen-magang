import { Toaster } from 'sonner';

export function ToastProvider() {
    return (
        <Toaster position='top-right'
            toastOptions={{
                style: {
                    border: '2px solid',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                },
                classNames: {
                    toast: 'group',
                    title: 'font-medium text-sm',
                    description: 'text-sm',
                    success: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400',
                    error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
                    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
                    info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
                },
            }} />
    );
}
