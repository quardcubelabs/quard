# QuardCube Labs Project

This is the QuardCube Labs project, a comprehensive platform for IT solutions and services.

## Authentication Setup

### Supabase Redirect URLs Configuration

To ensure proper authentication redirects, you must configure the redirect URLs in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > URL Configuration
3. Set the Site URL to `https://quardcubelabs-three.vercel.app`
4. Add the following Redirect URLs:
   - `https://quardcubelabs-three.vercel.app/auth/callback`
   - `https://quardcubelabs-three.vercel.app/**` (for all routes)
   - `http://localhost:3000/auth/callback` (for local development)
   - `http://localhost:3000/**` (for all routes in local development)

This configuration is necessary to ensure users are properly redirected after authentication using OAuth providers or magic links.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The project is deployed on Vercel at [https://quardcubelabs-three.vercel.app](https://quardcubelabs-three.vercel.app). 