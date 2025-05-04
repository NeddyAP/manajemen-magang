# Technical Context

This document outlines the technical stack, dependencies, development setup, and testing strategy for the internship management system (Manajement Magang).

## Core Technologies

*   **Backend Framework:** Laravel 12.x
*   **Frontend Library/Framework:** React 18+ with TypeScript
*   **Server-Client Integration:** Inertia.js
*   **Database:** MySQL / MariaDB (Primary), SQLite (for Testing)
*   **Styling:** Tailwind CSS
*   **UI Component Library:** Shadcn UI
*   **Build Tool:** Vite
*   **Testing Framework:** Pest PHP

## Development Environment Setup

### Requirements

*   PHP 8.2+
*   Node.js (Latest LTS recommended, check `package.json` engines if specified)
*   Composer (PHP package manager)
*   NPM or Yarn (Node.js package manager)
*   A local web server environment (e.g., Laragon, Herd, Valet, Docker)
*   Database Server (MySQL/MariaDB)

### Installation Steps

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Install PHP dependencies: `composer install`
4.  Install Node.js dependencies: `npm install` (or `yarn install`)
5.  Copy `.env.example` to `.env`.
6.  Generate application key: `php artisan key:generate`
7.  Configure database connection details in `.env` (DB\_HOST, DB\_PORT, DB\_DATABASE, DB\_USERNAME, DB\_PASSWORD).
8.  Run database migrations: `php artisan migrate`
9.  (Optional) Seed the database: `php artisan db:seed`
10. Build frontend assets: `npm run build` (for initial setup/production) or `npm run dev` (for development).
11. Link storage: `php artisan storage:link`

## Key Dependencies

### Backend (composer.json)

*   `laravel/framework`: ^12.0
*   `inertiajs/inertia-laravel`: ^2.0
*   `spatie/laravel-permission`: ^6.16 (Roles & Permissions)
*   `tightenco/ziggy`: ^2.4 (Share Laravel routes with JS)
*   `laravel/sanctum`: (API authentication - potentially used by Fortify)
*   `laravel/fortify`: (Backend authentication logic - adapted for Inertia)
*   **Dev:**
    *   `pestphp/pest`: ^2.0 (Testing Framework)
    *   `pestphp/pest-plugin-laravel`: ^2.0
    *   `laravel/pint`: ^1.18 (Code Style)
    *   `barryvdh/laravel-debugbar`: ^3.15 (Debugging)
    *   `fakerphp/faker`: ^1.23 (Data seeding)

### Frontend (package.json)

*   `react`: ^18.x
*   `react-dom`: ^18.x
*   `typescript`: ^5.x
*   `@inertiajs/react`: ^1.x
*   `tailwindcss`: ^3.x
*   `@vitejs/plugin-react`: ^4.x
*   `shadcn-ui`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, etc. (Core Shadcn UI dependencies)
*   `axios`: ^1.x (HTTP client, used by Inertia)
*   `sonner`: (Toast notifications)
*   **Dev:**
    *   `vite`: ^5.x
    *   `eslint`: ^8.x / ^9.x
    *   `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`
    *   `postcss`, `autoprefixer`

## Architecture Overview

*   **Database:** Schema defined via Laravel Migrations (`database/migrations/`). Eloquent ORM used for interaction.
*   **File Storage:** Configured in `config/filesystems.php`. Uses `local` disk for general storage and `public` disk for web-accessible files (linked via `php artisan storage:link`). Uploads typically stored in `storage/app/`.
*   **Authentication:** Laravel Fortify provides backend logic (registration, login, password reset), adapted for Inertia flows. Session-based authentication.
*   **Authorization:** `spatie/laravel-permission` manages roles and permissions assigned to users. Middleware and Gates/Policies control access.
*   **Frontend:** React components (`resources/js/`) rendered via Inertia. Vite bundles assets (`public/build/`). Tailwind CSS utility classes used for styling. Shadcn UI provides pre-built, customizable components.

## Development Workflow

### Common Commands

```bash
# Start Vite dev server (hot module replacement)
npm run dev

# Start Laravel development server
php artisan serve

# Run database migrations
php artisan migrate
php artisan migrate:fresh # Drop all tables and re-run migrations
php artisan migrate:fresh --seed # ...and run seeders

# Run database seeders
php artisan db:seed
php artisan db:seed --class=SpecificSeeder

# Run Pest tests
php artisan test
php artisan test --filter=AuthenticationTest # Run specific test file/method
php artisan test --coverage # Run tests with code coverage (requires Xdebug/PCOV)

# Run Laravel Pint code formatter
./vendor/bin/pint

# Run ESLint code linter
npm run lint # (Assuming a script is defined in package.json)

# Build frontend assets for production
npm run build
```

### Code Quality

*   **PHP:** Laravel Pint (`pint.json` configuration) enforces PSR-12 style. Run `./vendor/bin/pint`.
*   **TypeScript/JavaScript:** ESLint (`eslint.config.js` configuration) checks for code quality and potential errors. Run `npm run lint`.

## Testing Strategy

*   **Framework:** Pest PHP (`phpunit.xml` configuration).
*   **Environment:** Configured to use SQLite with the `:memory:` database for tests (`phpunit.xml`). This ensures tests run quickly and in isolation without affecting the development database.
*   **Primary Type:** Feature Tests (`tests/Feature/`). These simulate user interactions via HTTP requests and assert responses, database state, and Inertia props.
*   **Setup:** The `RefreshDatabase` trait is used in test classes to manage database state between tests. Factories (`database/factories/`) are used to create test data.
*   **Coverage:** Aiming for high coverage of critical paths, especially Authentication, Authorization, and core CRUD operations. Run `php artisan test --coverage` to generate a report.
*   **Frontend Testing:** Currently not implemented. Potential future addition using tools like Vitest or React Testing Library.

## Security Considerations

*   Standard Laravel security features are leveraged (CSRF protection, XSS filtering via Blade/React, SQL injection prevention via Eloquent).
*   Input validation is strictly enforced using Laravel Form Requests.
*   Authorization rules (Roles/Permissions) prevent unauthorized access to data and actions.
*   File uploads are validated for type and size. Sensitive files should ideally be stored on the `local` disk, not `public`.
*   Regularly update dependencies (Composer & NPM) to patch security vulnerabilities.

## Performance Considerations

*   **Frontend:** Vite provides fast HMR during development and optimized builds (code splitting, tree shaking) for production.
*   **Backend:**
    *   Database query optimization (avoid N+1 problems using eager loading - `with()`).
    *   Caching (Laravel's cache system - Redis/Memcached recommended for production) can be implemented for frequently accessed data or complex queries.
    *   Queues (Laravel Queues) can be used for time-consuming tasks (e.g., sending emails, complex report generation) to improve web request response times.
*   **Image Optimization:** Ensure images used in the frontend are appropriately sized and compressed.
