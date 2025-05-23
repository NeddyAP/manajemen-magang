import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';

interface FilterPopoverProps {
    label: string;
    value?: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
}

export function FilterPopover({ label, value, options, onChange }: FilterPopoverProps) {
    const [open, setOpen] = React.useState(false);
    const selectedOption = options.find((option) => option.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="h-8 w-[180px] justify-between border-dashed">
                    <span className="capitalize">{label}:</span>
                    {value ? (
                        <span className="ml-1 truncate font-medium">{selectedOption?.label}</span>
                    ) : (
                        <span className="text-muted-foreground ml-1 truncate">Semua</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Cari ${label}...`} />
                    <CommandList>
                        <CommandEmpty>Tidak ada {label} ditemukan.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    onChange('');
                                    setOpen(false);
                                }}
                                className="cursor-pointer"
                            >
                                <Check className={cn('mr-2 h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
                                <span>Semua</span>
                            </CommandItem>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                                    <span>{option.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface StatusFilterProps {
    value?: string;
    onChange: (value: string) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
    const options = [
        { label: 'Magang Aktif', value: 'active' },
        { label: 'Menunggu Persetujuan', value: 'waiting' },
        { label: 'Magang Selesai', value: 'completed' },
        { label: 'Perlu Review', value: 'pending_review' },
    ];

    return <FilterPopover label="status" value={value} options={options} onChange={onChange} />;
}

interface StatusSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
    return (
        <Select
            value={value || 'all'}
            onValueChange={(newValue) => {
                onChange(newValue === 'all' ? '' : newValue);
            }}
        >
            <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Semua Mahasiswa</SelectItem>
                <SelectItem value="active">Magang Aktif</SelectItem>
                <SelectItem value="waiting">Menunggu Persetujuan</SelectItem>
                <SelectItem value="completed">Magang Selesai</SelectItem>
                <SelectItem value="pending_review">Perlu Review</SelectItem>
            </SelectContent>
        </Select>
    );
}
