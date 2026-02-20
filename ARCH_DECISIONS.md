# RepLog Architectural Decisions

## Clean Architecture

The application is structured into clearly separated layers to ensure scalability and maintainability:

1. **Domain Layer (`src/domain`)**: Contains the core business entities (`Workout`, `Exercise`, `Set`). These are pure TypeScript interfaces that define the "what" of the application without being tied to any framework or storage mechanism.
2. **Infrastructure Layer (`src/infrastructure`)**: Handles data persistence using IndexedDB (via Dexie.js). This layer implements the storage details and provides the database instance.
3. **Application Layer (`src/application`)**: Acts as a bridge between the Domain and Infrastructure. Services here (like `WorkoutService`) contain the business logic, such as calculating volumes and managing UUID generation.
4. **UI Layer (`src/presentation`)**: The React-based user interface. Components are kept lean, relying on hooks and services for data operations, ensuring no database logic leaks into the UI.

## Offline-First Design

- **IndexedDB**: Chosen over LocalStorage for better performance with large datasets and structured indexing.
- **UUIDs**: All entities use `uuid-v4` for identification. This ensures that when we later add cloud synchronization, there are no ID collisions between different users or devices.
- **PWA**: Integrated with `vite-plugin-pwa` for service worker management, asset caching, and a manifest for a native-like experience on mobile.

## Technology Stack Choices

- **Dexie.js**: A minimal wrapper around IndexedDB that makes it feel like working with a modern ORM.
- **TypeScript**: Used throughout to provide strong typing across layers, specifically for entity shapes and service responses.
- **Vanilla CSS + Modern Tokens**: Custom design system using CSS variables, glassmorphism (`backdrop-filter`), and premium HSL colors to avoid the "generic" look of CSS frameworks while maintaining full control over the aesthetic.
- **Framer Motion**: Leveraged for smooth transitions and interactive micro-animations.
