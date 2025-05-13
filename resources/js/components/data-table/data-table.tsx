'use client';

import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, SortingState, useReactTable, VisibilityState } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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
    filters?: Array<{ id: string; value: string }>;
    deleteRoute?: string;
    initialColumnVisibility?: VisibilityState;
    searchPlaceholder?: string;
    [key: string]: unknown;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    baseUrl = window.location.pathname,
    className,
    filter,
    filters = [],
    deleteRoute,
    initialColumnVisibility = {},
    searchPlaceholder = 'Cari...',
    ...props
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility);
    const [rowSelection, setRowSelection] = React.useState({});
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(meta?.current_page || 1);
    const [pageSize, setPageSize] = useState<number>(meta?.per_page || 10);
    const isInitialMount = useRef(true);
    const pendingRequestRef = useRef<NodeJS.Timeout | null>(null);
    const previousUrlRef = useRef<string>('');
    const previousBaseUrlRef = useRef<string>(baseUrl);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Initialize search term from URL on mount
    useEffect(() => {
        const url = new URL(window.location.href);
        const search = url.searchParams.get('search');

        if (search) {
            setSearchTerm(search);
        }
    }, []);

    // Reset state when navigating between different pages
    useEffect(() => {
        // If baseUrl has changed, reset search state
        if (previousBaseUrlRef.current !== baseUrl) {
            // Clean up any pending requests
            if (pendingRequestRef.current) {
                clearTimeout(pendingRequestRef.current);
                pendingRequestRef.current = null;
            }

            // Reset search term, but only if URL doesn't have search parameter
            const url = new URL(window.location.href);
            const searchParam = url.searchParams.get('search');

            if (!searchParam) {
                setSearchTerm('');
            } else {
                setSearchTerm(searchParam);
            }

            // Reset column filters
            setColumnFilters([]);

            // Reset sorting state
            setSorting([]);

            // Reset page to 1 and keep url state updated
            setCurrentPage(meta?.current_page || 1);
            previousUrlRef.current = '';

            // Update the reference to prevent this from firing again
            previousBaseUrlRef.current = baseUrl;
        }
    }, [baseUrl, meta?.current_page]);

    // Increase debounce time for better performance
    const debouncedSearchTerm = useDebounce(searchTerm, 400);

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
        // Skip first render to prevent double loading
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Cancel any pending requests
        if (pendingRequestRef.current) {
            clearTimeout(pendingRequestRef.current);
            pendingRequestRef.current = null;
        }

        const queryParams = new URLSearchParams();

        // Only add search if it's not empty to avoid unnecessary parameters
        if (debouncedSearchTerm.trim()) {
            queryParams.append('search', debouncedSearchTerm.trim());
        }

        if (sorting.length > 0) {
            queryParams.append('sort_field', sorting[0].id);
            queryParams.append('sort_direction', sorting[0].desc ? 'desc' : 'asc');
        }

        queryParams.append('page', currentPage.toString());
        queryParams.append('per_page', pageSize.toString());

        // Add filter params from props
        filters.forEach((filter) => {
            if (filter.value) {
                queryParams.append(filter.id, filter.value);
            }
        });

        // Add column filters
        columnFilters.forEach((filter) => {
            queryParams.append(`filter[${filter.id}]`, filter.value as string);
        });

        const url = `${baseUrl}?${queryParams.toString()}`;

        // If the URL hasn't changed, don't make a new request
        if (previousUrlRef.current === url) {
            return;
        }

        previousUrlRef.current = url;

        // Schedule the router visit with a small delay to avoid multiple rapid requests
        pendingRequestRef.current = setTimeout(() => {
            // Get all Inertia page props that should be preserved during updates
            const inertiaPages = document.querySelector('#app')?.getAttribute('data-page');
            const pageData = inertiaPages ? JSON.parse(inertiaPages) : {};
            const only = ['meta', 'filters', 'errors'];

            // Extract the main data prop from the base URL
            // This makes the component more consistent across pages
            const urlPath = baseUrl.split('/').filter(Boolean);
            const lastPathSegment = urlPath[urlPath.length - 1];

            // Determine the data prop based on the URL - more predictable than checking page props
            if (lastPathSegment) {
                // Handle special cases for different sections
                if (lastPathSegment === 'guidance-classes') {
                    only.push('classes');
                } else {
                    // Convert to camelCase if needed (e.g., guidance-classes -> guidanceClasses)
                    const camelCaseProp = lastPathSegment.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    only.push(camelCaseProp);
                }

                // Also check if main data props exist in pageData.props as a fallback
                if (pageData.props) {
                    Object.keys(pageData.props).forEach((key) => {
                        // Check if it's likely a data collection (array) and not a utility prop
                        if (Array.isArray(pageData.props[key]) && key !== 'errors' && key !== 'flash' && !only.includes(key)) {
                            only.push(key);
                        }
                    });
                }
            }

            // Add common props that might be needed across different pages
            ['classes', 'guidanceClasses', 'logbooks', 'reports', 'internships', 'users', 'faqs', 'tutorials'].forEach((prop) => {
                if (pageData.props && pageData.props[prop] && !only.includes(prop)) {
                    only.push(prop);
                }
            });

            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: only,
            });
            pendingRequestRef.current = null;
        }, 200);

        // Clean up on unmount or when dependencies change
        return () => {
            if (pendingRequestRef.current) {
                clearTimeout(pendingRequestRef.current);
                pendingRequestRef.current = null;
            }
        };
    }, [debouncedSearchTerm, sorting, currentPage, pageSize, columnFilters, baseUrl, filters]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const clearSearch = () => {
        setSearchTerm('');
        // Focus the search input after clearing for better UX
        searchInputRef.current?.focus();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Clear search on Escape key
        if (e.key === 'Escape' && searchTerm) {
            e.preventDefault();
            clearSearch();
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 py-4">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="pr-8 pl-8"
                            ref={searchInputRef}
                        />
                        {searchTerm && (
                            <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground absolute top-2.5 right-2.5 h-4 w-4">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
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
                            if (confirm(`Apakah Anda yakin ingin menghapus ${table.getFilteredSelectedRowModel().rows.length} item yang dipilih?`)) {
                                const selectedIds = table.getFilteredSelectedRowModel().rows.map((row) => {
                                    const original = row.original as { id: number | string };
                                    return original.id;
                                });
                                router.delete(deleteRoute, {
                                    data: { ids: selectedIds },
                                    onSuccess: () => {
                                        setRowSelection({});
                                    },
                                    onError: (errors) => {
                                        console.error('Bulk delete failed:', errors);
                                        alert('Gagal menghapus item yang dipilih. Silakan coba lagi.');
                                    },
                                });
                            }
                        }}
                    >
                        Hapus yang Dipilih
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
                                    Tidak ada hasil.
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
