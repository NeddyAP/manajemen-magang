<?php

namespace App\Http\Controllers\front;

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

        // Handle search
        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm): void {
                $q->where('activities', 'like', "%{$searchTerm}%")
                    ->orWhere('date', 'like', "%{$searchTerm}%");
            });
        }

        // Handle sorting
        if ($request->has('sort_field') && ! empty($request->sort_field)) {
            $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
            $query->orderBy($request->sort_field, $direction);
        } else {
            $query->latest();
        }

        // Get total count before pagination/filtering for analytics
        $totalLogbookCount = $internship->logbooks()->count();

        // Paginate the results
        $perPage = $request->per_page ?? 10;
        $logbooks = $query->paginate($perPage)->withQueryString();

        return Inertia::render('front/internships/logbooks/index', [
            'internship' => $internship->load('user:id,name'), // Load user for context
            'logbooks' => $logbooks->items(),
            'totalLogbookCount' => $totalLogbookCount, // Pass total count
            'meta' => [
                'total' => $logbooks->total(),
                'per_page' => $logbooks->perPage(),
                'current_page' => $logbooks->currentPage(),
                'last_page' => $logbooks->lastPage(),
            ],
        ]);
    }

    public function create(Internship $internship)
    {
        // Only owner can create
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('front/internships/logbooks/create', [
            'internship' => $internship,
        ]);
    }

    public function store(StoreLogbookRequest $request, Internship $internship)
    {
        // Authorization is handled by StoreLogbookRequest and this check
        if ($internship->user_id !== auth()->id() || $internship->status !== 'accepted') {
            abort(403, 'Unauthorized action or internship not accepted.');
        }

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
        // owner and advisor can edit
        if ((! auth()->user()->hasRole('dosen') && $internship->user_id !== auth()->id()) || $logbook->internship_id !== $internship->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('front/internships/logbooks/edit', [
            'internship' => $internship,
            'logbook' => $logbook,
        ]);
    }

    public function update(UpdateLogbookRequest $request, Internship $internship, Logbook $logbook)
    {
        // Authorization is handled by UpdateLogbookRequest and this check
        if ($logbook->internship_id !== $internship->id) { // Ensure logbook belongs to the internship
            abort(404);
        }
        // Additional check if Dosen is trying to update notes vs student updating their entry
        if (auth()->user()->hasRole('dosen')) {
            $validated['supervisor_notes'] = $request->input('supervisor_notes');
        }

        $validated = $request->validated();

        // If a Dosen is updating, they might only be allowed to update supervisor_notes

        $logbook->update($validated);

        return redirect()->route('front.internships.logbooks.index', $internship)
            ->with('success', 'Logbook berhasil diperbarui');
    }

    public function destroy(Internship $internship, Logbook $logbook)
    {
        // Ensure logbook belongs to the internship (route model binding should mostly handle this)
        if ($logbook->internship_id !== $internship->id) {
            abort(404);
        }

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
        $user = Auth::user();
        $isOwner = $internship->user_id === $user->id;
        $isAdvisor = false;

        if ($user->hasRole('dosen')) {
            $dosenProfile = DosenProfile::where('user_id', $user->id)->first();
            if ($dosenProfile) {
                // Ensure $internship->user_id is the student's user_id
                // And the student's advisor_id matches the current dosen's user_id
                $studentProfile = MahasiswaProfile::where('user_id', $internship->user_id)->first();
                if ($studentProfile && $studentProfile->advisor_id === $dosenProfile->user_id) {
                    $isAdvisor = true;
                }
            }
        }

        if ((! $isOwner && ! $isAdvisor) || $internship->status !== 'accepted') {
            abort(403, 'Akses tidak diizinkan atau status magang belum diterima.');
        }
    }
}
