import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Palette, Sun } from 'lucide-react'; // Added Palette
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    // Updated labels to Indonesian and added 'blue' theme
    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Terang' },
        { value: 'dark', icon: Moon, label: 'Gelap' },
        { value: 'blue', icon: Palette, label: 'Biru' },
        { value: 'system', icon: Monitor, label: 'Sistem' },
    ];

    return (
        <div className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800', className)} {...props}>
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                        // Adjusted active/inactive styles to potentially accommodate blue theme via CSS
                        appearance === value
                            ? 'bg-white shadow-xs data-[theme=blue]:bg-white data-[theme=blue]:text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100' // Added specific style hook for active blue
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black data-[theme=blue]:text-neutral-700 data-[theme=blue]:hover:bg-blue-100/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60', // Added specific style hook for inactive blue
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
