<?php

namespace Tests\Feature\Front;

use App\Models\DosenProfile;
use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\MahasiswaProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GuidanceClassControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $adminUser;

    protected $dosenUser;

    protected $mahasiswaUser;

    protected $otherDosenUser;

    protected $otherMahasiswaUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        // Create users and assign roles
        $this->adminUser = User::factory()->create()->assignRole('superadmin'); // Assuming 'superadmin' or 'admin' exists
        $this->dosenUser = User::factory()->create()->assignRole('dosen');
        $this->mahasiswaUser = User::factory()->create()->assignRole('mahasiswa');
        $this->otherDosenUser = User::factory()->create()->assignRole('dosen');
        $this->otherMahasiswaUser = User::factory()->create()->assignRole('mahasiswa');

        // Create profiles
        DosenProfile::factory()->create(['user_id' => $this->dosenUser->id]);
        MahasiswaProfile::factory()->create([
            'user_id' => $this->mahasiswaUser->id,
            'advisor_id' => $this->dosenUser->id, // Assign advisor
        ]);
        DosenProfile::factory()->create(['user_id' => $this->otherDosenUser->id]);
        MahasiswaProfile::factory()->create([
            'user_id' => $this->otherMahasiswaUser->id,
            'advisor_id' => $this->otherDosenUser->id, // Assign different advisor
        ]);
    }

    // --- Test Index ---
    public function test_dosen_can_view_their_guidance_classes_index()
    {
        $class1 = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]);
        $class2 = GuidanceClass::factory()->create(['lecturer_id' => $this->otherDosenUser->id]);

        $response = $this->actingAs($this->dosenUser)->get(route('front.internships.guidance-classes.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/index')
            ->has('classes', 1)
            ->where('classes.0.id', $class1->id)
            ->where('classes.0.lecturer_id', $this->dosenUser->id)
            ->has('guidanceClassStats') // Check if stats are passed
        );
    }

    public function test_mahasiswa_can_view_their_advisor_guidance_classes_index()
    {
        $advisorClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]); // Mahasiswa's advisor
        $otherClass = GuidanceClass::factory()->create(['lecturer_id' => $this->otherDosenUser->id]);

        $response = $this->actingAs($this->mahasiswaUser)->get(route('front.internships.guidance-classes.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/index')
            ->has('classes', 1)
            ->where('classes.0.id', $advisorClass->id)
            ->where('classes.0.lecturer_id', $this->dosenUser->id) // Ensure it's the advisor's class
            ->has('guidanceClassStats')
        );
    }

    public function test_unauthorized_user_cannot_view_guidance_classes_index()
    {
        // Test guest access
        $response = $this->get(route('front.internships.guidance-classes.index'));
        $response->assertRedirect(route('login')); // Assuming redirect to login for guests

        // Test user with a different role (e.g., admin - assuming they shouldn't see this front-end view directly)
        $response = $this->actingAs($this->adminUser)->get(route('front.internships.guidance-classes.index'));
        // Expecting an empty result or specific handling for admin, adjust assertion as needed
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/index')
            ->has('classes', 0) // Admins likely see no classes via this route
        );

        // Test mahasiswa without an advisor assigned
        $mahasiswaWithoutAdvisor = User::factory()->create()->assignRole('mahasiswa');
        MahasiswaProfile::factory()->create([
            'user_id' => $mahasiswaWithoutAdvisor->id,
            'advisor_id' => null, // No advisor
        ]);
        $response = $this->actingAs($mahasiswaWithoutAdvisor)->get(route('front.internships.guidance-classes.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/index')
            ->has('classes', 0) // Should see no classes if no advisor
        );
    }

    // --- Test Show ---
    public function test_dosen_can_view_their_own_guidance_class_details()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]);
        // Add the assigned student to the class context for the view
        $studentProfile = MahasiswaProfile::where('advisor_id', $this->dosenUser->id)->first();
        $student = $studentProfile->user;

        $response = $this->actingAs($this->dosenUser)->get(route('front.internships.guidance-classes.show', $guidanceClass->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/show')
            ->where('class.id', $guidanceClass->id)
            ->where('class.lecturer.id', $this->dosenUser->id)
            ->has('class.students', fn ($students) => $students->where('id', $student->id)->etc()) // Check if student is included
            ->where('userRole', 'dosen')
        );
    }

    public function test_mahasiswa_can_view_their_advisor_guidance_class_details()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]); // Advisor's class

        $response = $this->actingAs($this->mahasiswaUser)->get(route('front.internships.guidance-classes.show', $guidanceClass->id));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/show')
            ->where('class.id', $guidanceClass->id)
            ->where('class.lecturer.id', $this->dosenUser->id)
            ->where('userRole', 'mahasiswa')
            ->has('isAttended') // Check if attendance status is passed
        );
    }

    public function test_dosen_cannot_view_other_dosen_guidance_class_details()
    {
        $otherClass = GuidanceClass::factory()->create(['lecturer_id' => $this->otherDosenUser->id]);

        $response = $this->actingAs($this->dosenUser)->get(route('front.internships.guidance-classes.show', $otherClass->id));

        $response->assertStatus(403); // Forbidden
    }

    public function test_mahasiswa_cannot_view_other_advisor_guidance_class_details()
    {
        $otherClass = GuidanceClass::factory()->create(['lecturer_id' => $this->otherDosenUser->id]); // Not the student's advisor

        $response = $this->actingAs($this->mahasiswaUser)->get(route('front.internships.guidance-classes.show', $otherClass->id));

        $response->assertStatus(403); // Forbidden
    }

    // --- Test Create/Store ---
    public function test_dosen_can_create_guidance_class()
    {
        $this->actingAs($this->dosenUser);

        // Test create form view
        $response = $this->get(route('front.internships.guidance-classes.create'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/create')
        );

        // Test store action
        $startDate = $this->faker->dateTimeBetween('+1 day', '+1 week');
        $postData = [
            'title' => $this->faker->sentence(4),
            'start_date' => $startDate->format('Y-m-d H:i:s'),
            'end_date' => $this->faker->optional()->dateTimeBetween($startDate, '+2 weeks')->format('Y-m-d H:i:s'),
            'room' => $this->faker->optional()->word,
            'description' => $this->faker->optional()->paragraph,
        ];

        $response = $this->post(route('front.internships.guidance-classes.store'), $postData);

        $this->assertDatabaseHas('guidance_classes', [
            'title' => $postData['title'],
            'lecturer_id' => $this->dosenUser->id,
            // Add other fields if necessary for assertion
        ]);

        $latestClass = GuidanceClass::latest('id')->first();
        $response->assertRedirect(route('front.internships.guidance-classes.show', $latestClass->id));
        $response->assertSessionHas('success');
    }

    public function test_mahasiswa_cannot_create_guidance_class()
    {
        $this->actingAs($this->mahasiswaUser);

        // Test create form view
        $response = $this->get(route('front.internships.guidance-classes.create'));
        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');

        // Test store action
        $startDate = $this->faker->dateTimeBetween('+1 day', '+1 week');
        $postData = [
            'title' => $this->faker->sentence(4),
            'start_date' => $startDate->format('Y-m-d H:i:s'),
        ];

        $response = $this->post(route('front.internships.guidance-classes.store'), $postData);
        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('guidance_classes', ['title' => $postData['title']]);
    }

    // --- Test Edit/Update ---
    public function test_dosen_can_update_their_own_guidance_class()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]);
        $this->actingAs($this->dosenUser);

        // Test edit form view
        $response = $this->get(route('front.internships.guidance-classes.edit', $guidanceClass->id));
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('front/internships/guidance-classes/edit')
            ->where('guidanceClass.id', $guidanceClass->id)
        );

        // Test update action
        $startDate = $this->faker->dateTimeBetween('+1 day', '+1 week');
        $updateData = [
            'title' => 'Updated Title',
            'start_date' => $startDate->format('Y-m-d H:i:s'),
            'end_date' => $this->faker->optional()->dateTimeBetween($startDate, '+2 weeks')->format('Y-m-d H:i:s'),
            'room' => 'Updated Room',
            'description' => 'Updated Description',
        ];

        $response = $this->put(route('front.internships.guidance-classes.update', $guidanceClass->id), $updateData);

        $response->assertRedirect(route('front.internships.guidance-classes.show', $guidanceClass->id));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('guidance_classes', [
            'id' => $guidanceClass->id,
            'title' => 'Updated Title',
            'room' => 'Updated Room',
        ]);
    }

    public function test_dosen_cannot_update_other_dosen_guidance_class()
    {
        $otherClass = GuidanceClass::factory()->create(['lecturer_id' => $this->otherDosenUser->id]);
        $this->actingAs($this->dosenUser);

        // Test edit form view
        $response = $this->get(route('front.internships.guidance-classes.edit', $otherClass->id));
        $response->assertRedirect(route('front.internships.guidance-classes.index')); // Or assert 403 if preferred
        $response->assertSessionHas('error');

        // Test update action
        $updateData = ['title' => 'Attempted Update'];
        $response = $this->put(route('front.internships.guidance-classes.update', $otherClass->id), $updateData);
        $response->assertRedirect(route('front.internships.guidance-classes.index')); // Or assert 403
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('guidance_classes', ['id' => $otherClass->id, 'title' => 'Attempted Update']);
    }

    public function test_mahasiswa_cannot_update_guidance_class()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]);
        $this->actingAs($this->mahasiswaUser);

        // Test edit form view
        $response = $this->get(route('front.internships.guidance-classes.edit', $guidanceClass->id));
        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');

        // Test update action
        $updateData = ['title' => 'Attempted Update'];
        $response = $this->put(route('front.internships.guidance-classes.update', $guidanceClass->id), $updateData);
        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('guidance_classes', ['id' => $guidanceClass->id, 'title' => 'Attempted Update']);
    }

    // --- Test Destroy ---
    public function test_dosen_can_delete_their_own_guidance_class()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]);
        // Create a related attendance record to ensure it gets deleted too
        GuidanceClassAttendance::factory()->create([
            'guidance_class_id' => $guidanceClass->id,
            'user_id' => $this->mahasiswaUser->id,
        ]);

        $this->actingAs($this->dosenUser);
        $response = $this->delete(route('front.internships.guidance-classes.destroy', $guidanceClass->id));

        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('guidance_classes', ['id' => $guidanceClass->id]);
        $this->assertDatabaseMissing('guidance_class_attendances', ['guidance_class_id' => $guidanceClass->id]); // Verify related data deleted
    }

    public function test_dosen_cannot_delete_other_dosen_guidance_class()
    {
        $otherClass = GuidanceClass::factory()->create(['lecturer_id' => $this->otherDosenUser->id]);
        $this->actingAs($this->dosenUser);

        $response = $this->delete(route('front.internships.guidance-classes.destroy', $otherClass->id));

        $response->assertRedirect(route('front.internships.guidance-classes.index')); // Or assert 403
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('guidance_classes', ['id' => $otherClass->id]); // Ensure it wasn't deleted
    }

    public function test_mahasiswa_cannot_delete_guidance_class()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id]);
        $this->actingAs($this->mahasiswaUser);

        $response = $this->delete(route('front.internships.guidance-classes.destroy', $guidanceClass->id));

        $response->assertRedirect(route('front.internships.guidance-classes.index')); // Or assert 403
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('guidance_classes', ['id' => $guidanceClass->id]); // Ensure it wasn't deleted
    }

    // --- Test QR Code ---
    public function test_dosen_can_generate_qr_code_for_their_class()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id, 'qr_code' => null]);
        $this->actingAs($this->dosenUser);

        $response = $this->post(route('front.internships.guidance-classes.generate-qr', $guidanceClass->id));

        $response->assertRedirect(); // Asserts redirect back or to show page
        $response->assertSessionHas('success');
        $guidanceClass->refresh();
        $this->assertNotNull($guidanceClass->qr_code);
        $this->assertStringContainsString(route('guidance-classes.attend', ['token' => '']), $guidanceClass->qr_code); // Check base URL structure
    }

    public function test_dosen_cannot_generate_qr_code_for_other_dosen_class()
    {
        $otherClass = GuidanceClass::factory()->create(['lecturer_id' => $this->otherDosenUser->id, 'qr_code' => null]);
        $this->actingAs($this->dosenUser);

        $response = $this->post(route('front.internships.guidance-classes.generate-qr', $otherClass->id));

        $response->assertRedirect(route('front.internships.guidance-classes.index')); // Or assert 403
        $response->assertSessionHas('error');
        $otherClass->refresh();
        $this->assertNull($otherClass->qr_code); // Ensure QR code was not generated
    }

    public function test_mahasiswa_cannot_generate_qr_code()
    {
        $guidanceClass = GuidanceClass::factory()->create(['lecturer_id' => $this->dosenUser->id, 'qr_code' => null]);
        $this->actingAs($this->mahasiswaUser);

        $response = $this->post(route('front.internships.guidance-classes.generate-qr', $guidanceClass->id));

        $response->assertRedirect(route('front.internships.guidance-classes.index')); // Or assert 403
        $response->assertSessionHas('error');
        $guidanceClass->refresh();
        $this->assertNull($guidanceClass->qr_code); // Ensure QR code was not generated
    }

    // --- Test Manual Attendance ---
    public function test_dosen_can_mark_attendance_for_their_advisee_in_their_class()
    {
        // TODO: Implement test
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function test_dosen_cannot_mark_attendance_for_other_dosen_class()
    {
        // TODO: Implement test
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function test_mahasiswa_cannot_mark_attendance()
    {
        // TODO: Implement test
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    // --- Test Reset Attendance ---
    public function test_dosen_can_reset_attendance_for_their_advisee_in_their_class()
    {
        // TODO: Implement test
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function test_dosen_cannot_reset_attendance_for_other_dosen_class()
    {
        // TODO: Implement test
        $this->markTestIncomplete('This test has not been implemented yet.');
    }

    public function test_mahasiswa_cannot_reset_attendance()
    {
        // TODO: Implement test
        $this->markTestIncomplete('This test has not been implemented yet.');
    }
}
