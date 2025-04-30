<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\GlobalVariable;
use App\Models\GuidanceClass;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\Tutorial;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * Get internship statistics.
     */
    public function getInternshipStats(Request $request): JsonResponse
    {
        // TODO: Implement logic to fetch and calculate internship statistics
        // Example: Count by status, type, duration etc.

        $total = Internship::count();
        $statsByStatus = Internship::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status'); // Key by status for easier frontend access

        $statsByType = Internship::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get()
            ->keyBy('type'); // Key by type for easier frontend access

        // Prepare status counts, ensuring all statuses are present
        $statuses = ['waiting', 'accepted', 'rejected']; // Define correct possible statuses
        $statusCounts = [];
        foreach ($statuses as $status) {
            $statusCounts[$status] = $statsByStatus->get($status, (object) ['total' => 0])->total;
        }

        // Prepare type counts, ensuring all types are present
        $types = ['kkl', 'kkn']; // Define all possible types based on InternshipFactory
        $typeCounts = [];
        foreach ($types as $type) {
            $typeCounts[$type] = $statsByType->get($type, (object) ['total' => 0])->total;
        }

        return response()->json([
            'total_internships' => $total,
            'by_status' => $statusCounts,
            'by_type' => $typeCounts,
            // Add more stats as needed (e.g., recent applications)
        ]);
    }

    /**
     * Get student performance metrics.
     */
    public function getStudentPerformance(Request $request): JsonResponse
    {
        // TODO: Implement logic for student performance
        // Example: Logbook completion rates, report approval rates, attendance

        // Placeholder data
        $performance = [
            'logbook_completion_avg' => 85.5, // Example percentage
            'report_approval_rate' => 92.1, // Example percentage
            'guidance_attendance_avg' => 95.0, // Example percentage
        ];

        return response()->json($performance);
    }

    /**
     * Get system usage statistics.
     */
    public function getSystemUsage(Request $request): JsonResponse
    {
        // TODO: Implement logic for system usage
        // Example: Active users, feature usage (needs more detailed tracking)

        $activeUsers = User::where('last_login_at', '>=', now()->subDays(30))->count(); // Example: Active in last 30 days

        // Placeholder data
        $usage = [
            'active_users_last_30d' => $activeUsers,
            'total_internships' => Internship::count(),
            'total_logbooks' => Logbook::count(),
        ];

        return response()->json($usage);
    }

    /**
     * Get logbook summary statistics.
     */
    public function getLogbookSummary(Request $request): JsonResponse
    {
        $total = Logbook::count();
        $byStatus = Logbook::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status'); // Key by status for easier frontend access

        $recentCount = Logbook::where('created_at', '>=', now()->subDays(7))->count();

        $stats = [
            'total_logbooks' => $total,
            'by_status' => [ // Ensure consistent structure even if a status has 0 count
                'pending' => $byStatus->get('pending', (object) ['total' => 0])->total,
                'approved' => $byStatus->get('approved', (object) ['total' => 0])->total,
                'rejected' => $byStatus->get('rejected', (object) ['total' => 0])->total,
            ],
            'recent_count_7d' => $recentCount,
        ];

        return response()->json($stats);
    }

    /**
     * Get report summary statistics.
     */
    public function getReportSummary(Request $request): JsonResponse
    {
        $total = Report::count();
        $byStatus = Report::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status'); // Key by status for easier frontend access

        $recentCount = Report::where('created_at', '>=', now()->subDays(7))->count();

        $stats = [
            'total_reports' => $total,
            'by_status' => [ // Ensure consistent structure even if a status has 0 count
                'pending' => $byStatus->get('pending', (object) ['total' => 0])->total,
                'approved' => $byStatus->get('approved', (object) ['total' => 0])->total,
                'rejected' => $byStatus->get('rejected', (object) ['total' => 0])->total,
            ],
            'recent_count_7d' => $recentCount,
        ];

        return response()->json($stats);
    }

    /**
     * Get guidance class statistics.
     */
    public function getGuidanceClassStats(Request $request): JsonResponse
    {
        $total = GuidanceClass::count();
        $upcomingCount = GuidanceClass::where('start_date', '>', now())->count();
        $pastCount = GuidanceClass::where('end_date', '<', now())->count();
        // TODO: Add average attendance calculation if attendance tracking is implemented

        $stats = [
            'total_classes' => $total,
            'upcoming_classes' => $upcomingCount,
            'past_classes' => $pastCount,
        ];

        return response()->json($stats);
    }

    /**
     * Get tutorial statistics.
     */
    public function getTutorialStats(Request $request): JsonResponse
    {
        $total = Tutorial::count();
        $active = Tutorial::where('is_active', true)->count();
        $inactive = $total - $active;
        $recentCount = Tutorial::where('created_at', '>=', now()->subDays(30))->count();

        $stats = [
            'total_tutorials' => $total,
            'active_tutorials' => $active,
            'inactive_tutorials' => $inactive,
            'recent_count_30d' => $recentCount,
        ];

        return response()->json($stats);
    }

    /**
     * Get user statistics.
     */
    public function getUserStats(Request $request): JsonResponse
    {
        $total = User::count();

        // Define the roles to count
        $rolesToCount = ['superadmin', 'admin', 'dosen', 'mahasiswa'];
        $usersByRole = [];

        foreach ($rolesToCount as $roleName) {
            // Count users with the specific role
            // Ensure the role exists before querying to avoid errors if a role is removed
            if (\Spatie\Permission\Models\Role::where('name', $roleName)->exists()) {
                $count = User::role($roleName)->count();
                $usersByRole[] = ['role' => $roleName, 'total' => $count];
            } else {
                // Optionally handle roles that might not exist in the DB
                $usersByRole[] = ['role' => $roleName, 'total' => 0];
            }
        }

        $activeCount = User::where('last_login_at', '>=', now()->subDays(30))->count();
        $recentCount = User::where('created_at', '>=', now()->subDays(7))->count();

        $stats = [
            'total_users' => $total,
            'users_by_role' => $usersByRole,
            'active_users_30d' => $activeCount,
            'recent_registrations_7d' => $recentCount,
        ];

        return response()->json($stats);
    }

    /**
     * Get FAQ statistics.
     */
    public function getFaqStats(Request $request): JsonResponse
    {
        $total = Faq::count();
        $active = Faq::where('is_active', true)->count();
        $inactive = $total - $active;
        $recentCount = Faq::where('created_at', '>=', now()->subDays(30))->count();

        $stats = [
            'total_faqs' => $total,
            'active_faqs' => $active,
            'inactive_faqs' => $inactive,
            'recent_count_30d' => $recentCount,
        ];

        return response()->json($stats);
    }

    /**
     * Get global variable statistics.
     */
    public function getGlobalVariableStats(Request $request): JsonResponse
    {
        $total = GlobalVariable::count();
        $active = GlobalVariable::where('is_active', true)->count();
        $inactive = $total - $active;
        $recentCount = GlobalVariable::where('created_at', '>=', now()->subDays(30))->count();

        $stats = [
            'total_variables' => $total,
            'active_variables' => $active,
            'inactive_variables' => $inactive,
            'recent_count_30d' => $recentCount,
        ];

        return response()->json($stats);
    }

    /**
     * Get trash statistics.
     */
    public function getTrashStats(Request $request): JsonResponse
    {
        // TODO: Implement trash stats (requires querying soft deleted models)
        // This is more complex as it involves checking multiple tables with soft deletes.
        // Placeholder for now.
        $stats = [
            'total_items_in_trash' => 'N/A', // Placeholder
        ];

        return response()->json($stats);
    }
}
