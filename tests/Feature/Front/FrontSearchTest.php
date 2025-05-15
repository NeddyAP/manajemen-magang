<?php

namespace Tests\Feature\Front;

use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FrontSearchTest extends TestCase
{
    public $admin;

    public $mahasiswa;

    public $internship;

    /**
     * @var \App\Models\Logbook|\Illuminate\Database\Eloquent\Collection<int, \App\Models\Logbook>
     */
    public $logbook1;

    /**
     * @var \App\Models\Logbook|\Illuminate\Database\Eloquent\Collection<int, \App\Models\Logbook>
     */
    public $logbook2;

    /**
     * @var \App\Models\Report|\Illuminate\Database\Eloquent\Collection<int, \App\Models\Report>
     */
    public $report1;

    /**
     * @var \App\Models\Report|\Illuminate\Database\Eloquent\Collection<int, \App\Models\Report>
     */
    public $report2;

    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        // Create test users with roles
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->mahasiswa = User::factory()->create();
        $this->mahasiswa->assignRole('mahasiswa');

        // Create an internship for logbooks and reports
        $this->internship = Internship::factory()->create([
            'user_id' => $this->mahasiswa->id,
            'company_name' => 'Test Company',
            'status' => 'accepted',
        ]);

        // Create logbooks with specific content
        $this->logbook1 = Logbook::factory()->create([
            'internship_id' => $this->internship->id,
            'user_id' => $this->mahasiswa->id,
            'date' => now()->subDays(5),
            'activities' => 'Implemented login functionality',
            'supervisor_notes' => 'Good progress',
        ]);

        $this->logbook2 = Logbook::factory()->create([
            'internship_id' => $this->internship->id,
            'user_id' => $this->mahasiswa->id,
            'date' => now()->subDays(4),
            'activities' => 'Fixed search bug in application',
            'supervisor_notes' => null,
        ]);

        // Create reports with specific titles
        $this->report1 = Report::factory()->create([
            'internship_id' => $this->internship->id,
            'user_id' => $this->mahasiswa->id,
            'title' => 'Initial Progress Report',
            'status' => 'pending',
            'reviewer_notes' => null,
        ]);

        $this->report2 = Report::factory()->create([
            'internship_id' => $this->internship->id,
            'user_id' => $this->mahasiswa->id,
            'title' => 'Final Implementation Report',
            'status' => 'approved',
            'reviewer_notes' => 'Excellent work',
        ]);
    }

    public function test_admin_can_search_logbooks_by_activities()
    {
        $this->actingAs($this->admin);

        $response = $this->get('/admin/logbooks?search=login');
        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('admin/logbooks/index')
                ->has('logbooks', 1)
                ->where('logbooks.0.activities', 'Implemented login functionality');
        });
    }

    public function test_admin_can_search_logbooks_by_supervisor_notes()
    {
        $this->actingAs($this->admin);

        $response = $this->get('/admin/logbooks?search=good');
        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('admin/logbooks/index')
                ->has('logbooks', 1)
                ->where('logbooks.0.supervisor_notes', 'Good progress');
        });
    }

    public function test_admin_can_search_reports_by_title()
    {
        $this->actingAs($this->admin);

        $response = $this->get('/admin/reports?search=implementation');
        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('admin/reports/index')
                ->has('reports', 1)
                ->where('reports.0.title', 'Final Implementation Report');
        });
    }

    public function test_admin_can_search_reports_by_reviewer_notes()
    {
        $this->actingAs($this->admin);

        $response = $this->get('/admin/reports?search=excellent');
        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('admin/reports/index')
                ->has('reports', 1)
                ->where('reports.0.reviewer_notes', 'Excellent work');
        });
    }

    public function test_student_can_search_their_logbooks_by_activities()
    {
        $this->actingAs($this->mahasiswa);

        $response = $this->get("/internships/logbooks/{$this->internship->id}?search=search");
        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('front/internships/logbooks/index')
                ->has('logbooks', 1)
                ->where('logbooks.0.activities', 'Fixed search bug in application');
        });
    }

    public function test_student_can_search_their_reports_by_title()
    {
        $this->actingAs($this->mahasiswa);

        $response = $this->get("/internships/reports/{$this->internship->id}?search=progress");
        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            return $page->component('front/internships/reports/index')
                ->has('reports', 1)
                ->where('reports.0.title', 'Initial Progress Report');
        });
    }
}
