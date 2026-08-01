# RentNest - Zero Brokerage Property Platform

RentNest is a modern, full-stack real estate platform inspired by NoBroker and Airbnb. It connects property owners directly with tenants, eliminating middlemen and saving on brokerage fees.

## ✨ Key Features

- **Zero Brokerage Guarantee**: Connect directly with verified owners.
- **Premium UI/UX**: An immersive, stunning interface built with Tailwind CSS, featuring glassmorphism and beautiful hover animations.
- **Dark Mode Support**: A fully integrated, gorgeous dark theme toggle.
- **Advanced Filtering**: Airbnb-style property categories (Apartments, Villas, Rooms, Shops) and quick filters (Verified, Fully Furnished, Immediate Move-in).
- **Interactive Map Search**: Leaflet map integration to view property locations instantly.
- **"Hot Deal" Detection**: Automatically highlights properties priced significantly below the market rate with a pulsing badge.
- **Breathtaking Property Details**: A 5-image asymmetrical grid layout for property media, paired with a sticky contact sidebar.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (for styling and dark mode)
- **React Leaflet** (for interactive mapping)
- **React Router** (for client-side routing)
- **Axios** (for API communication)

### Backend
- **Spring Boot 3** (Java 17)
- **Spring Security & JWT** (Authentication and Authorization)
- **Spring Data JPA** (Hibernate)
- **MySQL Database** (Configured with automated data seeding)
- **Maven** (Dependency management)

## 🚀 Getting Started

### 1. Start the Backend
The backend runs an automated `DataSeeder` on startup that injects 50 diverse properties (Apartments, Villas, Commercial Shops, and PGs) across various cities into the database.

```bash
# Navigate to the backend directory
.\mvnw clean compile
.\mvnw spring-boot:run
```
The backend API will start on `http://localhost:8080`.

### 2. Start the Frontend
```bash
# Navigate to the frontend directory
cd rentnest-frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

## 📸 Screenshots & Highlights
- **Dashboard**: Horizontal scrolling category navigation and dynamic map view.
- **Property Details**: Massive image grid with sticky pricing/contact card.
- **Dark Theme**: Fully responsive dark mode that respects user preferences.

---
*Built with ❤️ for a seamless, brokerage-free rental experience.*
