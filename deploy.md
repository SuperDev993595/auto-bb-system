# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with proper client-side routing support.

### Files Added for Deployment:

1. **`vercel.json`** - Configures Vercel to handle client-side routing by redirecting all routes to `index.html`

### Routes Available:

- `/` - Landing page
- `/admin` - Redirects to login
- `/admin/login` - Login page
- `/admin/dashboard` - Main dashboard (overview)
- `/admin/dashboard/appointments` - Appointments management
- `/admin/dashboard/customers` - Customer management
- `/admin/dashboard/services` - Service catalog and work orders
- `/admin/dashboard/invoices` - Invoice management
- `/admin/dashboard/inventory` - Inventory management
- `/admin/dashboard/reports` - Analytics and reporting
- `/admin/dashboard/reminders` - Reminder system
- `/admin/dashboard/contact-logs` - Communication logs
- `/admin/dashboard/tasks` - Task management
- `/admin/dashboard/promotions` - Marketing promotions

### Deployment Steps:

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will automatically detect it's a Vite React project
4. The `vercel.json` configuration will handle routing
5. Deploy!

### Environment Variables:

If you add any environment variables in the future, make sure to set them in Vercel's dashboard under Settings > Environment Variables.

### Build Command:
```bash
npm run build
```

### Output Directory:
```
dist
```

The deployment should now work correctly with all routes accessible directly via URL.
