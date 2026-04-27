# Real-Time Auction System

A comprehensive full-stack real-time auction platform featuring a robust Java Spring Boot backend and a modern, responsive Vanilla JavaScript frontend.

## 🚀 Key Features

- **Multi-Role User System**: Supports `BUYER`, `SELLER`, and `ADMIN` roles with dedicated dashboard capabilities.
- **Dynamic Auction Management**:
  - Sellers can list products with base prices and automated start/end times.
  - Automatic auction closure via a background scheduler (every 10 seconds).
  - Manual auction closing capability for administrators/sellers.
- **Real-Time Bidding Engine**:
  - Instant bid updates across all connected clients using **WebSockets (STOMP/SockJS)**.
  - Smart bidding rules: prevents owners from bidding on their own items, enforces minimum increments (₹100), and validates bid timing.
- **Interactive Frontend**:
  - Live countdown timers for active auctions.
  - Real-time price updates on the dashboard and product pages.
  - Personalized filters for "My Winning Bids" and "My Listed Auctions".
  - Toast notifications for user feedback and bid status.
- **Dashboard Stats**: Quick view of total active auctions and user-specific winning statistics.

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.4.1
- **Language**: Java 17
- **Security**: Simplified (SecurityAutoConfiguration excluded for direct role-based logic)
- **Database**: MySQL 8.0 with Hibernate/JPA
- **Messaging**: Spring WebSocket with STOMP sub-protocol
- **Scheduling**: Spring `@Scheduled` for background task processing
- **Build Tool**: Maven

### Frontend
- **UI/UX**: HTML5, CSS3 (Modern dark-themed UI with Flexbox/Grid)
- **Logic**: Vanilla JavaScript (ES6+)
- **Real-time**: SockJS and Stomp.js clients
- **Icons/Styles**: Custom CSS variables for consistent branding

## 📂 Project Structure

```text
auction-system--/
├── backend/
│   ├── src/main/java/com/auction/auction_system/
│   │   ├── config/             # WebSocket configuration
│   │   ├── controller/         # REST & WebSocket endpoints
│   │   ├── model/              # JPA Entities (User, Product, Bid)
│   │   ├── repository/         # Data Access Objects
│   │   └── service/            # Business logic & Scheduler
│   └── src/main/resources/     # application.properties & SQL scripts
└── frontend/
    ├── css/style.css           # Modern dark UI styles
    ├── js/app.js               # Core frontend logic & WS client
    ├── home.html               # Main dashboard
    ├── login.html              # User authentication
    ├── product.html            # Detailed auction & bidding view
    └── register.html           # New user sign-up
```

## 🔌 API Endpoints (Highlights)

### User Management
- `POST /users/register`: Create a new account.
- `POST /users/login`: Authenticate and receive session details.
- `GET /users/dashboard`: Fetch role-specific welcome info.

### Auction Management
- `POST /products/add?userId={id}`: List a new product for auction.
- `GET /products/all`: Fetch all active and closed auctions.
- `GET /products/status/{id}`: Detailed state tracking (Pending/Running/Ended).
- `GET /products/winner/{id}`: Retrieve the winner for a completed auction.

### Bidding
- `POST /bids/place`: Place a competitive bid (requires `productId`, `userId`, and `amount`).
- `GET /bids/product/{id}`: View full bid history for a specific item.
- `GET /bids/my-wins?userId={id}`: View list of won products.

## ⚙️ Setup & Installation

### 1. Database Setup
Create a MySQL database named `auction_db`. The system will automatically generate tables on first run.
```sql
CREATE DATABASE auction_db;
```

### 2. Configuration
Verify `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/auction_db
spring.datasource.username=root
spring.datasource.password=Mighty12
```

### 3. Run the System
Use the provided root-level script:
```bash
./run.sh
```
Or use the manual Maven command in the backend folder:
```bash
./mvnw spring-boot:run
```

### 4. Usage
Open `frontend/login.html` in any modern browser. 
*Note: For testing real-time features, open two different browsers to simulate different users.*

## 📝 License
Educational Open Source project.
