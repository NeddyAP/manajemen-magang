'use client';

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
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
    filter?: React.ReactNode;
    deleteRoute?: string;
    [key: string]: unknown;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    baseUrl = window.location.pathname,
    className,
    filter,
    deleteRoute,
    ...props
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [searchTerm, setSearchTerm] = React.useState<string>('');
    const [currentPage, setCurrentPage] = React.useState<number>(meta?.current_page || 1);
    const [pageSize, setPageSize] = React.useState<number>(meta?.per_page || 10);

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

    useEffect(() => {
        const queryParams = new URLSearchParams();

        if (debouncedSearchTerm) {
            queryParams.append('search', debouncedSearchTerm);
        }

        if (sorting.length > 0) {
            queryParams.append('sort_field', sorting[0].id);
            queryParams.append('sort_direction', sorting[0].desc ? 'desc' : 'asc');
        }

        queryParams.append('page', currentPage.toString());
        queryParams.append('per_page', pageSize.toString());

        columnFilters.forEach((filter) => {
            queryParams.append(`filter[${filter.id}]`, filter.value as string);
        });

        const url = `${baseUrl}?${queryParams.toString()}`;
        const timeoutId = setTimeout(() => {
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [debouncedSearchTerm, sorting, currentPage, pageSize, columnFilters, baseUrl]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="flex items-center gap-2 py-4">
                <div className="flex flex-1 items-center gap-2">
                    <Input placeholder="Search..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="max-w-sm" />
                    {filter}
                </div>
                <DataTableViewOptions table={table} />
            </div>

            {/* Selected rows counter and bulk delete button */}
            <div className="flex items-center justify-between py-2">
                {deleteRoute && table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete ${table.getFilteredSelectedRowModel().rows.length} selected items?`)) {
                                const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => {
                                    const original = row.original as { id: number | string };
                                    return original.id;
                                });

                                console.log('Deleting items with IDs:', selectedIds);
                                console.log('Delete route:', deleteRoute);

                                router.delete(deleteRoute, {
                                    data: { ids: selectedIds },
                                    onSuccess: () => {
                                        console.log('Bulk delete successful');
                                        setRowSelection({});
                                    },
                                    onError: (errors) => {
                                        console.error('Bulk delete failed:', errors);
                                        alert('Failed to delete selected items. Please try again.');
                                    },
                                });
                            }
                        }}
                    >
                        Delete Selected
                    </Button>
                )}
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
