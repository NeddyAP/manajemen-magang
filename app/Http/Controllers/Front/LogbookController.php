<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLogbookRequest;
use App\Http\Requests\UpdateLogbookRequest;
use App\Models\DosenProfile;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\MahasiswaProfile;
use App\Notifications\Logbook\EntrySubmitted;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;

class LogbookController extends Controller
{
    public function index(Request $request, Internship $internship)
    {
        $this->authorizeAccess($internship);

        $query = $internship->logbooks();

        // Handle search with comprehensive capabilities
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = trim($request->search);

            $query->where(function ($q) use ($searchTerm): void {
                // Search in logbook content fields
                $q->where('activities', 'like', "%{$searchTerm}%")
                    ->orWhere('supervisor_notes', 'like', "%{$searchTerm}%");

                // Search by date with multiple format support
                if (preg_match('/^\d{4}(-\d{2})?$/', $searchTerm)) {
                    if (strlen($searchTerm) === 4) { // Year only
                        $q->orWhereRaw('YEAR(date) = ?', [$searchTerm])
                            ->orWhereRaw('YEAR(created_at) = ?', [$searchTerm]);
                    } else { // Year-month
                        $q->orWhereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$searchTerm])
                            ->orWhereRaw("DATE_FORMAT(created_at, '%Y-%m') = ?", [$searchTerm]);
                    }
                }

                // Try to parse as a date string and search
                try {
                    $date = Carbon::parse($searchTerm);
                    $formattedDate = $date->format('Y-m-d');
                    $q->orWhereDate('date', $formattedDate)
                        ->orWhereDate('created_at', $formattedDate);
                } catch (Exception $e) {
                    // Not a valid date format, skip this search condition
                }

                // Search by hours worked if numeric
                if (is_numeric($searchTerm)) {
                    $q->orWhere('hours_worked', $searchTerm);
                }
            });
        }

        // Handle filtering with enhanced options
        if ($request->has('filter')) {
            foreach ($request->filter as $column => $value) {
                if (! empty($value)) {
                    if ($column === 'date_range') {
                        // Handle date range filtering if present in format 'start_date,end_date'
                        $dates = explode(',', $value);
                        if (count($dates) === 2) {
                            if (isset($dates[0]) && ($dates[0] !== '' && $dates[0] !== '0')) {
                                $query->whereDate('date', '>=', $dates[0]);
                            }
                            if (isset($dates[1]) && ($dates[1] !== '' && $dates[1] !== '0')) {
                                $query->whereDate('date', '<=', $dates[1]);
                            }
                        }
                    } elseif ($column === 'has_notes') {
                        // Filter for entries with or without supervisor notes
                        if ($value === 'true') {
                            $query->whereNotNull('supervisor_notes')
                                ->where('supervisor_notes', '!=', '');
                        } elseif ($value === 'false') {
                            $query->where(function ($q): void {
                                $q->whereNull('supervisor_notes')
                                    ->orWhere('supervisor_notes', '=', '');
                            });
                        }
                    } else {
                        // Default filtering
                        $query->where($column, 'like', "%{$value}%");
                    }
                }
            }
        }

        // Handle sorting with improved field mapping
        if ($request->has('sort_field') && ! empty($request->sort_field)) {
            $sortField = $request->sort_field;
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';

            // Map frontend field names to database field names
            $sortMapping = [
                'date' => 'date',
                'activities' => 'activities',
                'supervisor_notes' => 'supervisor_notes',
                'created_at' => 'created_at',
                'updated_at' => 'updated_at',
            ];

            if (isset($sortMapping[$sortField])) {
                $query->orderBy($sortMapping[$sortField], $direction);
            } else {
                $query->latest('date'); // Default sort by date descending
            }
        } else {
            $query->latest('date'); // Default sort by date descending
        }

        // Get total count before pagination/filtering for analytics
        $totalLogbookCount = $internship->logbooks()->count();

        // Get analytics data including total hours worked
        $analyticsData = $internship->logbooks()
            ->select(
                DB::raw('COUNT(*) as total_entries'),
                DB::raw('COUNT(DISTINCT DATE(date)) as unique_days')
            )
            ->first();

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $logbooks = $query->paginate($perPage)->withQueryString();

        return Inertia::render('front/internships/logbooks/index', [
            'internship' => $internship->load('user:id,name'), // Load user for context
            'logbooks' => $logbooks->items(),
            'totalLogbookCount' => $totalLogbookCount, // Pass total count
            'analytics' => [
                'totalEntries' => $analyticsData->total_entries ?? 0,
                'totalHours' => $analyticsData->total_hours ?? 0,
                'avgHoursPerEntry' => round($analyticsData->avg_hours_per_entry ?? 0, 1),
                'uniqueDays' => $analyticsData->unique_days ?? 0,
            ],
            'meta' => [
                'total' => $logbooks->total(),
                'per_page' => $logbooks->perPage(),
                'current_page' => $logbooks->currentPage(),
                'last_page' => $logbooks->lastPage(),
            ],
            'filters' => $request->only(['search', 'filter', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function create(Internship $internship)
    {
        // Check if user can create logbooks and if internship is accepted
        $this->authorize('create', Logbook::class);
        abort_if($internship->status !== 'accepted', 403, 'Internship must be accepted to create logbooks.');

        return Inertia::render('front/internships/logbooks/create', [
            'internship' => $internship,
        ]);
    }

    public function store(StoreLogbookRequest $request, Internship $internship)
    {
        // Check if user can create logbooks and if internship is accepted
        $this->authorize('create', Logbook::class);
        abort_if($internship->status !== 'accepted', 403, 'Internship must be accepted to create logbooks.');

        $validated = $request->validated();

        // Associate logbook with the internship owner (student)
        $validated['user_id'] = $internship->user_id;

        $logbook = $internship->logbooks()->create($validated);

        // Notify the advisor (Dosen)
        $student = $internship->user->load('mahasiswaProfile.advisor'); // Load profile and advisor
        $advisor = $student->mahasiswaProfile?->advisor;

        if ($advisor) {
            $advisor->notify(new EntrySubmitted($logbook));
        }

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil ditambahkan');
    }

    public function edit(Internship $internship, Logbook $logbook)
    {
        // Ensure the logbook belongs to the internship
        abort_if($logbook->internship_id !== $internship->id, 404, 'Logbook not found for this internship.');

        $user = auth()->user();

        // Check if user is a dosen who can only update supervisor_notes
        if ($user->hasRole('dosen')) {
            // Use the specific policy method for dosen updating supervisor notes
            $this->authorize('updateSupervisorNotes', $logbook);
        } else {
            // For other users, check regular update permission
            $this->authorize('update', $logbook);
        }

        return Inertia::render('front/internships/logbooks/edit', [
            'internship' => $internship,
            'logbook' => $logbook,
        ]);
    }

    public function update(UpdateLogbookRequest $request, Internship $internship, Logbook $logbook)
    {
        // Ensure the logbook belongs to the internship
        abort_if($logbook->internship_id !== $internship->id, 404, 'Logbook not found for this internship.');

        $user = auth()->user();
        $validated = $request->validated();

        // Check if user is a dosen who can only update supervisor_notes
        if ($user->hasRole('dosen')) {
            // Use the specific policy method for dosen updating supervisor notes
            $this->authorize('updateSupervisorNotes', $logbook);

            // Only allow updating supervisor_notes field
            $validated = ['supervisor_notes' => $request->input('supervisor_notes', '')];
        } else {
            // For other users, check regular update permission
            $this->authorize('update', $logbook);

            // For mahasiswa, remove supervisor_notes from validated data to prevent them from updating it
            if ($user->hasRole('mahasiswa')) {
                unset($validated['supervisor_notes']);
            }
        }

        $logbook->update($validated);

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil diperbarui');
    }

    public function destroy(Internship $internship, Logbook $logbook)
    {
        abort_if($logbook->internship_id !== $internship->id, 404);

        $this->authorize('delete', $logbook);

        $logbook->delete();

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil dihapus');
    }

    public function exportWord(Internship $internship)
    {
        $this->authorizeAccess($internship);
        $internship->load('user:id,name'); // Ensure user is loaded
        $logbooks = $internship->logbooks()->orderBy('date', 'asc')->get();
        $studentName = $internship->user->name;

        $phpWord = new PhpWord;
        // $phpWord->getSettings()->setUpdateFields(true); // Not needed if no ToC or fields

        // Minimal section setup
        $section = $phpWord->addSection();

        // Define table style for the whole table, including header
        $tableStyleSettings = ['borderSize' => 6, 'borderColor' => '000000', 'cellMargin' => 80];
        $phpWord->addTableStyle('LogbookTable', $tableStyleSettings, ['bgColor' => 'E9E9E9']); // Header style part of table style

        $table = $section->addTable('LogbookTable');

        $headerCellStyle = ['bgColor' => 'E9E9E9']; // Lighter header, though can be part of addTableStyle's second param
        $headerFontStyle = ['bold' => true, 'size' => 10];
        $cellFontStyle = ['size' => 10];
        $cellStyle = ['valign' => 'top']; // Align text to top for cells

        // Add header row
        $table->addRow(); // No specific height for header row
        $table->addCell(2000, $headerCellStyle)->addText('Tanggal', $headerFontStyle);
        $table->addCell(8000, $headerCellStyle)->addText('Rincian Kegiatan', $headerFontStyle);

        // Add data rows
        if ($logbooks->isEmpty()) {
            $table->addRow();
            // Apply basic cell style for the "no data" message, ensuring it spans and is centered
            $noDataCellStyle = ['gridSpan' => 2, 'valign' => 'center'] + $cellStyle;
            $table->addCell(10000, $noDataCellStyle)->addText('Tidak ada data logbook.', $cellFontStyle, ['alignment' => Jc::CENTER]);
        } else {
            foreach ($logbooks as $logbook) {
                $table->addRow();
                $dateText = isset($logbook->date) ? Carbon::parse($logbook->date)->translatedFormat('d M Y') : 'N/A';
                $table->addCell(2000, $cellStyle)->addText($dateText, $cellFontStyle);
                $table->addCell(8000, $cellStyle)->addText($logbook->activities ?? '', $cellFontStyle);
            }
        }

        $filename = 'Logbook_Table_'.str_replace([' ', '/'], '_', $studentName).'_'.$internship->id.'.docx';

        ob_clean(); // Clean output buffer before sending headers

        header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        header('Cache-Control: max-age=0');

        $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
        $objWriter->save('php://output');
        exit;
    }

    public function exportPdf(Internship $internship)
    {
        $this->authorizeAccess($internship);
        $internship->load('user:id,name'); // Ensure user is loaded
        $logbooks = $internship->logbooks()->orderBy('date', 'asc')->get();
        $studentName = $internship->user->name;

        $data = [
            'internship' => $internship,
            'logbooks' => $logbooks,
            'studentName' => $studentName,
            'title' => 'Logbook Magang - '.$studentName,
        ];

        // The view 'pdf.logbook_export' needs to be created in resources/views/pdf/
        // Example content for the view is provided in the thought process.
        try {
            $pdf = Pdf::loadView('pdf.logbook_export', $data);
            $filename = 'Logbook_'.str_replace([' ', '/'], '_', $studentName).'_'.$internship->id.'.pdf';

            return $pdf->download($filename);
        } catch (Exception $e) {
            // Log the error for debugging
            Log::error('PDF Export Error: '.$e->getMessage().' for internship '.$internship->id);

            // Return a user-friendly error response
            // Consider a redirect back with an error message or an error view
            return response('Gagal membuat PDF. Silakan coba lagi nanti atau hubungi administrator. Error: '.$e->getMessage(), 500);
        }
    }

    public function internList(Request $request)
    {
        $user = Auth::user();
        $query = Internship::query()->where('status', 'accepted');
        $search = $request->input('search'); // Get search term

        if ($user->hasRole('dosen')) {
            $dosenProfile = DosenProfile::where('user_id', $user->id)->first();
            if ($dosenProfile) {
                $adviseeUserIds = MahasiswaProfile::where('advisor_id', $dosenProfile->user_id)
                    ->pluck('user_id')
                    ->toArray();
                $query->whereIn('user_id', $adviseeUserIds);

                // Apply search if term exists
                if ($search) {
                    $query->whereHas('user', function ($userQuery) use ($search): void {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhereHas('mahasiswaProfile', function ($profileQuery) use ($search): void {
                                $profileQuery->where('student_number', 'like', "%{$search}%");
                            });
                    });
                }
            } else {
                $query->whereRaw('1 = 0'); // No advisees, show nothing
            }
        } elseif ($user->hasRole('mahasiswa')) {
            $query->where('user_id', $user->id);
        } else {
            $query->whereRaw('1 = 0'); // Other roles see nothing here
        }

        // Eager load user details and count logbooks
        $internships = $query->with(['user:id,name']) // Load user name
            ->withCount('logbooks') // Count related logbooks
            ->get();

        return Inertia::render('front/internships/logbooks/intern-list', [
            'internships' => $internships, // This will now include 'logbooks_count' attribute
            'filters' => ['search' => $search], // Pass search term back to view
        ]);
    }

    private function authorizeAccess(Internship $internship)
    {
        // Check if user has permission to view logbooks
        if (! Auth::user()->can('logbooks.view')) {
            abort(403, 'You do not have permission to view logbooks.');
        }

        // Check if internship is accepted
        if ($internship->status !== 'accepted') {
            abort(403, 'Internship must be accepted to view logbooks.');
        }

        $user = Auth::user();
        $isOwner = $internship->user_id === $user->id;

        // If not the owner, check if user is the advisor
        if (! $isOwner) {
            $isAdvisor = false;

            // Get the student's profile
            $studentProfile = MahasiswaProfile::where('user_id', $internship->user_id)->first();

            // Check if current user is the advisor
            if ($studentProfile && $studentProfile->advisor_id === $user->id) {
                $isAdvisor = true;
            }

            // If not owner or advisor, deny access
            if (! $isAdvisor) {
                abort(403, 'You do not have permission to view this internship\'s logbooks.');
            }
        }
    }
}
