# Healthcare Connect Frontend

A modern, responsive React application for the Healthcare Connect management system, built with TanStack Router for type-safe routing and optimized user experience.

## 🏥 Overview

The Healthcare Connect Frontend is a comprehensive web application that provides intuitive interfaces for patients, doctors, pharmacists, and administrators to interact with the healthcare management system. Built with modern React patterns and TanStack Router for superior routing capabilities.

## 🌐 Live Application

**Frontend URL**: https://your-frontend-domain.com
**Backend API**: https://healthcare-connect-dwg6.onrender.com
**API Documentation**: https://healthcare-connect-dwg6.onrender.com/api

## 🚀 Features

### Core User Interfaces
- **Patient Portal** - Appointment booking, medical records, prescription management
- **Doctor Dashboard** - Patient management, appointment scheduling, prescription creation
- **Pharmacist Interface** - Medicine inventory, order fulfillment, prescription processing
- **Admin Panel** - User management, system analytics, configuration

### User Experience Features
- **Responsive Design** - Mobile-first approach with seamless desktop experience
- **Real-time Updates** - Live notifications and data synchronization
- **Dark/Light Theme** - User preference-based theming
- **Accessibility** - WCAG 2.1 compliant interface design
- **Progressive Web App** - Offline capabilities and installable

### Advanced Features
- **Video Consultations** - Integrated video calling for doctor appointments
- **AI Chat Assistant** - Intelligent patient support system
- **Real-time Messaging** - Secure communication between users
- **File Upload** - Medical document and image management
- **Data Visualization** - Charts and analytics for health metrics
- **Multi-language Support** - Internationalization ready

## 🛠️ Technology Stack

### Core Technologies
- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **TanStack Router** - File-based, type-safe routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Vite** - Fast build tool and dev server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Storybook** - Component development

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- Modern web browser
- Healthcare Connect Backend API running

## 🔧 Installation

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/tmothykhalayi/healthcare-connect-frontend.git
   cd healthcare-connect-frontend
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # Using yarn
   yarn install
   
   # Using pnpm
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://healthcare-connect-dwg6.onrender.com/api
VITE_API_WEBSOCKET_URL=wss://healthcare-connect-dwg6.onrender.com

# Authentication
VITE_JWT_SECRET=your_jwt_secret_for_client_validation

# Third-party Integrations
VITE_ZOOM_SDK_KEY=your_zoom_sdk_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT=true

# Development
VITE_DEV_TOOLS=true
VITE_LOG_LEVEL=debug
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── charts/          # Data visualization components
├── pages/               # Page components
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── appointments/    # Appointment management
│   ├── patients/        # Patient management
│   ├── doctors/         # Doctor interfaces
│   ├── pharmacy/        # Pharmacy management
│   └── admin/           # Admin panel
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and configurations
│   ├── api/             # API client and endpoints
│   ├── auth/            # Authentication utilities
│   ├── utils/           # Helper functions
│   └── validations/     # Zod schemas
├── store/               # Zustand store definitions
├── styles/              # Global styles and theme
├── types/               # TypeScript type definitions
└── routes/              # TanStack Router route definitions
```

## 🔐 Authentication

The frontend implements JWT-based authentication with automatic token refresh:

### Authentication Flow
1. **Login/Register** - User credentials sent to backend
2. **Token Storage** - Secure storage of access/refresh tokens
3. **Automatic Refresh** - Silent token refresh before expiration
4. **Route Protection** - Role-based route access control

### Protected Routes
```typescript
// Example protected route
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/auth/login',
        search: { redirect: '/dashboard' }
      })
    }
  },
  component: Dashboard
})
```

## 🎨 Theming & Styling

### Tailwind Configuration
The application uses a custom Tailwind configuration with healthcare-focused design tokens:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        medical: {
          emergency: '#dc2626',
          success: '#059669',
          warning: '#d97706',
        }
      }
    }
  }
}
```

### Component Styling
```tsx
// Example styled component
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        {
          'bg-primary-500 text-white hover:bg-primary-600': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        }
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

## 📱 Responsive Design

### Breakpoint Strategy
- **Mobile First** - Base styles for mobile devices
- **Tablet** - `md:` prefix for tablet optimizations
- **Desktop** - `lg:` and `xl:` for desktop layouts
- **Large Screens** - `2xl:` for large desktop displays

### Component Responsiveness
```tsx
// Example responsive component
const AppointmentCard = () => {
  return (
    <div className="
      p-4 
      sm:p-6 
      md:flex md:items-center md:justify-between
      lg:p-8
      bg-white rounded-lg shadow-sm border
    ">
      <div className="md:flex-1">
        <h3 className="text-lg font-semibold md:text-xl">
          Appointment Details
        </h3>
      </div>
      <div className="mt-4 md:mt-0 md:ml-6">
        <Button size="sm" className="w-full md:w-auto">
          View Details
        </Button>
      </div>
    </div>
  )
}
```

## 🧪 Testing

### Unit Testing with Vitest
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Testing with Playwright
```bash
# Run E2E tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed

# Generate test report
npm run test:e2e:report
```

### Component Testing with Storybook
```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:host         # Start dev server accessible on network
npm run dev:https        # Start dev server with HTTPS

# Building
npm run build            # Build for production
npm run preview          # Preview production build
npm run analyze          # Analyze bundle size

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run storybook        # Start Storybook

# Deployment
npm run deploy           # Deploy to production
npm run deploy:staging   # Deploy to staging
```

## 🌐 API Integration

### TanStack Query Setup
```typescript
// lib/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error.status === 404) return false
        return failureCount < 3
      },
    },
  },
})
```

### API Hooks Example
```typescript
// hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi } from '@/lib/api/appointments'

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentsApi.getAll,
  })
}

export const useCreateAppointment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
```

## 🚀 Deployment

### Build for Production
# Build the application
pnpm run build

# Preview the build
pnpm run preview
```

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```
#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
netlify deploy --prod --dir=dist
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Development

### Adding New Routes
```typescript
// routes/appointments/new.tsx
import { createFileRoute } from '@tanstack/react-router'
import { CreateAppointmentForm } from '@/components/appointments/CreateAppointmentForm'

export const Route = createFileRoute('/appointments/new')({
  component: CreateAppointment,
})

function CreateAppointment() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Book New Appointment</h1>
      <CreateAppointmentForm />
    </div>
  )
}
```

### Adding New Components
```typescript
// components/ui/Badge.tsx
import { cn } from '@/lib/utils'
import { VariantProps, cva } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary-100 text-primary-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  className?: string
}

export const Badge = ({ variant, className, children }: BadgeProps) => {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  )
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards
- Use TypeScript for type safety
- Follow React best practices and hooks guidelines
- Implement responsive design patterns
- Write comprehensive tests
- Use semantic commit messages
- Follow the established folder structure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email timothykhalayi@gmail.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- TanStack team for excellent routing and state management tools
- Tailwind CSS for the utility-first CSS framework
- All contributors and healthcare professionals who provided insights

---

**Healthcare Connect Frontend** - Modern, accessible healthcare management interface 🏥⚛️
