<?php

use App\Models\Faq;
use App\Models\GlobalVariable;
use App\Models\GuidanceClass;
use App\Models\Internship;
use App\Models\Logbook;
use App\Models\Report;
use App\Models\Tutorial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSearchTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @var \App\Models\User
     */
    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        $this->actingAs($this->admin);
    }

    public function test_can_search_users_by_name()
    {
        // Arrange
        $user = User::factory()->create(['name' => 'John Doe']);
        $anotherUser = User::factory()->create(['name' => 'Jane Smith']);

        // Act
        $response = $this->get('/admin/users?search=John');

        // Assert
        $response->assertStatus(200);
        $response->assertSee('John Doe');
        $response->assertDontSee('Jane Smith');
    }

    public function test_can_search_faqs_by_question_or_answer()
    {
        // Arrange
        Faq::create([
            'question' => 'How to apply for internship?',
            'answer' => 'Submit your application through the portal',
            'category' => 'Application',
        ]);

        Faq::create([
            'question' => 'What are the requirements?',
            'answer' => 'You need to have completed at least 4 semesters',
            'category' => 'Eligibility',
        ]);

        // Act & Assert - search by question
        $response = $this->get('/admin/faqs?search=apply');
        $response->assertStatus(200);
        $response->assertSee('How to apply for internship?');
        $response->assertDontSee('What are the requirements?');

        // Act & Assert - search by answer
        $response = $this->get('/admin/faqs?search=semester');
        $response->assertStatus(200);
        $response->assertSee('What are the requirements?');
        $response->assertDontSee('How to apply for internship?');
    }

    public function test_can_search_tutorials_by_title_and_content()
    {
        // Arrange
        Tutorial::create([
            'title' => 'Getting Started Guide',
            'content' => 'This is a complete guide for new users',
            'file_name' => 'getting-started.pdf',
            'file_path' => 'tutorials/getting-started.pdf',
        ]);

        Tutorial::create([
            'title' => 'Advanced Features',
            'content' => 'Learn about advanced system features',
            'file_name' => 'advanced-features.pdf',
            'file_path' => 'tutorials/advanced-features.pdf',
        ]);

        // Act & Assert - search by title
        $response = $this->get('/admin/tutorials?search=Started');
        $response->assertStatus(200);
        $response->assertSee('Getting Started Guide');
        $response->assertDontSee('Advanced Features');

        // Act & Assert - search by content
        $response = $this->get('/admin/tutorials?search=advanced');
        $response->assertStatus(200);
        $response->assertSee('Advanced Features');
        $response->assertDontSee('Getting Started Guide');
    }

    public function test_can_search_global_variables()
    {
        // Arrange
        GlobalVariable::create([
            'key' => 'SITE_NAME',
            'slug' => 'site-name',
            'value' => 'Internship Management System',
            'description' => 'The name of the website',
            'type' => 'text',
        ]);

        GlobalVariable::create([
            'key' => 'MAX_FILE_SIZE',
            'slug' => 'max-file-size',
            'value' => '5',
            'description' => 'Maximum file upload size in MB',
            'type' => 'number',
        ]);

        // Act & Assert - search by key
        $response = $this->get('/admin/global-variables?search=SITE');
        $response->assertStatus(200);
        $response->assertSee('SITE_NAME');
        $response->assertDontSee('MAX_FILE_SIZE');

        // Act & Assert - search by value
        $response = $this->get('/admin/global-variables?search=Internship');
        $response->assertStatus(200);
        $response->assertSee('SITE_NAME');
        $response->assertDontSee('MAX_FILE_SIZE');
    }

    public function test_can_search_admin_reports()
    {
        // Arrange
        $student = User::factory()->create(['name' => 'Student One']);
        $student->assignRole('mahasiswa');

        $internship = Internship::factory()->create([
            'user_id' => $student->id,
            'company_name' => 'Tech Company',
        ]);

        Report::create([
            'user_id' => $student->id,
            'internship_id' => $internship->id,
            'title' => 'Mid-term Report',
            'status' => 'pending',
            'report_file' => 'reports/midterm.pdf',
            'reviewer_notes' => 'Please add more details',
            'version' => 1,
        ]);

        // Act & Assert - search by title
        $response = $this->get('/admin/reports?search=Mid-term');
        $response->assertStatus(200);
        $response->assertSee('Mid-term Report');

        // Act & Assert - search by company
        $response = $this->get('/admin/reports?search=Tech');
        $response->assertStatus(200);
        $response->assertSee('Tech Company');
    }

    public function test_can_search_admin_logbooks()
    {
        // Arrange
        $student = User::factory()->create(['name' => 'Student Two']);
        $student->assignRole('mahasiswa');

        $internship = Internship::factory()->create([
            'user_id' => $student->id,
            'company_name' => 'Finance Corp',
        ]);

        Logbook::create([
            'internship_id' => $internship->id,
            'user_id' => $student->id,
            'date' => now()->subDays(5),
            'activities' => 'Attended orientation session',
            'supervisor_notes' => 'Good first day',
        ]);

        // Act & Assert - search by activities
        $response = $this->get('/admin/logbooks?search=orientation');
        $response->assertStatus(200);
        $response->assertSee('Attended orientation session');

        // Act & Assert - search by company
        $response = $this->get('/admin/logbooks?search=Finance');
        $response->assertStatus(200);
        $response->assertSee('Finance Corp');
    }

    public function test_can_search_guidance_classes_by_title()
    {
        // Arrange
        $lecturer = User::factory()->create(['name' => 'Prof. Smith']);
        $lecturer->assignRole('dosen');

        GuidanceClass::create([
            'title' => 'Database Design Class',
            'lecturer_id' => $lecturer->id,
            'start_date' => now(),
            'description' => 'Learn about database normalization',
        ]);

        // Act & Assert - search by title
        $response = $this->get('/admin/guidance-classes?search=Database');
        $response->assertStatus(200);
        $response->assertSee('Database Design Class');

        // Act & Assert - search by lecturer
        $response = $this->get('/admin/guidance-classes?search=Smith');
        $response->assertStatus(200);
        $response->assertSee('Prof. Smith');
    }

    public function test_can_search_front_reports_for_a_student()
    {
        // Arrange
        /** @var \App\Models\User $student */
        $student = User::factory()->create();
        $student->assignRole('mahasiswa');

        $internship = Internship::factory()->create([
            'user_id' => $student->id,
            'status' => 'accepted',
        ]);

        Report::create([
            'user_id' => $student->id,
            'internship_id' => $internship->id,
            'title' => 'Weekly Summary',
            'status' => 'pending',
            'report_file' => 'reports/weekly.pdf',
            'version' => 1,
        ]);

        // Act & Assert
        $this->actingAs($student);
        $response = $this->get('/internships/reports/'.$internship->id.'?search=Weekly'); // Changed 'resource' to 'reports'
        $response->assertStatus(200);
        $response->assertSee('Weekly Summary');
    }

    public function test_can_search_front_logbooks_for_a_student()
    {
        // Arrange
        /** @var \App\Models\User $student */
        $student = User::factory()->create();
        $student->assignRole('mahasiswa');

        $internship = Internship::factory()->create([
            'user_id' => $student->id,
            'status' => 'accepted',
        ]);

        Logbook::create([
            'internship_id' => $internship->id,
            'user_id' => $student->id,
            'date' => now()->subDays(1),
            'activities' => 'Worked on project design',
            'supervisor_notes' => 'Good progress',
        ]);

        // Act & Assert
        $this->actingAs($student);
        $response = $this->get('/internships/logbooks/'.$internship->id.'?search=design'); // Changed 'resource' to 'logbooks'
        $response->assertStatus(200);
        $response->assertSee('Worked on project design');
    }
}
