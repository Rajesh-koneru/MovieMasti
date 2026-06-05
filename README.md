# 🎬 MovieMasti

MovieMasti is a premium, full-stack Movie Ticket Booking Web Application built with a **Spring Boot** backend and a modern **React (Vite)** frontend. It features secure JWT authentication, interactive seat layouts, automated database seeding, a dark/light theme switcher, and an administrative control panel for full system management.

---

## 🚀 Key Features

* **Secure Authentication & User Accounts**
  * Sign Up & Sign In with secure **JWT (JSON Web Token)** authentication.
  * User profile management: update user details and upload profile photos (stored as Base64 strings).
* **Interactive Ticket Booking Flow**
  * Fully interactive visual seat selection layout with real-time seat status (Available, Selected, Booked).
  * Dynamic pricing and total cost calculation.
  * Instant ticket booking validation with success feedback and canvas-confetti celebration.
* **Personalized Dashboard**
  * **Favorites Lists:** Save and track your favorite movies and theaters for quick access.
  * **Booking History:** View details of all your past bookings including ticket counts, seat numbers, showtimes, and booking IDs.
* **Admin Management Portal**
  * Add and manage Movies, Theaters, and Showtimes.
  * View and track all user bookings.
  * View all registered users.
* **Automated DB Seeding**
  * Built-in one-click database seeding script via the navigation bar to instantly populate sample movies, theaters, showtimes, and an admin user.
* **Modern UI/UX**
  * responsive, glassmorphic dark-theme design with a light-theme switcher.
  * Smooth animations, responsive layouts, and modern iconography powered by Lucide React.
* **Deployment Ready**
  * Pre-configured Dockerfile and Docker Compose configurations for quick multi-container setup.

---

## 🛠️ Tech Stack

### Backend
* **Language & Framework:** Java 17, Spring Boot 3.x/4.x
* **Security:** Spring Security with JWT Token Authentication
* **ORM & Database:** Spring Data JPA, Hibernate, MySQL, and H2 (for tests)
* **Build System:** Maven

### Frontend
* **Build Tool & Framework:** Vite, React 19
* **Styling & UI:** Pure CSS (Harmonious CSS Variables, Dark & Light Mode), Canvas Confetti
* **Icons:** Lucide React

---

## 📂 Project Structure

```text
MovieMasti/
├── src/                      # Spring Boot backend source code
│   ├── main/
│   │   ├── java/com/MovieMasti/MovieMasti/
│   │   │   ├── controllers/  # REST Controllers for Movies, Bookings, Shows, etc.
│   │   │   ├── entity/       # JPA Database Entities
│   │   │   ├── services/     # Business logic layers
│   │   │   ├── Security/     # Security configurations & JWT logic
│   │   │   └── DTO/          # Data Transfer Objects
│   │   └── resources/
│   │       ├── application.properties # Server & DB config properties
│   │       └── static/       # Compiled React frontend distribution files
│   └── test/                 # JUnit/Spring Boot integration tests
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components (Admin, Home, Navbar, Bookings, etc.)
│   │   ├── utils/            # API call helpers and shared assets
│   │   ├── App.jsx           # Main App state and routing container
│   │   ├── index.css         # Theme stylesheet and design tokens
│   │   └── main.jsx          # App entrypoint
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── Dockerfile                # Multi-stage Docker build config
├── docker-compose.yml        # Docker compose configuration for Backend & MySQL DB
└── pom.xml                   # Maven project dependencies
```

---

## 🏁 Getting Started & Installation

### Prerequisites
Make sure you have the following installed on your system:
* **Java Development Kit (JDK) 17 or higher**
* **Apache Maven 3.8+**
* **Node.js 18+ & npm**
* **MySQL Server 8.0+** (if running locally without Docker)
* **Docker Desktop** (if running with containers)

---

### Option A: Local Development Setup (Manual)

#### 1. Setup the Database
1. Open your MySQL client and create a new database schema:
   ```sql
   CREATE DATABASE MovieMasti;
   ```
2. Open `src/main/resources/application.properties` and verify/configure the datasource properties to match your MySQL server:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/MovieMasti
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

#### 2. Start the Spring Boot Backend
From the root directory of the project, run:
```bash
mvn clean install -DskipTests
mvn spring-boot:run
```
The backend server will start running on **`http://localhost:8080`**.

#### 3. Start the React Frontend
Navigate to the frontend folder, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The development server will run on **`http://localhost:5173`** (or another port outputted in the console).

---

### Option B: Running with Docker Compose (Recommended)

Docker Compose builds the React frontend static assets, embeds them directly in the Spring Boot static resources folder, builds the backend `.jar` package, and boots the backend application container along with a MySQL database container.

From the root directory, simply run:
```bash
docker-compose up --build
```

The application will be accessible unified at: **`http://localhost:8080`**.
* The MySQL container database is accessible on port `3306` with the username `root` and password `Bujji@192921` as configured in the `docker-compose.yml`.

---

## 📋 API Endpoint Summary

All API endpoints are prefixed with `/v1/api`. Secured endpoints require the header `Authorization: Bearer <JWT_TOKEN>`.

### Authentication
* `POST /v1/api/signin` - Register a new user account.
* `POST /v1/api/login` - Authenticate credentials and receive a JWT.
* `POST /v1/api/logout` - Invalidate current session.

### Users
* `GET /v1/api/users` - Get list of all users *(Admin only)*.
* `GET /v1/api/users/{id}` - Fetch details of a specific user.
* `PUT /v1/api/users/{id}` - Update profile details.

### Movies
* `GET /v1/api/movies` - Get all available movies.
* `GET /v1/api/movies/{id}` - Get details of a single movie.
* `POST /v1/api/movies` - Add a new movie *(Admin only)*.

### Theaters
* `GET /v1/api/theaters` - Get list of all theaters.
* `GET /v1/api/theaters/{id}` - Get details of a single theater.
* `POST /v1/api/theaters` - Add a new theater *(Admin only)*.

### Shows & Schedules
* `GET /v1/api/shows` - Get list of all showtimes.
* `GET /v1/api/shows/{id}` - Get details of a show.
* `GET /v1/api/shows/movie/{movieId}` - Get showtimes of a specific movie.
* `GET /v1/api/shows/theater/{theaterId}` - Get showtimes running at a specific theater.
* `POST /v1/api/shows` - Schedule a new show *(Admin only)*.

### Bookings
* `POST /v1/api/bookings` - Book movie ticket seats.
* `GET /v1/api/bookings/user/{userId}` - Get booking history for a user.
* `GET /v1/api/bookings/show/{showId}` - Get all reservations for a show.

---

## ⚡ Setup & Testing via DB Seeding

To get started quickly with mock data:
1. Open the application in your browser.
2. Click the **"Seed Database"** button in the Navbar.
3. This triggers a script that automatically seeds:
   * **Default Admin Account:** Email: `admin@moviemasti.com` | Password: `admin`
   * **Sample Movies:** RRR, Baahubali 2, KGF 2, Dangal, Inception.
   * **Sample Theaters:** PVR Forum Mall, INOX GVK One Mall, Cinepolis Mantra Mall.
   * **Sample Shows:** Populates various show schedules over today, tomorrow, and the day after with prices in INR (₹).
4. You can log in using the credentials `admin@moviemasti.com` / `admin` to access the Admin Panel or register as a new user to test the seat booking flow.
