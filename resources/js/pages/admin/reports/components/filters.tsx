import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';

interface FilterProps {
    label: string;
    value?: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
}

export function FilterPopover({ label, value, options, onChange }: FilterProps) {
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
                        <CommandEmpty>Tidak ada {label}.</CommandEmpty>
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
        { label: 'Menunggu', value: 'pending' },
        { label: 'Disetujui', value: 'approved' },
        { label: 'Ditolak', value: 'rejected' },
    ];

    return <FilterPopover label="Status" value={value} options={options} onChange={onChange} />;
}
