<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

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
        ];
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

    public function getProfileAttribute()
    {
        if ($this->hasRole('admin') || $this->hasRole('superadmin')) {
            return $this->adminProfile;
        } elseif ($this->hasRole('dosen')) {
            return $this->dosenProfile;
        } elseif ($this->hasRole('mahasiswa')) {
            return $this->mahasiswaProfile;
        }

        return null;
    }

    public function internships()
    {
        return $this->hasMany(Internship::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
