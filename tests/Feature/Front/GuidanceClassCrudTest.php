<?php

namespace Tests\Feature\Front;

use App\Models\GuidanceClass;
use App\Models\GuidanceClassAttendance;
use App\Models\Internship;
use App\Models\MahasiswaProfile;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class GuidanceClassCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $dosenUser;

    private User $otherDosenUser;

    private User $mahasiswaUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->dosenUser = User::factory()->dosen()->create(); // Ensures DosenProfile is created

        $this->otherDosenUser = User::factory()->dosen()->create(); // Ensures DosenProfile is created

        $this->mahasiswaUser = User::factory()
            ->has(MahasiswaProfile::factory()->state(['advisor_id' => $this->dosenUser->id]))
            ->has(Internship::factory()->state(['status' => 'accepted']))
            ->create();
        $this->mahasiswaUser->assignRole('mahasiswa');
    }

    // Dosen Tests
    public function test_dosen_can_view_their_guidance_class_index(): void
    {
        GuidanceClass::factory()->count(2)->for($this->dosenUser, 'lecturer')->create();
        GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->get(route('front.internships.guidance-classes.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('front/internships/guidance-classes/index')
                ->has('classes', 2)
        );
    }

    public function test_dosen_can_view_create_guidance_class_page(): void
    {
        $response = $this->actingAs($this->dosenUser)
            ->get(route('front.internships.guidance-classes.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('front/internships/guidance-classes/create'));
    }

    public function test_dosen_can_store_new_guidance_class(): void
    {
        Notification::fake();

        $classData = [
            'title' => 'Dosen Created Class',
            'description' => 'Test description',
            'room' => 'D101',
            'start_date' => now()->addDays(3)->toDateTimeString(),
            'end_date' => now()->addDays(3)->addHours(2)->toDateTimeString(),
            // lecturer_id will be set to auth user in controller
        ];

        $response = $this->actingAs($this->dosenUser)
            ->post(route('front.internships.guidance-classes.store'), $classData);

        $this->assertDatabaseHas('guidance_classes', [
            'title' => 'Dosen Created Class',
            'lecturer_id' => $this->dosenUser->id,
        ]);
        $createdClass = GuidanceClass::where('title', 'Dosen Created Class')->first();
        $response->assertRedirect(route('front.internships.guidance-classes.show', $createdClass->id));
        $response->assertSessionHas('success');
    }

    public function test_dosen_can_view_their_own_guidance_class_details(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->get(route('front.internships.guidance-classes.show', $guidanceClass));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('front/internships/guidance-classes/show')
                ->where('class.id', $guidanceClass->id)
        );
    }

    public function test_dosen_cannot_view_other_dosens_guidance_class_details_directly_if_not_admin(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->get(route('front.internships.guidance-classes.show', $otherGuidanceClass));
        $response->assertStatus(403);
    }

    public function test_dosen_can_edit_their_own_guidance_class(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->get(route('front.internships.guidance-classes.edit', $guidanceClass));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('front/internships/guidance-classes/edit')
                ->where('guidanceClass.id', $guidanceClass->id)
        );
    }

    public function test_dosen_cannot_edit_other_dosens_guidance_class(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->get(route('front.internships.guidance-classes.edit', $otherGuidanceClass));

        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
    }

    public function test_dosen_can_update_their_own_guidance_class(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create();
        $updateData = [
            'title' => 'Updated by Dosen',
            'lecturer_id' => $this->dosenUser->id, // Required by UpdateGuidanceClassRequest
            'start_date' => $guidanceClass->start_date->format('Y-m-d H:i:s'), // Required
            'description' => $guidanceClass->description ?? 'Default description', // Ensure all required fields are present
            'room' => $guidanceClass->room ?? 'D102',
            // end_date is nullable
        ];

        $response = $this->actingAs($this->dosenUser)
            ->put(route('front.internships.guidance-classes.update', $guidanceClass), $updateData);

        $response->assertRedirect(route('front.internships.guidance-classes.show', $guidanceClass->id));
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('guidance_classes', ['id' => $guidanceClass->id, 'title' => 'Updated by Dosen']);
    }

    public function test_dosen_cannot_update_other_dosens_guidance_class(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();
        $updateData = [
            'title' => 'Attempted Update',
            'lecturer_id' => $this->dosenUser->id, // Pass current user's ID
            'start_date' => $otherGuidanceClass->start_date->format('Y-m-d H:i:s'),
        ];

        $response = $this->actingAs($this->dosenUser)
            ->put(route('front.internships.guidance-classes.update', $otherGuidanceClass), $updateData);

        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('guidance_classes', ['id' => $otherGuidanceClass->id, 'title' => 'Attempted Update']);
    }

    public function test_dosen_can_delete_their_own_guidance_class(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->delete(route('front.internships.guidance-classes.destroy', $guidanceClass));

        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('success');
        $this->assertSoftDeleted('guidance_classes', ['id' => $guidanceClass->id]);
    }

    public function test_dosen_cannot_delete_other_dosens_guidance_class(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->delete(route('front.internships.guidance-classes.destroy', $otherGuidanceClass));

        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
        $this->assertNotSoftDeleted('guidance_classes', ['id' => $otherGuidanceClass->id]);
    }

    // Mahasiswa Tests
    public function test_mahasiswa_can_view_guidance_classes_from_their_advisor(): void
    {
        GuidanceClass::factory()->count(2)->for($this->dosenUser, 'lecturer')->create();
        GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->mahasiswaUser)
            ->get(route('front.internships.guidance-classes.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('front/internships/guidance-classes/index')
                ->has('classes', 2)
        );
    }

    public function test_mahasiswa_can_view_details_of_their_advisors_guidance_class(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->mahasiswaUser)
            ->get(route('front.internships.guidance-classes.show', $guidanceClass));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('front/internships/guidance-classes/show')
                ->where('class.id', $guidanceClass->id)
        );
    }

    public function test_mahasiswa_cannot_view_details_of_other_dosens_guidance_class(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->mahasiswaUser)
            ->get(route('front.internships.guidance-classes.show', $otherGuidanceClass));

        $response->assertStatus(403);
    }

    public function test_mahasiswa_cannot_access_create_guidance_class_page(): void
    {
        $response = $this->actingAs($this->mahasiswaUser)
            ->get(route('front.internships.guidance-classes.create'));
        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
    }

    public function test_mahasiswa_cannot_store_guidance_class(): void
    {
        $classData = ['title' => 'Mahasiswa Attempt Class'];
        $response = $this->actingAs($this->mahasiswaUser)
            ->post(route('front.internships.guidance-classes.store'), $classData);
        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('guidance_classes', $classData);
    }

    // Attendance related tests for Dosen
    public function test_dosen_can_generate_qr_code_for_their_class(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create(['qr_code' => null]);

        $response = $this->actingAs($this->dosenUser)
            ->post(route('front.internships.guidance-classes.generate-qr', $guidanceClass));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertNotNull($guidanceClass->fresh()->qr_code);
    }

    public function test_dosen_cannot_generate_qr_code_for_other_dosens_class(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();

        $response = $this->actingAs($this->dosenUser)
            ->post(route('front.internships.guidance-classes.generate-qr', $otherGuidanceClass));

        $response->assertRedirect(route('front.internships.guidance-classes.index'));
        $response->assertSessionHas('error');
    }

    public function test_dosen_can_mark_student_attendance_for_their_class(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create();
        $guidanceClass->students()->attach($this->mahasiswaUser->id); // Ensure student is eligible and record exists

        $response = $this->actingAs($this->dosenUser)
            ->post(route('front.internships.guidance-classes.mark-attendance', [$guidanceClass, $this->mahasiswaUser]));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseHas('guidance_class_attendance', [
            'guidance_class_id' => $guidanceClass->id,
            'user_id' => $this->mahasiswaUser->id,
            'attendance_method' => 'manual',
        ]);
        $this->assertNotNull(GuidanceClassAttendance::where('guidance_class_id', $guidanceClass->id)
            ->where('user_id', $this->mahasiswaUser->id)->first()->attended_at);
    }

    public function test_dosen_cannot_mark_student_attendance_for_other_dosens_class(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();
        $otherGuidanceClass->students()->attach($this->mahasiswaUser->id);

        $response = $this->actingAs($this->dosenUser)
            ->post(route('front.internships.guidance-classes.mark-attendance', [$otherGuidanceClass, $this->mahasiswaUser]));

        $response->assertStatus(404);
    }

    public function test_dosen_can_reset_student_attendance_for_their_class(): void
    {
        $guidanceClass = GuidanceClass::factory()->for($this->dosenUser, 'lecturer')->create();
        GuidanceClassAttendance::factory()->create([
            'guidance_class_id' => $guidanceClass->id,
            'user_id' => $this->mahasiswaUser->id,
            'attended_at' => now(),
            'attendance_method' => 'qr',
        ]);

        $response = $this->actingAs($this->dosenUser)
            ->delete(route('front.internships.guidance-classes.reset-attendance', [$guidanceClass, $this->mahasiswaUser]));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('guidance_class_attendance', [
            'guidance_class_id' => $guidanceClass->id,
            'user_id' => $this->mahasiswaUser->id,
        ]);
    }

    public function test_dosen_cannot_reset_student_attendance_for_other_dosens_class(): void
    {
        $otherGuidanceClass = GuidanceClass::factory()->for($this->otherDosenUser, 'lecturer')->create();
        GuidanceClassAttendance::factory()->create([
            'guidance_class_id' => $otherGuidanceClass->id,
            'user_id' => $this->mahasiswaUser->id,
            'attended_at' => now(),
        ]);

        $response = $this->actingAs($this->dosenUser)
            ->delete(route('front.internships.guidance-classes.reset-attendance', [$otherGuidanceClass, $this->mahasiswaUser]));

        $response->assertStatus(404);
    }
}
