import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Palette, Sun } from 'lucide-react'; // Added Palette
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    // Updated labels to Indonesian and changed 'blue' to 'green' theme
    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Terang' },
        { value: 'dark', icon: Moon, label: 'Gelap' },
        { value: 'green', icon: Palette, label: 'Hijau' }, // Changed blue to green and label
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
                        // Adjusted active/inactive styles for green theme
                        appearance === value
                            ? 'bg-white shadow-xs data-[theme=green]:bg-teal-600 data-[theme=green]:text-white dark:bg-neutral-700 dark:text-neutral-100' // Updated active green styles
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black data-[theme=green]:text-neutral-700 data-[theme=green]:hover:bg-teal-100/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60', // Updated inactive green styles
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
