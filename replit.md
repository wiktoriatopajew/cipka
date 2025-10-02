# ChatWithMechanic.com

## Overview

ChatWithMechanic.com is a modern web platform that connects vehicle owners with professional mechanics through real-time chat. The platform supports all vehicle types including cars, motorcycles, boats, buses, and construction equipment. Users pay $9.99 for access to instant expert automotive advice from certified mechanics available 24/7.

The application features a futuristic dark theme with neon accents, payment processing capabilities, and real-time chat functionality designed to provide professional automotive consultation services online.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state management with React hooks for local state
- **UI Framework**: Radix UI components with shadcn/ui design system for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens supporting dark-first theme with futuristic aesthetics
- **Component Structure**: Modular component architecture with reusable UI components and page-specific components

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Structure**: RESTful API design with /api prefix for all application routes
- **Development Server**: Vite integration for hot module replacement and fast development builds
- **Storage Interface**: Abstracted storage layer with in-memory implementation (MemStorage) ready for database integration

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Database**: PostgreSQL (via Neon serverless) with connection pooling
- **Schema**: User-based schema with extensible design for chat functionality
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with secure cookie configuration
- **Simple Admin Access**: Basic password-based admin authentication (development-ready)
- **User Management**: User creation and retrieval with username/password storage
- **Authorization Structure**: Role-based access ready for mechanic/customer differentiation

### Design System and User Experience
- **Dark-First Design**: Custom Tailwind configuration with futuristic color palette
- **Component Library**: Comprehensive shadcn/ui component set with custom styling
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Interactive Elements**: Hover effects, animations, and micro-interactions for enhanced UX
- **Chat Interface**: Real-time messaging UI with mechanic assignment and payment integration

## External Dependencies

### Payment Processing
- **Dual Payment Options**: Users can choose between Stripe (credit/debit cards) and PayPal for $9.99 subscription payments
- **Stripe Integration**: Server-side PaymentIntent creation with automatic payment methods, secure verification before subscription activation
- **PayPal Integration**: PayPal SDK integration with server-side order capture and verification flow
- **Payment Security**: All payments verified server-side with hardcoded amounts (no client-side price manipulation), currency validation, and duplicate subscription prevention
- **Payment Modal**: Multi-step payment flow with payment method selection, secure checkout forms, and account creation after successful payment

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migrations and schema management tools

### Development Tools
- **Vite Plugins**: Replit-specific plugins for error handling, cartographer, and dev banner
- **ESBuild**: Fast bundling for production server builds
- **TypeScript**: Full type checking across client and server code

### UI and Styling Dependencies
- **Radix UI**: Comprehensive accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Modern icon library for consistent iconography
- **Google Fonts**: Custom font loading for Inter, Outfit, and JetBrains Mono

### Development Dependencies
- **React Query Dev Tools**: Development utilities for debugging server state
- **React Hook Form**: Form handling with validation support via Hookform resolvers
- **Date-fns**: Date manipulation utilities for timestamps and formatting

### SEO and Marketing Pages
- **SEO Implementation**: React Helmet Async with HelmetProvider for server-side rendering support
- **Vehicle Type Pages**: Dedicated pages for Cars & Trucks, Motorcycles, Boats & Watercraft, Buses, and Construction Equipment
- **Support Pages**: Contact Us, FAQ, How It Works, and Mechanic Verification pages
- **Meta Tag Optimization**: Each page includes comprehensive SEO meta tags (title, description, keywords, Open Graph, Twitter Cards)
- **Professional Content**: Industry-specific content for each vehicle type with clear value propositions and calls-to-action
- **Support Contact**: Standardized support email (support@chatwithmechanic.com) across all pages

## Recent Changes

### Dual Payment Integration (September 29, 2025)
- **Payment Methods**: Implemented dual payment options allowing users to choose between Stripe (credit/debit cards) and PayPal
- **Stripe Security**: Server-side PaymentIntent creation with hardcoded $9.99 amount, automatic payment methods, currency validation (USD), and payment verification before subscription creation
- **PayPal Integration**: Full PayPal SDK integration with server-side order creation and capture flow via blueprint
- **Payment Verification Endpoint**: New `/api/verify-payment-and-subscribe` endpoint that verifies payment server-side (checking status, amount, currency) before creating subscription
- **Security Fixes**: Removed client-side price manipulation vulnerabilities, deprecated insecure `/api/subscriptions` endpoint (returns 410 Gone), added duplicate subscription prevention
- **PaymentModal Updates**: Complete rewrite to support real Stripe payments with Elements, PayPal button integration, payment method selection, and secure payment flow
- **Error Handling**: Optional Stripe/PayPal support - app gracefully handles missing API keys without crashing
- **Known Limitations**: Stripe.js may fail to load in Replit environment due to CSP restrictions; PayPal verification has blueprint constraints (cannot modify paypal.ts)

### SEO Pages Implementation (September 2025)
- **Added 9 SEO-optimized pages**: 5 vehicle type pages and 4 support pages
- **Switched to react-helmet-async**: Proper server-side rendering support for meta tags
- **Updated footer navigation**: All footer links now point to dedicated pages instead of homepage
- **Implemented comprehensive SEO**: Each page includes title, meta description, keywords, Open Graph tags, and Twitter Card tags
- **Professional content creation**: Vehicle-specific content tailored to target audiences
- **Support email standardization**: Updated all contact references to support@chatwithmechanic.com
- **Route configuration**: Added all new pages to App.tsx routing with proper data-testid attributes
- **Testing verification**: All pages tested for proper SEO tag rendering and navigation functionality