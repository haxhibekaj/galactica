# Galactica Trade Management System

A space trading and fleet management system built with Laravel, Inertia.js, and React. The application allows users to manage interplanetary trade routes, starship fleets, and monitor space weather conditions.

## Features

### Fleet Management
- Track starships across multiple trade routes
- Real-time 3D visualization of planet locations and routes
- Monitor ship maintenance schedules
- Manage cargo capacity and assignments

### Trade Routes
- Create and manage trade routes between planets
- Automatic travel time calculation based on 3D coordinates
- Resource-specific trade routes
- Weather impact monitoring

### Role-Based Access Control
The system includes three primary roles:

1. **Admin**
   - Full system access
   - Manage users and roles
   - Access to all features

2. **Fleet Manager**
   - Manage starship fleet
   - View trade routes and resources
   - Assign ships to routes
   - Monitor weather conditions

3. **Trader**
   - View starships and trade routes
   - Monitor resource availability
   - View trade agreements
   - Access weather reports

## Technical Stack

- **Backend**: Laravel 11.40.0, PHP 8.4.3
- **Frontend**: Inertia with React
- **3D Visualization**: Three.js
- **UI Components**: Shadcn/ui
- **Forms**: React Hook Form
- **Client-side Validation**: Zod
- **Database**: SQLite

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/haxhibekaj/galactica.git
```

2. Navigate to the project directory
```bash
cd galactica
```

3. Install dependencies
```bash
composer install
npm install
```

4. Setup environment
```bash
cp .env.example .env
```

5. Run migrations and seed the database
```bash
php artisan migrate --seed
```

6. Run the development server
```bash
php artisan serve
```

7. Access the application at http://localhost:8000

## Default Users

When running the migrations and seeding the database, the system comes with three pre-configured users for easier setup:

- **Admin**:
  - Email: admin@galactica.test
  - Password: password

- **Fleet Manager**:
  - Email: fleet@galactica.test
  - Password: password

- **Trader**:
  - Email: trader@galactica.test
  - Password: password


PS. Unfortunately, I forgot to initialize a git repo for this project on the starting day. By the end of Wednesday I had already implemented most of the requested features and just continued working on bugs and the UI. If there was a commit history it'd look something like this:

Monday:          init: initialize project
Tuesday:         feat: create migrations, implement models and controllers for requested features
Wednesday(3pm):  feat: create pages and layouts, implement rbac and landing page
Wednesday(11pm): bug: fix ui bugs across pages and controller bugs
Thursday:        chore: create db seeder, refactor code and rewrite the readme.md file
