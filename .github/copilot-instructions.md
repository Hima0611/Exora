# Exora - Exoplanet Explorer Web App

## Project Overview
Exora is a React + Vite space exploration web application focused on exoplanets and astronomical visualization. The app provides interactive features for exploring stars, exoplanets, and space-related data.

## Architecture & Key Components

### Tech Stack
- **Frontend**: React 19.1+ with React Router DOM for navigation
- **Build Tool**: Vite 7.1+ for fast development and builds
- **Animations**: Framer Motion for smooth interactions
- **Backend**: Firebase Firestore for data storage
- **Styling**: CSS modules with component-specific stylesheets

### Project Structure
```
src/
├── components/           # Feature-based component organization
│   ├── header/          # Navigation and hero section
│   ├── features/        # Main feature grid with animated numbers
│   ├── footer/          # Site footer
│   ├── pages/           # Route-specific page components
│   └── starrybg/        # Reusable starry background component
├── assets/              # Images and static resources
├── firebase.js          # Firebase configuration and exports
└── main.jsx             # App entry point with BrowserRouter
```

## Development Workflows

### Commands
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint checking

### Firebase Integration
- Firebase config is in `src/firebase.js` with pre-configured Firestore
- Export pattern: `export const db = getFirestore(app)`
- Database name: `exorablog-601a4`

## Code Conventions

### Component Structure
- Each component has its own directory with `.jsx` and `.css` files
- Example: `components/header/header.jsx` + `components/header/header.css`
- Use React functional components with hooks

### Routing Pattern
- Routes defined in `App.jsx` using React Router DOM
- Homepage combines multiple components: `<Header /> <Features /> <Footer />`
- Feature pages are separate routes (e.g., `/starmap`)

### Animation Patterns
- Custom `AnimatedNumber` component for digit-by-digit number reveals
- Uses `useState` and `useEffect` with timeouts for staggered animations
- Framer Motion for page transitions and complex animations

### Navigation
- `useNavigate()` hook for programmatic navigation
- Example: `const navigate = useNavigate(); navigate("/starmap");`
- Header contains main navigation with anchor links

## Key Features & Pages

### Star Map (`/starmap`)
- Uses `StarryBackground` component for animated star field
- Semi-transparent feature cards with backdrop blur effects
- Overlay content with `absolute` positioning and z-index layering

### Features Component
- Animated statistics display with staggered number reveals
- Grid layout for feature cards
- Navigation handlers for different exploration modes

## Styling Approach
- Component-scoped CSS files
- Mix of traditional CSS and Tailwind-like utility classes
- Backdrop blur effects: `bg-white/20 backdrop-blur-md`
- Space theme with dark backgrounds and star imagery

## Assets & Public Files
- Logo: `src/assets/exo-logo.png`
- Background images in `public/`: earth.png, galaxy.png, mountains.png, night.jpg, sky.png
- Standard favicon and Vite assets

When working on this project, focus on maintaining the space/astronomy theme, smooth animations, and component modularity. Use Firebase for any data persistence needs and follow the established routing patterns for new features.