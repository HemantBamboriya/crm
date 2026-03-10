# CivicCRM - Setup Guide

## Project Overview

CivicCRM is a modern civic tech platform for citizens to report infrastructure issues and track resolution progress. The app features a professional UI with rich analytics and interactive dashboards.

## Features Built

### 1. **Home Page** (`/`)
- Hero section with compelling call-to-action
- Platform overview with 4 key metrics
- Recent issues showcase
- Call-to-action section
- Responsive footer with navigation

### 2. **Report Issue Page** (`/report`)
- Comprehensive form for reporting issues
  - Title, description, category, location, priority
- Success confirmation screen
- Reporting guidelines sidebar
- FAQ section
- Community impact statistics

### 3. **Track Issues Map Page** (`/map`)
- Interactive map placeholder (ready for Mapbox integration)
- Advanced filtering system
  - Filter by status (Open, In Progress, Resolved)
  - Filter by category (Road, Water, Electricity, Sanitation)
  - Filter by priority (Critical, Medium, Low)
- Search functionality
- Real-time filter statistics
- Complaint listing with status indicators

### 4. **Admin Dashboard** (`/admin`)
- Key performance indicators (KPIs)
- Monthly trend chart (Line chart)
- Issues by category (Pie chart)
- Issues by status (Bar chart)
- Recent reports table
- Export report functionality

### 5. **Reusable Components**
- **Navbar**: Navigation bar with brand and links
- **ComplaintCard**: Beautiful card displaying complaint details
- **KPIStatCard**: Metric card with icon and trend indicator
- **Mock Data**: Pre-populated sample data for demo

## Environment Variables

The app has a `.env.local` file created with the following template:

```env
# Map Configuration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_MAP_CENTER_LAT=40.7128
NEXT_PUBLIC_MAP_CENTER_LNG=-74.0060

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Database Configuration (optional - for future integration)
# DATABASE_URL=your_database_url_here

# Authentication (optional - for future integration)
# AUTH_SECRET=your_secret_key_here
```

### To Add Your Environment Variables:

1. Open `.env.local` in the project root
2. Replace placeholder values with your actual credentials:
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Get from [Mapbox](https://www.mapbox.com/)
   - Other fields can be configured as needed for your backend

3. The app will work without these values, but features requiring them (like the map) will show placeholders

## Design System

### Color Palette (Civic Tech Theme)
- **Primary**: Deep Blue (#1E7A87) - Authority & Trust
- **Secondary**: Light Blue - Accents & Hover States  
- **Accent**: Green (#20B2AA) - Success/Resolved Status
- **Destructive**: Red - Critical/Urgent Issues

### Typography
- Headings: Geist Font
- Body: Geist Font
- Mono: Geist Mono

### Components
- Built with shadcn/ui components
- Using Tailwind CSS for styling
- Responsive design (mobile-first)

## Key Technologies

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Charts**: Recharts (pre-installed)
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Validation**: Zod

## Getting Started

1. **Install dependencies** (auto-installed):
   ```bash
   pnpm install
   ```

2. **Run development server**:
   ```bash
   pnpm dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

4. **Add your environment variables**:
   - Edit `.env.local` with your actual API keys and configuration

## File Structure

```
app/
├── page.tsx              # Home page
├── report/
│   └── page.tsx          # Report issue page
├── map/
│   └── page.tsx          # Track issues page
├── admin/
│   └── page.tsx          # Admin dashboard
├── layout.tsx            # Root layout
└── globals.css           # Global styles & theme

components/
├── navbar.tsx            # Navigation bar
├── complaint-card.tsx    # Complaint card component
├── kpi-stat-card.tsx     # KPI stat card component
└── ui/                   # shadcn/ui components

lib/
└── mock-data.ts          # Sample data for demo

.env.local                # Environment variables template
```

## Future Integration Points

The app is designed to easily integrate with:

1. **Database**: Supabase, Neon, or similar
   - Store complaints and user data
   - Track issue resolution progress

2. **Maps**: Mapbox integration
   - Display complaint locations
   - Geo-filtering and clustering

3. **Authentication**: Auth.js or Supabase Auth
   - User registration and login
   - Role-based access (citizen vs admin)

4. **Backend API**: Node.js, Python, or similar
   - Process complaint submissions
   - Generate analytics reports

5. **File Storage**: Vercel Blob or similar
   - Store complaint images/documents
   - Evidence for reported issues

## Customization

- **Colors**: Edit `/app/globals.css` (CSS variables in `:root`)
- **Copy**: Update text in individual page files
- **Data**: Modify `/lib/mock-data.ts` to add more sample data
- **Components**: Add new components in `/components` folder

## Deployment

To deploy to production:

1. Add your environment variables to the Vercel project settings
2. Connect your GitHub repository
3. Deploy with `vercel deploy`

## Support & Resources

- [Next.js Documentation](https://nextjs.org)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)

---

**Ready to report issues and improve your community!**
