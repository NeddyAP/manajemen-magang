# Technical Context

This document outlines the technical stack, dependencies, development setup, and testing strategy for the internship management system (Manajement Magang).

## Core Technologies

- **Backend Framework:** Laravel 12.x
- **Frontend Library/Framework:** React 19+ with TypeScript
- **Server-Client Integration:** Inertia.js
- **Database:** MySQL / MariaDB (Primary), SQLite (for Testing)
- **Styling:** Tailwind CSS v4.x
- **UI Component Library:** Shadcn UI
- **Build Tool:** Vite v6.x
- **Testing Framework:** Pest PHP

## Development Environment Setup

### Requirements

- PHP 8.2+
- Node.js (Latest LTS recommended, check `package.json` for specific version, currently ~22.x)
- Composer (PHP package manager)
- NPM (Node.js package manager, comes with Node.js)
- A local web server environment (e.g., Laragon, Herd, Valet, Docker)
- Database Server (MySQL/MariaDB)

### Installation Steps

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Install PHP dependencies: `composer install`
4.  Install Node.js dependencies: `npm install`
5.  Copy `.env.example` to `.env`.
6.  Generate application key: `php artisan key:generate`
7.  Configure database connection details in `.env` (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD).
8.  Run database migrations: `php artisan migrate`
9.  (Optional) Seed the database: `php artisan db:seed`
10. Build frontend assets: `npm run build` (for initial setup/production) or `npm run dev` (for development).
11. Link storage: `php artisan storage:link`

## Key Dependencies

### Backend (composer.json - `e:\Coding\PHP\Laravel\manajement-magang\composer.json`)

- `php`: ^8.2
- `barryvdh/laravel-dompdf`: ^3.1 (PDF generation)
- `inertiajs/inertia-laravel`: ^2.0
- `laravel/framework`: ^12.0
- `laravel/tinker`: ^2.10.1
- `phpoffice/phpword`: ^1.3 (Word document generation)
- `spatie/laravel-permission`: ^6.16 (Roles & Permissions)
- `tightenco/ziggy`: ^2.4 (Share Laravel routes with JS)
- **Dev:**
    - `barryvdh/laravel-debugbar`: ^3.15 (Debugging)
    - `fakerphp/faker`: ^1.23 (Data seeding)
    - `laravel/pail`: ^1.2.2 (Log tailing)
    - `laravel/pint`: ^1.18 (Code Style)
    - `laravel/sail`: ^1.41 (Docker development environment)
    - `laravel/telescope`: ^5.7 (Debugging & Inspection)
    - `mockery/mockery`: ^1.6 (Mocking library for tests)
    - `nunomaduro/collision`: ^8.6 (Error reporting)
    - `pestphp/pest`: ^3.7 (Testing Framework)
    - `pestphp/pest-plugin-laravel`: ^3.1

### Frontend (package.json - `e:\Coding\PHP\Laravel\manajement-magang\package.json`)

- `react`: ^19.0.0
- `react-dom`: ^19.0.0
- `typescript`: ^5.7.2
- `@inertiajs/react`: ^2.0.0
- `tailwindcss`: ^4.0.0
- `@vitejs/plugin-react`: ^4.3.4
- `shadcn-ui` related (various `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`): (Core Shadcn UI dependencies)
- `lucide-react`: ^0.475.0 (Icons)
- `axios`: (Implicitly used by Inertia, not a direct dependency in `package.json` but fundamental to Inertia's operation)
- `sonner`: ^2.0.1 (Toast notifications)
- `html5-qrcode`: ^2.3.8 (QR Code scanning)
- `qrcode.react`: ^4.2.0 (QR Code generation)
- `date-fns`: ^3.6.0 (Date utility)
- `recharts`: ^2.15.3 (Charting library)
- **Dev:**
    - `vite`: ^6.0
    - `eslint`: ^9.17.0
    - `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin` (via `typescript-eslint` ^8.23.0)
    - `prettier`: ^3.4.2
    - `prettier-plugin-organize-imports`: ^4.1.0
    - `prettier-plugin-tailwindcss`: ^0.6.11

## Architecture Overview

- **Database:** Schema defined via Laravel Migrations (`database/migrations/`). Eloquent ORM used for interaction.
- **File Storage:** Configured in `config/filesystems.php`. Uses `local` disk for general storage and `public` disk for web-accessible files (linked via `php artisan storage:link`). Uploads typically stored in `storage/app/`.
- **Authentication:** Laravel Fortify provides backend logic (registration, login, password reset), adapted for Inertia flows. Session-based authentication.
- **Authorization:** `spatie/laravel-permission` manages roles and permissions assigned to users. Middleware and Gates/Policies control access.
- **Frontend:** React components (`resources/js/`) rendered via Inertia. Vite bundles assets (`public/build/`). Tailwind CSS utility classes used for styling. Shadcn UI provides pre-built, customizable components.

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

- **PHP:** Laravel Pint (`composer.json` script `pint`, uses default Laravel config) enforces PSR-12 style. Run `composer pint` or `./vendor/bin/pint`.
- **TypeScript/JavaScript:** ESLint (`eslint.config.js` configuration) checks for code quality and potential errors. Prettier (`.prettierrc.json` - if present, or `package.json` config) for formatting. Run `npm run lint` and `npm run format`.

## Testing Strategy

- **Framework:** Pest PHP (`phpunit.xml` configuration).
- **Environment:** Configured to use SQLite with the `:memory:` database for tests (`phpunit.xml`). This ensures tests run quickly and in isolation without affecting the development database.
- **Primary Type:** Feature Tests (`tests/Feature/`). These simulate user interactions via HTTP requests and assert responses, database state, and Inertia props.
- **Setup:** The `RefreshDatabase` trait is used in test classes to manage database state between tests. Factories (`database/factories/`) are used to create test data.
- **Coverage:** Aiming for high coverage of critical paths, especially Authentication, Authorization, and core CRUD operations. Run `php artisan test --coverage` to generate a report.
- **Frontend Testing:** Currently not implemented. Potential future addition using tools like Vitest or React Testing Library.

## Security Considerations

- Standard Laravel security features are leveraged (CSRF protection, XSS filtering via Blade/React, SQL injection prevention via Eloquent).
- Input validation is strictly enforced using Laravel Form Requests.
- Authorization rules (Roles/Permissions) prevent unauthorized access to data and actions.
- File uploads are validated for type and size. Sensitive files should ideally be stored on the `local` disk, not `public`.
- Regularly update dependencies (Composer & NPM) to patch security vulnerabilities.

## Performance Considerations

- **Frontend:** Vite provides fast HMR during development and optimized builds (code splitting, tree shaking) for production.
- **Backend:**
    - Database query optimization (avoid N+1 problems using eager loading - `with()`).
    - Caching (Laravel's cache system - Redis/Memcached recommended for production) can be implemented for frequently accessed data or complex queries.
    - Queues (Laravel Queues) can be used for time-consuming tasks (e.g., sending emails, complex report generation) to improve web request response times.
- **Image Optimization:** Ensure images used in the frontend are appropriately sized and compressed.
