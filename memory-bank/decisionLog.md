# Decision Log

This document records significant architectural and project decisions, their rationale, and implications.

## Architectural Decisions

### 1. Laravel 12 with React 19 and Inertia.js (2024-07)

**Decision:** Use Laravel 12 as the backend framework with React 19 and Inertia.js for the frontend.

**Rationale:**
- Laravel provides a robust, well-documented PHP framework with excellent ORM, authentication, and authorization capabilities.
- React offers a component-based approach to UI development with excellent performance and ecosystem.
- Inertia.js bridges the gap between Laravel and React, allowing for SPA-like experiences without building a separate API.
- TypeScript adds type safety to the frontend codebase, reducing runtime errors.

**Implications:**
- Developers need to be familiar with both Laravel and React ecosystems.
- The application benefits from Laravel's server-side rendering capabilities while maintaining React's component-based approach.
- Inertia.js simplifies data passing between backend and frontend but requires understanding its specific patterns.

### 2. Role-Based Access Control with Spatie Laravel Permission (2024-07)

**Decision:** Implement role-based access control using the Spatie Laravel Permission package.

**Rationale:**
- The application requires different access levels for different user types (superadmin, admin, dosen, mahasiswa).
- Spatie Laravel Permission is a well-maintained, widely-used package that provides a flexible permission system.
- The package allows for both role-based and permission-based access control.

**Implications:**
- Roles and permissions are stored in the database, allowing for dynamic assignment.
- Authorization can be handled at multiple levels (routes, controllers, views).
- Superadmin role has a bypass implemented in AuthServiceProvider for unrestricted access.

### 3. Testing Strategy: Pest PHP for Backend, Vitest for Frontend (2024-07)

**Decision:** Use Pest PHP for backend testing and plan to implement Vitest with React Testing Library for frontend testing.

**Rationale:**
- Pest PHP provides a more expressive, concise syntax for writing tests compared to PHPUnit.
- Pest is fully compatible with Laravel's testing helpers and assertions.
- Vitest is a modern, fast test runner for JavaScript that works well with React and TypeScript.
- React Testing Library encourages testing components as users would interact with them.

**Implications:**
- Backend tests focus on HTTP requests and database interactions.
- Frontend tests will need to be implemented to cover React components and user interactions.
- The testing strategy provides comprehensive coverage of both backend and frontend code.

### 4. UI Component Library: Shadcn UI with Tailwind CSS (2024-07)

**Decision:** Use Shadcn UI components with Tailwind CSS for styling.

**Rationale:**
- Shadcn UI provides a collection of accessible, customizable components that work well with React.
- Tailwind CSS offers utility-first CSS that speeds up development and ensures consistency.
- The combination allows for rapid UI development with a consistent design language.

**Implications:**
- Developers need to be familiar with Tailwind's utility classes.
- UI components are consistent across the application.
- The application has a modern, responsive design that works well on different screen sizes.

[2025-01-06 12:41:47] - **Mahasiswa Dashboard Removal**

**Decision:** Remove the redundant Mahasiswa Dashboard route and redirect to internships index.

**Rationale:**
- The Mahasiswa Dashboard provided redundant functionality that duplicates the internships index page
- Simplifies the application navigation by reducing unnecessary intermediate pages
- Maintains SEO and user bookmarks by implementing a permanent 301 redirect
- Removes unused controller import to clean up the codebase

**Implementation:**
- Removed `Route::get('/mahasiswa/dashboard', [MahasiswaDashboardController::class, 'index'])` route
- Added `Route::redirect('/mahasiswa/dashboard', '/internships', 301)` for permanent redirect
- Removed unused `use App\Http\Controllers\Front\MahasiswaDashboardController` import

**Implications:**
- Users accessing `/mahasiswa/dashboard` will be automatically redirected to `/internships`
- Search engines will understand this is a permanent move (301 status)
- Reduces maintenance overhead by eliminating duplicate dashboard functionality
- Controller and view files for MahasiswaDashboardController may need cleanup in future tasks
