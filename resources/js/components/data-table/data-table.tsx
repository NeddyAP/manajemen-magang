'use client';

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { router } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { DataTableViewOptions } from './column-visibility';
import { DataTablePagination } from './data-table-pagination';

interface TableMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    meta?: TableMeta;
    className?: string;
    baseUrl?: string;
    [key: string]: unknown;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    baseUrl = window.location.pathname,
    className,
    ...props
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [currentPage, setCurrentPage] = React.useState<number>(meta?.current_page || 1);
    const [pageSize, setPageSize] = React.useState<number>(meta?.per_page || 10);
    const [isNavigating, setIsNavigating] = React.useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const table = useReactTable({
        data,
        columns,
        pageCount: meta?.last_page || -1,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: currentPage - 1,
                pageSize,
            },
        },
    });

    // Navigate to new URL when filters/pagination/sorting change
    useEffect(() => {
        // Prevent initial navigation on component mount
        if (isNavigating === false) {
            setIsNavigating(true);
            return;
        }

        const queryParams = new URLSearchParams();

        // Add search term if exists
        if (debouncedSearchTerm) {
            queryParams.append('search', debouncedSearchTerm);
        }

        // Add sorting if exists
        if (sorting.length > 0) {
            queryParams.append('sort_field', sorting[0].id);
            queryParams.append('sort_direction', sorting[0].desc ? 'desc' : 'asc');
        }

        // Add pagination params
        queryParams.append('page', currentPage.toString());
        queryParams.append('per_page', pageSize.toString());

        // Append filters
        columnFilters.forEach((filter) => {
            queryParams.append(`filter[${filter.id}]`, filter.value as string);
        });

        // Navigate
        const url = `${baseUrl}?${queryParams.toString()}`;
        // Use a timeout to avoid rapid consecutive requests
        const timeoutId = setTimeout(() => {
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [debouncedSearchTerm, sorting, currentPage, pageSize, columnFilters, baseUrl]);

    // Custom pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    return (
        <div>
            <div className="flex items-center py-4">
                <Input placeholder="Search..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="max-w-sm" />
                <DataTableViewOptions table={table} />
            </div>
            <div className={`rounded-md border ${className}`} {...props}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="items-center space-x-2 py-4">
                <DataTablePagination
                    table={table}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    currentPage={currentPage}
                    totalPages={meta?.last_page || 1}
                />
            </div>
        </div>
    );
}
