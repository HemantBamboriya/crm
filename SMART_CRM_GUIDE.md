# CivicCRM - Smart Public Service Platform

A comprehensive web application for managing public service complaints with role-based dashboards, AI-powered risk scoring, community voting, and employee performance tracking.

## System Overview

### Architecture
- **Frontend**: Next.js 16 with React 19, TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: React Context API for authentication
- **Data**: Mock data with full type safety
- **Icons**: Lucide React icons throughout

### Key Features

#### Authentication System
- Role-based login (Citizen, Employee)
- Mock authentication with localStorage persistence
- Protected dashboards with auth checks
- Demo accounts for quick testing

#### Citizen Dashboard
- View and manage personal complaints
- Report new issues with details
- Community voting on complaints
- Statistics and analytics view
- Search and filter functionality

#### Employee Dashboard
- Assigned task management
- Critical priority filtering
- Performance metrics and scoring
- Employee leaderboard
- Resolution efficiency tracking

#### Complaint Management
- Full complaint lifecycle tracking
- AI risk scoring (1-100)
- Status timeline with updates
- Assigned employee information
- Community support voting
- Ticket ID system

#### Data Model
```typescript
User {
  id, name, email, role, joinedDate
}

Complaint {
  id, ticketId, title, description
  category, priority, status
  location, latitude, longitude
  date, votes, aiRiskScore
  assignedEmployeeId, updates, notes
}

Employee {
  id, name, email, department
  assignedComplaints, resolvedCount
  points, avgResolutionTime
}
```

## Pages & Routes

### Public
- `/login` - Authentication page with role selection and demo accounts

### Citizen Routes
- `/dashboard/citizen` - Main citizen dashboard with complaints and stats
- `/report` - Report new issue form
- `/complaint/[id]` - Complaint detail view
- `/map` - Map view of complaints

### Employee Routes
- `/dashboard/employee` - Employee dashboard with tasks and leaderboard
- `/complaint/[id]` - Complaint detail view

### Admin/Public
- `/admin` - Admin analytics dashboard
- `/` - Home page (redirects to login if not authenticated)

## Components

### Core Components
- **Navbar** - Context-aware navigation
- **ComplaintCard** - Complaint display with voting
- **EmployeeScoreCard** - Employee performance card
- **Leaderboard** - Top performers ranking
- **StatusTimeline** - Update history visualization
- **MapView** - Location-based complaint view

### UI Components (shadcn/ui)
- Button, Card, Badge, Input
- Tabs, TabsContent, TabsList, TabsTrigger
- Dialog, Alert, Form components

## Authentication Flow

1. User lands on login page
2. Select role (Citizen/Employee)
3. Enter email or use demo account
4. Auth context stores user in localStorage
5. Redirected to appropriate dashboard
6. Protected routes check authentication

## Data Access

### Mock Data Functions
```typescript
getCitizenComplaintsById(citizenId) - Get user's complaints
getAssignedComplaints(employeeId) - Get employee's tasks
getComplaintById(id) - Get single complaint
getEmployeeById(id) - Get employee details
getLeaderboard() - Get ranked employees
```

## Environment Variables

Create `.env.local` (already created with template):
```
NEXT_PUBLIC_MAP_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_API_URL=http://localhost:3000/api
# Add more as needed
```

## Demo Accounts

Citizen Accounts:
- sarah@example.com
- michael@example.com

Employee Accounts:
- david.rodriguez@city.gov
- emily.watson@city.gov

## Design System

### Color Palette
- **Primary**: Deep Blue (Authority & Trust)
- **Secondary**: Light Blue (Accents)
- **Accent**: Green (Success/Resolved)
- **Destructive**: Red (Urgent/Critical)
- **Neutrals**: Gray scale for text and backgrounds

### Typography
- **Headings**: Geist Sans
- **Body**: Geist Sans
- **Code**: Geist Mono

## Features Deep Dive

### Community Voting
- Citizens can vote on complaints
- Vote count displayed on complaint cards
- Helps prioritize community concerns

### AI Risk Scoring
- Automatic risk assessment (1-100)
- Categories: Low, Medium, High Risk
- Displayed on complaint cards and details

### Employee Performance
- Points-based ranking system
- Resolution count tracking
- Average resolution time metrics
- Leaderboard visualization

### Status Timeline
- Update history for each complaint
- Employee-authored messages
- Timestamp tracking
- Visual progress indicator

## Customization

### Adding New Complaint Categories
Edit `lib/types.ts`:
```typescript
export type ComplaintCategory = 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Parks' | 'Utilities' | 'Other';
```

### Adding Demo Accounts
Edit `lib/mock-data.ts` - add to `mockUsers` array

### Styling Changes
- Color tokens in `app/globals.css`
- Component styles use Tailwind + design tokens
- Dark mode support included

## Development Workflow

1. Clone/download project
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev`
4. Open http://localhost:3000
5. Login with demo account
6. Explore features

## Next Steps for Production

1. Replace mock auth with real authentication
2. Connect to actual database (Supabase, PostgreSQL, etc.)
3. Implement real file uploads for images
4. Add real map integration (Mapbox, Leaflet)
5. API endpoint development
6. Email notifications
7. Real AI/ML risk scoring
8. Payment system (if needed)

## Performance Notes

- Responsive design works on all devices
- Fast load times with optimized imports
- Code splitting with Next.js
- Client-side rendering for interactivity
- Server components for static content

## Accessibility

- Semantic HTML throughout
- ARIA labels where needed
- Color contrast compliance
- Keyboard navigation support
- Screen reader friendly

---

Built with Next.js 16, React 19, and shadcn/ui. Ready for customization and production deployment.
