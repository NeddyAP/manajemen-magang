import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutDashboard, LayoutGrid } from 'lucide-react';

interface ViewToggleProps {
    view: 'cards' | 'dashboard';
    onChange: (view: 'cards' | 'dashboard') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
    return (
        <div className="mb-6 flex justify-center">
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && onChange(value as 'cards' | 'dashboard')} variant="outline">
                <ToggleGroupItem value="cards" aria-label="Card View">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Tampilan Kartu
                </ToggleGroupItem>
                <ToggleGroupItem value="dashboard" aria-label="Dashboard View">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tampilan Dashboard
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}
