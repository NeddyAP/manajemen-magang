# Sistem Manajemen Magang (Manajement Magang)

## Deskripsi

Manajement Magang adalah sistem berbasis web komprehensif yang dirancang untuk menyederhanakan dan mengelola program magang (KKL/KKN) di institusi pendidikan. Sistem ini menyediakan platform terpusat bagi mahasiswa, dosen, dan administrator untuk mengelola seluruh siklus magang, mulai dari pengajuan aplikasi hingga evaluasi laporan akhir.

Sistem ini bertujuan untuk:

- Menyederhanakan proses aplikasi dan persetujuan magang.
- Memfasilitasi pelacakan aktivitas harian melalui logbook mahasiswa.
- Memungkinkan pengiriman, peninjauan, dan umpan balik laporan magang yang efisien.
- Mengelola penjadwalan dan absensi kelas bimbingan.
- Menyediakan manajemen pengguna yang kuat dengan kontrol akses berbasis peran.

## Core Technologies

- **Backend Framework:** [Laravel](https://laravel.com/) 12.x
- **Frontend Library:** [React](https://react.dev/) 19+ with [TypeScript](https://www.typescriptlang.org/)
- **Server-Client Integration:** [Inertia.js](https://inertiajs.com/)
- **Database:** MySQL / MariaDB (Primary), SQLite (for Testing)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4.x
- **UI Component Library:** [Shadcn UI](https://ui.shadcn.com/)
- **Build Tool:** [Vite](https://vitejs.dev/) v6.x
- **Testing Framework:** [Pest PHP](https://pestphp.com/)

## Key Features

### For Students (Mahasiswa)

- Pengajuan aplikasi magang dengan unggah dokumen.
- Entri logbook harian untuk melacak aktivitas.
- Pengiriman laporan magang.
- Melihat jadwal kelas bimbingan dan absensi.
- Menerima notifikasi dalam aplikasi untuk pembaruan status dan pengumuman.
- Mengelola profil pribadi dan pengaturan tampilan.

### For Lecturers (Dosen)

- Mengawasi mahasiswa yang dibimbing.
- Meninjau aplikasi magang mahasiswa.
- Melihat dan memberikan umpan balik/catatan pada logbook mahasiswa.
- Meninjau laporan mahasiswa dan mengunggah versi revisi.
- Menjadwalkan dan mengelola kelas bimbingan, termasuk pelacakan absensi (kode QR & manual).
- Menerima notifikasi dalam aplikasi.
- Mengelola profil pribadi dan pengaturan tampilan.

### For Administrators (Admin)

- Manajemen pengguna penuh (mahasiswa, dosen, admin lain).
- Mengawasi dan memproses aplikasi magang (menyetujui/menolak).
- Memantau aktivitas seluruh sistem dan melihat semua data.
- Mengelola konten sistem: FAQ, Tutorial, Variabel Global.
- Mengelola semua kelas bimbingan.
- Mengakses dasbor administratif dengan statistik sistem.
- Mengelola data yang dihapus sementara (memulihkan/menghapus permanen).
- Menerima notifikasi dalam aplikasi.
- Mengelola profil pribadi dan pengaturan tampilan.

### General Features

- **Kontrol Akses Berbasis Peran (RBAC):** Akses aman berdasarkan peran pengguna (Admin, Dosen, Mahasiswa).
- **Sistem Notifikasi Dalam Aplikasi:** Pembaruan waktu-nyata untuk acara penting dan perubahan status.
- **Manajemen File:** Unggah dan penyimpanan aman untuk aplikasi, laporan, dan dokumen lainnya.
- **Desain Responsif:** Dapat diakses di berbagai perangkat.
- **Pengujian:** Pengujian fitur komprehensif menggunakan Pest PHP untuk memastikan keandalan.

## Getting Started

### Prasyarat

- PHP 8.2+
- Node.js (Latest LTS, e.g., v22.x)
- Composer
- NPM
- A local web server environment (e.g., Laragon, Herd, Valet, Docker)
- Database Server (MySQL/MariaDB)

### Installation

1.  **Clone repositori:**

    ```bash
    git clone https://github.com/NeddyAP/manajemen-magang
    cd manajement-magang
    ```

2.  **Instal dependensi PHP:**

    ```bash
    composer install
    ```

3.  **Instal dependensi Node.js:**

    ```bash
    npm install
    ```

4.  **Siapkan file environment:**
    Salin `.env.example` menjadi `.env` dan konfigurasikan koneksi database Anda serta variabel environment lainnya.

    ```bash
    cp .env.example .env
    ```

5.  **Hasilkan kunci aplikasi:**

    ```bash
    php artisan key:generate
    ```

6.  **Jalankan migrasi database:**

    ```bash
    php artisan migrate
    ```

7.  **(Opsional) Seed database:**

    ```bash
    php artisan db:seed
    ```

8.  **Tautkan penyimpanan (storage link):**

    ```bash
    php artisan storage:link
    ```

9.  **Build aset frontend:**
    Untuk pengembangan (dengan hot module replacement):

    ```bash
    npm run dev
    ```

    Untuk produksi:

    ```bash
    npm run build
    ```

10. **Mulai server pengembangan:**
    ```bash
    php artisan serve
    ```
    Dan di terminal terpisah, jika Anda menjalankan `npm run dev`:
    ```bash
    # Server dev Vite seharusnya sudah berjalan
    ```

Akses aplikasi di browser Anda, biasanya di `http://localhost:8000`.

## Menjalankan Tes

Untuk menjalankan tes otomatis:

```bash
php artisan test
```

Untuk menjalankan tes dengan cakupan kode (code coverage):

```bash
php artisan test --coverage
```

## Penataan Kode (Code Styling)

- **PHP:** Laravel Pint digunakan untuk penataan kode.
    ```bash
    ./vendor/bin/pint
    ```
- **TypeScript/JavaScript:** ESLint dan Prettier digunakan.
    ```bash
    npm run lint
    npm run format
    ```
