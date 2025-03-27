<?php

namespace Database\Seeders;

use App\Models\GlobalVariable;
use Illuminate\Database\Seeder;

class GlobalVariableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Social Media Links
        $socialMedia = [
            [
                'key' => 'Facebook Link',
                'slug' => 'facebook_link',
                'value' => 'https://facebook.com/PmbUnida',
                'description' => 'Facebook page URL for the footer',
                'type' => 'social_media',
                'is_active' => true,
            ],
            [
                'key' => 'Twitter Link',
                'slug' => 'twitter_link',
                'value' => 'https://twitter.com/PMBUnidaBogor',
                'description' => 'Twitter profile URL for the footer',
                'type' => 'social_media',
                'is_active' => true,
            ],
            [
                'key' => 'LinkedIn Link',
                'slug' => 'linkedin_link',
                'value' => 'https://www.linkedin.com/in/universitas-djuanda-bogor-a97702172/',
                'description' => 'LinkedIn page URL for the footer',
                'type' => 'social_media',
                'is_active' => true,
            ],
            [
                'key' => 'Instagram Link',
                'slug' => 'instagram_link',
                'value' => 'https://www.instagram.com/faipgunida',
                'description' => 'Instagram profile URL for the footer',
                'type' => 'social_media',
                'is_active' => true,
            ],
            [
                'key' => 'Youtube Link',
                'slug' => 'youtube_link',
                'value' => 'https://www.youtube.com/channel/UC9EKxYOSyg0QtOs8sAXTceQ?view_as=subscriber',
                'description' => 'Youtube channel URL for the footer',
                'type' => 'social_media',
                'is_active' => true,
            ],
        ];

        // Contact Information
        $contactInfo = [
            [
                'key' => 'Address',
                'slug' => 'address',
                'value' => 'Jl. Tol Ciawi No. 1, Ciawi-Bogor, Jawa Barat, Indonesia.',
                'description' => 'Physical address for the footer',
                'type' => 'contact_info',
                'is_active' => true,
            ],
            [
                'key' => 'Email',
                'slug' => 'email',
                'value' => 'filkom@unida.ac.id',
                'description' => 'Contact email for the footer',
                'type' => 'contact_info',
                'is_active' => true,
            ],
            [
                'key' => 'Phone',
                'slug' => 'phone',
                'value' => '02518240773',
                'description' => 'Contact phone number for the footer',
                'type' => 'contact_info',
                'is_active' => true,
            ],
            [
                'key' => 'Copyright',
                'slug' => 'copyright',
                'value' => 'Neddy © 2025. All rights reserved.',
                'description' => 'Copyright text for the footer',
                'type' => 'site_info',
                'is_active' => true,
            ],
        ];

        // Video Tutorial
        $videoTutorial = [
            [
                'key' => 'Panduan Penggunaan Website',
                'slug' => 'panduan_penggunaan_website',
                'value' => 'https://www.youtube.com/embed/90nHmkj8384?si=cqge0jVk45rq9zq9',
                'description' => 'Panduan penggunaan website untuk pengguna baru.',
                'type' => 'video_tutorial',
                'is_active' => true,
            ],
            [
                'key' => 'Panduan Pendaftaran',
                'slug' => 'panduan_pendaftaran',
                'value' => 'https://www.youtube.com/embed/t4WlxEvouIY?si=o4f4yAH-ugeik0I3',
                'description' => 'Panduan pendaftaran untuk calon mahasiswa.',
                'type' => 'video_tutorial',
                'is_active' => true,
            ],
            [
                'key' => 'Panduan Pengajuan Tempat Magang',
                'slug' => 'panduan_pengajuan_tempat_magang',
                'value' => 'https://www.youtube.com/embed/watch?v=t4WlxEvouIY',
                'description' => 'Panduan pengajuan tempat magang untuk mahasiswa.',
                'type' => 'video_tutorial',
                'is_active' => true,
            ],

        ];

        // Insert all the records
        foreach (array_merge($socialMedia, $contactInfo, $videoTutorial) as $variable) {
            GlobalVariable::updateOrCreate(
                ['slug' => $variable['slug']],
                $variable
            );
        }
    }
}
