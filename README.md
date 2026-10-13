# GridLog (Power Grid Tracker)

## Product Demo Summary

**The Problem it Solves:** 
GridLog is a comprehensive power grid tracking application designed to help users log, monitor, and analyze electrical outages in their area. In regions with unstable power infrastructure, residents often struggle to keep an accurate historical record of downtimes, making it difficult to anticipate patterns or report precise data. GridLog solves this by providing a centralized platform to record the exact start and end times of outages, alongside geographic location details.

**Intended Users:** 
The primary users of this application are local residents, community administrators, and remote workers who rely heavily on continuous electricity. These users need a reliable, accessible way to track grid reliability over time to manage their workflows, backup power systems (like UPS or portable power stations), and daily routines efficiently.

**Core User Flow and Value:** 
The most important user flow begins with a user securely logging into their account. From there, they access a personal dashboard displaying real-time metrics (e.g., average downtime, total outages this month). The user can then navigate to the "Outages" section to quickly log a new power failure using a streamlined form. The core value provided by GridLog is the transformation of unpredictable power grid behavior into trackable, actionable data, giving users visibility and control over their local energy reliability.

## Team Members
* Alejandro Malvacias (Frontend, UI/UX, Layouts)
* Brian Karim Valenzuela (Accessibility, Feature Integration)
* Michael Miller (Database Architecture, Server Actions)[cite: 6]

## Setup and Local Development Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/karim1311/power-grid-tracker.git](https://github.com/karim1311/power-grid-tracker.git)
   cd power-grid-tracker


Install dependencies:
npm install

Environment Variables:
Create a .env.local file in the root directory and add the following required keys:
AUTH_SECRET="your_generated_auth_secret_here"
DATABASE_URL="your_postgresql_database_connection_string"

Run the development server:
npm run dev

Deployment Instructions
The easiest way to deploy this Next.js app is to use the Vercel Platform[cite: 6].

Push your code to a GitHub repository.

Import the project into your Vercel dashboard.

In the Vercel project settings, navigate to Environment Variables and add both AUTH_SECRET and DATABASE_URL.

Click Deploy. Vercel will automatically build and deploy the application.

API Route & Server Action Documentation
Because this project utilizes the Next.js App Router, the primary method of data mutation and retrieval is handled via Server Actions and Server Components rather than traditional API endpoints.

Authentication API: Handled by NextAuth.js at /api/auth/[...nextauth] for sign-up, login, and session management.

Outages Data:

fetchOutages(): Server function that queries the PostgreSQL database for a paginated list of outages.

createOutage(formData): Server Action triggered by the Log New Outage form. It validates the input and inserts a new record into the database.

Profile Data:

updateUserPreferences(formData): Server Action that updates user-specific settings (like email notifications) in the database based on the active session.

Known Issues or Opportunities
Issue: The email address field in the Profile section is currently disabled and cannot be updated after initial registration.

Opportunity (Future Enhancement): Integrating a real-time email or SMS notification system for the system preferences, alerting users dynamically when a high-priority outage is logged in their sector.

Opportunity: Implementing data visualization charts on the Analytics page to give users a graphical representation of power grid reliability trends over the year.