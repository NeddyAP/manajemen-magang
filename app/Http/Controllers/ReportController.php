<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Http\Requests\StoreReportRevisionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Notifications\ReportRevisionUploaded;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportController extends Controller
{
    /**
     * Store a newly uploaded report revision.
     */
    public function uploadRevision(StoreReportRevisionRequest $request, Report $report): RedirectResponse
    {
        // Authorization: Ensure the user is a Dosen and potentially has rights to revise this report.
        // Basic check is in StoreReportRevisionRequest, more specific checks can be added here or via Policies.
        // For example, check if the Dosen is assigned to the student or internship.

        if ($request->hasFile('revised_file')) {
            $file = $request->file('revised_file');
            $originalFileName = $file->getClientOriginalName();
            $path = $file->store('report_revisions', 'public');

            $report->revised_file_path = $path;
            $report->revision_uploaded_at = now();
            // We removed 'revision_uploaded_by' and 'revised_file_original_name' from the DB schema earlier.
            // If 'revision_uploaded_by' was needed, it would be: $report->revision_uploaded_by = Auth::id();
            $report->save();

            // Notify the student (and perhaps other relevant users)
            // $report->user->notify(new ReportRevisionUploaded($report, Auth::user()));

            return redirect()->back()->with('success', 'Report revision uploaded successfully.');
        }

        return redirect()->back()->with('error', 'Failed to upload report revision. Please try again.');
    }

    // Other report-related methods like index, show, create, store, edit, update, destroy can be added here.
    // For example, a method to show a specific report:
    // public function show(Report $report): InertiaResponse
    // {
    //     // Ensure the user is authorized to view this report (student owns it, or Dosen/Admin has rights)
    //     // $this->authorize('view', $report); 

    //     return Inertia::render('Reports/Show', [
    //         'report' => $report->load('user', 'internship'), // Eager load relationships
    //     ]);
    // }
}
