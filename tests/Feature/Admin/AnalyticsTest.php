<?php

namespace Tests\Feature\Admin;

use App\Models\Faq;
use App\Models\GlobalVariable;
use App\Models\GuidanceClass;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\Tutorial;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        // Ensure adminUser is active and its creation time is 'now' for recent user stats
        $this->adminUser = User::factory()->admin()->create(['last_login_at' => now(), 'created_at' => now()]);
    }

    public function test_admin_can_get_internship_stats(): void
    {
        Internship::factory()->count(2)->create(['status' => 'accepted', 'type' => 'kkl']);
        Internship::factory()->count(3)->create(['status' => 'waiting', 'type' => 'kkn']);
        Internship::factory()->count(1)->create(['status' => 'rejected', 'type' => 'kkl']);

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.internship-stats'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_internships',
                'by_status' => ['waiting', 'accepted', 'rejected'],
                'by_type' => ['kkl', 'kkn'],
            ])
            ->assertJson([
                'total_internships' => 6,
                'by_status' => [
                    'accepted' => 2,
                    'waiting' => 3,
                    'rejected' => 1,
                ],
                'by_type' => [
                    'kkl' => 3,
                    'kkn' => 3,
                ],
            ]);
    }

    public function test_admin_can_get_student_performance_stats(): void
    {
        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.student-performance'));
        $response->assertStatus(200)
            ->assertJson([
                'logbook_completion_avg' => 85.5,
                'report_approval_rate' => 92.1,
                'guidance_attendance_avg' => 95.0,
            ]);
    }

    public function test_admin_can_get_system_usage_stats(): void
    {
        User::factory()->count(2)->create(['last_login_at' => now()->subDays(5)]);
        User::factory()->count(1)->create(['last_login_at' => now()->subDays(40)]);

        Internship::factory()->count(5)->create();
        Logbook::factory()->count(10)->create();

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.system-usage'));

        $response->assertStatus(200)
            ->assertJson([
                'active_users_last_30d' => 3,
                'total_internships' => 15,
                'total_logbooks' => 10,
            ]);
    }

    public function test_admin_can_get_logbook_summary_stats(): void
    {
        Logbook::factory()->count(5)->create(['created_at' => now()->subDays(10)]);
        Logbook::factory()->count(2)->create(['created_at' => now()->subDays(3)]);

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.logbook-summary'));
        $response->assertStatus(200)
            ->assertJsonStructure(['total_logbooks', 'recent_count_7d'])
            ->assertJson(['total_logbooks' => 7, 'recent_count_7d' => 2]);
    }

    public function test_admin_can_get_report_summary_stats(): void
    {
        Report::factory()->count(2)->create(['status' => 'approved', 'created_at' => now()->subDays(10)]);
        Report::factory()->count(3)->create(['status' => 'pending', 'created_at' => now()->subDays(2)]);
        Report::factory()->count(1)->create(['status' => 'rejected', 'created_at' => now()->subDays(10)]);

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.report-summary'));
        $response->assertStatus(200)
            ->assertJsonStructure(['total_reports', 'by_status' => ['pending', 'approved', 'rejected'], 'recent_count_7d'])
            ->assertJson([
                'total_reports' => 6,
                'by_status' => ['pending' => 3, 'approved' => 2, 'rejected' => 1],
                'recent_count_7d' => 3,
            ]);
    }

    public function test_admin_can_get_guidance_class_stats(): void
    {
        GuidanceClass::factory()->count(2)->create(['start_date' => now()->addDays(5)]);
        GuidanceClass::factory()->count(3)->create(['start_date' => now()->subDays(10), 'end_date' => now()->subDays(5)]);

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.guidance-class-stats'));
        $response->assertStatus(200)
            ->assertJsonStructure(['total_classes', 'upcoming_classes', 'past_classes'])
            ->assertJson(['total_classes' => 5, 'upcoming_classes' => 2, 'past_classes' => 3]);
    }

    public function test_admin_can_get_tutorial_stats(): void
    {
        Tutorial::factory()->count(3)->create(['is_active' => true, 'created_at' => now()->subDays(10)]);
        Tutorial::factory()->count(2)->create(['is_active' => false, 'created_at' => now()->subDays(10)]);
        Tutorial::factory()->count(1)->create(['is_active' => true, 'created_at' => now()->subDays(40)]);

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.tutorial-stats'));
        $response->assertStatus(200)
            ->assertJsonStructure(['total_tutorials', 'active_tutorials', 'inactive_tutorials', 'recent_count_30d'])
            ->assertJson([
                'total_tutorials' => 6,
                'active_tutorials' => 4,
                'inactive_tutorials' => 2,
                'recent_count_30d' => 5,
            ]);
    }

    public function test_admin_can_get_user_stats(): void
    {
        // $this->adminUser is created in setUp with 'admin' role, active last_login_at, and created_at = now()
        User::factory()->count(2)->mahasiswa()->create(['last_login_at' => now()->subDays(5), 'created_at' => now()->subDays(3)]); // 2 active mahasiswa, recent
        User::factory()->count(1)->dosen()->create(['created_at' => now()->subDays(10), 'last_login_at' => now()->subDays(40)]); // 1 dosen, not recent, not active
        Role::findOrCreate('superadmin', 'web');

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.user-stats'));

        // Total users: 1 (adminUser) + 2 (mahasiswa) + 1 (dosen) = 4
        // Active users (last 30d): adminUser (active) + 2 mahasiswa (active) = 3
        // Recent registrations (last 7d): adminUser (created now) + 2 mahasiswa (created 3 days ago) = 3
        $response->assertStatus(200)
            ->assertJsonStructure([
                'total_users',
                'users_by_role' => ['*' => ['role', 'total']],
                'active_users_30d',
                'recent_registrations_7d',
            ])
            ->assertJsonFragment(['role' => 'admin', 'total' => 1])
            ->assertJsonFragment(['role' => 'mahasiswa', 'total' => 2])
            ->assertJsonFragment(['role' => 'dosen', 'total' => 1])
            ->assertJsonFragment(['role' => 'superadmin', 'total' => 0])
            ->assertJson([ // Assert the specific counts
                'total_users' => 4,
                'active_users_30d' => 3,
                'recent_registrations_7d' => 3, // Corrected from 2 to 3
            ]);
    }

    public function test_admin_can_get_faq_stats(): void
    {
        Faq::factory()->count(3)->create(['is_active' => true, 'created_at' => now()->subDays(10)]);
        Faq::factory()->count(2)->create(['is_active' => false, 'created_at' => now()->subDays(40)]);

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.faq-stats'));
        $response->assertStatus(200)
            ->assertJsonStructure(['total_faqs', 'active_faqs', 'inactive_faqs', 'recent_count_30d'])
            ->assertJson([
                'total_faqs' => 5,
                'active_faqs' => 3,
                'inactive_faqs' => 2,
                'recent_count_30d' => 3,
            ]);
    }

    public function test_admin_can_get_global_variable_stats(): void
    {
        GlobalVariable::factory()->count(3)->create(['is_active' => true, 'created_at' => now()->subDays(10)]);
        GlobalVariable::factory()->count(2)->create(['is_active' => false, 'created_at' => now()->subDays(40)]);

        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.global-variable-stats'));
        $response->assertStatus(200)
            ->assertJsonStructure(['total_variables', 'active_variables', 'inactive_variables', 'recent_count_30d'])
            ->assertJson([
                'total_variables' => 5,
                'active_variables' => 3,
                'inactive_variables' => 2,
                'recent_count_30d' => 3,
            ]);
    }

    public function test_admin_can_get_trash_stats(): void
    {
        $response = $this->actingAs($this->adminUser)->getJson(route('admin.analytics.trash-stats'));
        $response->assertStatus(200)
            ->assertJson(['total_items_in_trash' => 'N/A']);
    }

    public function test_non_admin_cannot_access_analytics_endpoints(): void
    {
        $mahasiswaUser = User::factory()->mahasiswa()->create();

        $routes = [
            'admin.analytics.internship-stats',
            'admin.analytics.student-performance',
            'admin.analytics.system-usage',
            'admin.analytics.logbook-summary',
            'admin.analytics.report-summary',
            'admin.analytics.guidance-class-stats',
            'admin.analytics.tutorial-stats',
            'admin.analytics.user-stats',
            'admin.analytics.faq-stats',
            'admin.analytics.global-variable-stats',
            'admin.analytics.trash-stats',
        ];

        foreach ($routes as $routeName) {
            $response = $this->actingAs($mahasiswaUser)->getJson(route($routeName));
            $response->assertStatus(403);
        }
    }
}
