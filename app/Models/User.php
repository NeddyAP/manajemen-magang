<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'google_id',
        'google_token',
        'google_refresh_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'avatar',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['avatar_url'];

    /**
     * Get the URL to the user's avatar.
     */
    protected function avatarUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(get: function () {
            return $this->avatar ? Storage::url($this->avatar) : null;
        });
    }

    // Profiles
    public function adminProfile(): HasOne
    {
        return $this->hasOne(AdminProfile::class);
    }

    public function dosenProfile(): HasOne
    {
        return $this->hasOne(DosenProfile::class);
    }

    public function mahasiswaProfile(): HasOne
    {
        return $this->hasOne(MahasiswaProfile::class);
    }

    protected function profile(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(get: function () {
            if ($this->hasRole('admin') || $this->hasRole('superadmin')) {
                return $this->adminProfile;
            } elseif ($this->hasRole('dosen')) {
                return $this->dosenProfile;
            } elseif ($this->hasRole('mahasiswa')) {
                return $this->mahasiswaProfile;
            }

            return null;
        });
    }

    // --- Mahasiswa Specific Relationships ---

    /**
     * Get the internships for the user (only if Mahasiswa).
     */
    public function internships(): HasMany
    {
        if ($this->hasRole('mahasiswa')) {
            return $this->hasMany(Internship::class);
        }

        // Return empty relationship query if not a mahasiswa
        return $this->hasMany(Internship::class)->whereRaw('1 = 0');
    }

    /**
     * Get the reports for the user (only if Mahasiswa).
     */
    public function reports(): HasMany
    {
        if ($this->hasRole('mahasiswa')) {
            // Assuming Report model has a user_id linking to the student
            return $this->hasMany(Report::class);
        }

        // Return empty relationship query if not a mahasiswa
        return $this->hasMany(Report::class)->whereRaw('1 = 0');
    }

    /**
     * Get the guidance class attendance records for the user (only if Mahasiswa).
     */
    public function guidanceClassAttendance(): HasMany
    {
        if ($this->hasRole('mahasiswa')) {
            // Assuming GuidanceClassAttendance has a user_id linking to the student
            return $this->hasMany(GuidanceClassAttendance::class);
        }

        // Return empty relationship query if not a mahasiswa
        return $this->hasMany(GuidanceClassAttendance::class)->whereRaw('1 = 0');
    }

    // --- Dosen Specific Relationships ---

    /**
     * Get the MahasiswaProfiles advised by this lecturer user (only if Dosen).
     */
    public function advisees(): HasMany // Returns HasMany<MahasiswaProfile>
    {
        if ($this->hasRole('dosen')) {
            // MahasiswaProfile's advisor_id links to Dosen's User ID (this user's id)
            return $this->hasMany(MahasiswaProfile::class, 'advisor_id', 'id');
        }

        // Return an empty relationship query if not a dosen
        return $this->hasMany(MahasiswaProfile::class, 'advisor_id', 'id')->whereRaw('1 = 0');
    }

    /**
     * Get the guidance classes created by this user (only if Dosen).
     */
    public function createdGuidanceClasses(): HasMany
    {
        if ($this->hasRole('dosen')) {
            // Assuming GuidanceClass has a 'creator_id' linking to the Dosen's user_id
            return $this->hasMany(GuidanceClass::class, 'creator_id', 'id');
        }

        // Return empty relationship query if not a dosen
        return $this->hasMany(GuidanceClass::class, 'creator_id', 'id')->whereRaw('1 = 0');
    }

    /**
     * Get the reports submitted by advisees of this user (only if Dosen).
     * Returns a Query Builder instance.
     */
    public function advisedReports(): Builder
    {
        if ($this->hasRole('dosen')) {
            // Get IDs of advisee users (MahasiswaProfile user_id)
            $adviseeUserIds = $this->advisees()->pluck('user_id');

            // Get reports belonging to those users
            return Report::query()->whereIn('user_id', $adviseeUserIds);
        }

        // Return an empty query builder if not a dosen
        return Report::query()->whereRaw('1 = 0');
    }

    /**
     * Get the logbooks submitted by advisees of this user (only if Dosen).
     * Returns a Query Builder instance.
     */
    public function advisedLogbooks(): Builder
    {
        if ($this->hasRole('dosen')) {
            // Get IDs of advisee users (MahasiswaProfile user_id)
            $adviseeUserIds = $this->advisees()->pluck('user_id');
            // Get internship IDs for those users
            $internshipIds = Internship::query()->whereIn('user_id', $adviseeUserIds)->pluck('id');

            // Get logbooks belonging to those internships
            return Logbook::query()->whereIn('internship_id', $internshipIds);
        }

        // Return an empty query builder if not a dosen
        return Logbook::query()->whereRaw('1 = 0');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }
}
