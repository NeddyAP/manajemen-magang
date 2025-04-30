# Technical Context

This document outlines the technical architecture, dependencies, and development setup for the internship management system.

## Development Environment

### Core Requirements

- PHP 8.2+
- Node.js (for frontend build)
- Composer
- NPM/Yarn

### Primary Dependencies

#### Backend (PHP)

```json
{
    "laravel/framework": "^12.0",
    "inertiajs/inertia-laravel": "^2.0",
    "spatie/laravel-permission": "^6.16",
    "tightenco/ziggy": "^2.4"
}
```

#### Development Dependencies

```json
{
    "barryvdh/laravel-debugbar": "^3.15",
    "fakerphp/faker": "^1.23",
    "laravel/pail": "^1.2.2",
    "laravel/pint": "^1.18"
}
```

## Architecture

### Database Schema

1. **Core Tables**

    - `users` - Base user information
    - `admin_profiles` - Admin-specific details
    - `dosen_profiles` - Lecturer profiles
    - `mahasiswa_profiles` - Student profiles

2. **Internship Management**

    - `internships` - Internship applications and status
    - `logbooks` - Daily activity records
    - `reports` - Internship reports
    - `guidance_classes` - Guidance session management

3. **Support Tables**
    - `tutorials` - Learning materials
    - `faqs` - Frequently asked questions
    - `cache` - System cache
    - `jobs` - Queue management

### File Storage

Configuration in `config/filesystems.php`:

- Default disk: 'local'
- Public disk: For user-accessible files
- Private disk: For sensitive documents
- Supported upload types:
    - PDF documents
    - Office documents (doc, docx, ppt, pptx, xls, xlsx)
    - Archive files (zip, rar)

### Authentication & Authorization

1. **Authentication**

    - Laravel's built-in authentication
    - Session-based auth with Inertia.js
    - Email verification support

2. **Authorization**
    - Role-based access control (RBAC)
    - Defined roles: superadmin, admin, dosen, mahasiswa
    - Permission-based access to resources

### Frontend Architecture

1. **Core Technologies**

    - React with TypeScript
    - Inertia.js for backend communication
    - Tailwind CSS for styling

2. **Component Structure**

    - Layouts
        - AppLayout (Admin)
        - FrontLayout (User)
    - Shared Components
        - DataTable
        - Forms
        - UI Elements

3. **State Management**
    - Inertia.js props
    - React hooks
    - Form handling with validation

## Development Workflow

### Commands

```bash
# Development
npm run dev   # Start Vite development server
php artisan serve  # Start Laravel development server
php artisan queue:work  # Process background jobs

# Database
php artisan migrate  # Run migrations
php artisan db:seed  # Seed database

# Asset Management
npm run build  # Build frontend assets
```

### Code Quality Tools

- Laravel Pint (PHP CS)
- ESLint (JavaScript/TypeScript)
- TypeScript compiler
- Laravel Debugbar

## Testing Strategy

1. **Backend Testing**

    - Feature tests for controllers
    - Unit tests for models
    - Integration tests for file uploads

2. **Frontend Testing**
    - Component testing with React
    - E2E testing consideration

## Security Measures

1. **File Upload Security**

    - File type validation
    - Size restrictions
    - Secure storage paths

2. **Data Protection**

    - CSRF protection
    - XSS prevention
    - SQL injection protection

3. **Access Control**
    - Route middleware
    - Role-based access
    - Resource authorization

## Performance Considerations

1. **Caching**

    - Database query caching
    - File caching
    - Route caching in production

2. **Queue Management**

    - Background job processing
    - Email sending
    - File processing

3. **Asset Optimization**
    - Frontend asset bundling
    - Image optimization
    - Cache headers
