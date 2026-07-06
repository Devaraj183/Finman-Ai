# Aura Wealth - AI Financial Advisor

Aura Wealth is a comprehensive, AI-driven personal finance management application designed to help users track transactions, set saving goals, and receive personalized financial advice. The platform features a rich, responsive user interface and a robust backend to handle secure authentication and data management.

## 🚀 Technology Stack

### Frontend (Client-Side)

The frontend is built for speed, responsiveness, and a highly polished user experience.

*   **React.js (via Vite):** 
    *   **How:** Forms the core of the user interface, utilizing functional components and hooks for state management. Vite is used as the build tool for lightning-fast hot-reloading and optimized production builds.
    *   **Why:** React's component-based architecture makes it easy to build and maintain complex UI elements like the dashboard and AI chatbot.
*   **React Router:**
    *   **How:** Manages navigation between different views (Dashboard, Transactions, Saving Goals, AI Advisor) without reloading the page.
    *   **Why:** Provides a seamless, Single Page Application (SPA) experience.
*   **Axios:**
    *   **How:** Handles all HTTP requests to the backend, including interceptors for managing expired authentication tokens automatically.
    *   **Why:** Offers a simpler, more powerful API compared to the native `fetch` API, especially for handling JSON and error states.
*   **Recharts:**
    *   **How:** Renders interactive, SVG-based charts (like the pie chart for expenses and line charts for historical trends).
    *   **Why:** A highly customizable charting library built specifically for React, making it easy to integrate beautiful data visualizations.
*   **Lucide-React:**
    *   **How:** Provides all the iconography across the application.
    *   **Why:** A beautiful, consistent, and lightweight open-source icon library.
*   **Vanilla CSS & CSS Modules:**
    *   **How:** Used for all styling, including advanced CSS variables for theming, flexbox/grid layouts, and micro-animations.
    *   **Why:** Gives complete control over the bespoke, premium UI (glassmorphism, gradients, hover effects) without the overhead or design constraints of CSS frameworks like Tailwind or Bootstrap.

### Backend (Server-Side)

The backend is designed to be lightweight, fast, and capable of handling AI processing asynchronously.

*   **FastAPI (Python):**
    *   **How:** Serves as the core web framework providing RESTful API endpoints for user management, transactions, and AI insights.
    *   **Why:** FastAPI is incredibly fast (built on Starlette), modern, and natively supports asynchronous programming (`async/await`), which is crucial when making non-blocking calls to AI models.
*   **Uvicorn:**
    *   **How:** Runs the FastAPI application.
    *   **Why:** It is an extremely fast ASGI (Asynchronous Server Gateway Interface) server implementation.
*   **SQLAlchemy & SQLite:**
    *   **How:** SQLAlchemy acts as the Object Relational Mapper (ORM), mapping Python classes to database tables. SQLite is used as the underlying lightweight database.
    *   **Why:** SQLAlchemy prevents SQL injection and speeds up database development. SQLite is perfect for this scale as it requires zero configuration and stores data in a simple local file.
*   **Pydantic:**
    *   **How:** Validates incoming request payloads and serializes outbound responses.
    *   **Why:** Deeply integrated with FastAPI, it ensures data integrity (e.g., ensuring an expense is a number, emails are valid) before the code even executes.
*   **Passlib & JWT (JSON Web Tokens):**
    *   **How:** Passlib hashes passwords before saving them to the database. JWTs are generated upon login and passed in the `Authorization` header for subsequent requests.
    *   **Why:** Ensures secure, stateless authentication. The server doesn't need to remember session IDs, making it scalable and secure.
*   **g4f (GPT4Free) & nest_asyncio:**
    *   **How:** Integrated into an `ai_engine.py` module to handle all AI chatbot conversations and financial insight generation.
    *   **Why:** Provides access to powerful LLMs (Large Language Models) completely free of charge without requiring the user to supply their own OpenAI API keys. `nest_asyncio` is used to allow `g4f`'s internal event loops to run smoothly within FastAPI's async environment.

## 🏗️ Architecture Flow

1.  **User Action:** The user logs an expense on the React frontend.
2.  **API Call:** Axios sends a secure `POST` request with the JWT token to the FastAPI backend.
3.  **Validation:** FastAPI (via Pydantic) verifies the data format.
4.  **Database Transaction:** SQLAlchemy saves the new transaction to the SQLite database.
5.  **AI Trigger:** When navigating to the AI Advisor or Dashboard, the frontend requests insights. The backend uses `g4f` to analyze the recent database transactions and returns personalized financial advice.
6.  **UI Update:** React updates the state and Recharts re-renders the visual graphs to reflect the new financial standing.
