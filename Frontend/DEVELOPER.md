# Hyderabad Trader - Developer Documentation

## Overview
This project is a React-based landing page for "Hyderabad Trader", a premium stock market and options trading education platform. The design is inspired by modern 3D aesthetics, vibrant pink/red gradients, and sleek layouts.

## Technology Stack
- **Framework**: React.js (via Vite)
- **Styling**: Vanilla CSS (CSS Modules or Global)
- **Icons**: Lucide React (standard for modern apps)
- **Animations**: CSS transitions and Keyframes

## Project Structure
- `src/components/`: Reusable UI components.
- `src/assets/`: Images and branding assets.
- `src/index.css`: Global styles, CSS variables (design tokens).
- `src/App.jsx`: Main application layout.

## Design System
### Colors
- **Primary**: `#E91E63` (Vibrant Pink)
- **Secondary**: `#000000` (Pitch Black)
- **Background**: `#FFFFFF` (White) / `#FFF0F3` (Soft Pink)
- **Text**: `#1A1A1A` (Primary) / `#666666` (Secondary)

### Typography
- **Headings**: Modern sans-serif (e.g., Inter or Outfit)
- **Body**: System UI or Inter

## Security Considerations
- **Input Sanitization**: Ensure any forms (like Contact Us) sanitize inputs to prevent XSS.
- **Content Security Policy (CSP)**: Recommended for production to prevent unauthorized script execution.
- **HTTPS**: Deployment should always use SSL/TLS.
- **Environment Variables**: Never hardcode API keys; use `.env` files.

## Future Integration
The UI is built with placeholder data. Developers can integrate the following:
1. **Auth**: Firebase or Auth0 for membership login.
2. **Payments**: Razorpay or Stripe for pricing plans.
3. **Backend**: Node/Express or Supabase for storing newsletter signups and FAQs.

## How to Run
1. `npm install`
2. `npm run dev`
