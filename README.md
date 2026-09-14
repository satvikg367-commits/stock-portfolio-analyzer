# 📈 Stock Portfolio Analyzer

A secure, modern, full-stack three-tier web application designed to help retail investors track, analyze, and manage their equity holdings and transactions with automated profit & loss calculations, real-time market data integration, and export capabilities.

---

## 🌟 Key Features

- **📊 Comprehensive Portfolio Dashboard**: Real-time summary of total portfolio value, invested amount, overall return, unrealized P&L, sector allocation, and interactive asset charts.
- **💼 Holdings & Transaction Management**: Automated weighted average purchase price, running holdings calculations, and atomic Buy/Sell trade execution with validation.
- **🔒 Enterprise Security**: Stateless **JWT (JSON Web Token)** authentication, salt-based **BCrypt** password hashing, and role-protected endpoints ensuring complete multi-tenant user isolation.
- **📈 Market Data & Analytics**: Live ticker tape and stock price tracking integrated with **IndianAPI**, interactive charts via **Recharts**, and watchlist management.
- **📑 Financial Statements Export**: One-click download of transactions (CSV) and full portfolio summary reports in Excel format (`.xlsx`) generated using **Apache POI**.
- **⚡ Modern Responsive UI**: Built with React 19, Vite, and custom CSS styling with notification toasts powered by Sonner.

---

## 📸 Screenshots

| Dashboard | Holdings |
| :---: | :---: |
| ![Dashboard](dashboard.png) | ![Holdings](holdings.png) |

| Market Explorer | Transaction History |
| :---: | :---: |
| ![Explore](explore.png) | ![Transactions](transactions.png) |

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework / Tooling**: React 19, Vite
- **Routing**: React Router DOM v7
- **Data Visualization**: Recharts
- **HTTP Client**: Axios (with custom JWT interceptors and auto-logout)
- **UI Notifications**: Sonner

### **Backend**
- **Language / Framework**: Java 17, Spring Boot (Spring MVC, Spring Data JPA, Spring Security)
- **Authentication**: JJWT (Java JWT)
- **Persistence & ORM**: Hibernate ORM, MySQL Connector/J
- **Reporting**: Apache POI (5.2.3)
- **Build Tool**: Maven

### **Database**
- **Relational DB**: MySQL (Normalized 3NF schema for Users, Stocks, Transactions, Watchlists, Alerts)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Java JDK 17** or higher
- **MySQL Server** (running locally on port 3306)

---

### 1. Database Setup
Create the MySQL database:
```sql
CREATE DATABASE stock_portfolio;
```
Configure your database credentials in `backend/src/main/resources/application.properties` if different from the default:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/stock_portfolio
spring.datasource.username=root
spring.datasource.password=Root@12345
```

---

### 2. Run the Backend
Navigate to the `backend` directory and start the Spring Boot application:
```bash
cd backend
./mvnw spring-boot:run
```
The REST API server will run at `http://localhost:8080/api`.

---

### 3. Run the Frontend
In a new terminal window, navigate to the `frontend` directory, install dependencies, and start Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 📁 Project Architecture

```
stock-portfolio-analyzer/
├── backend/                  # Spring Boot backend application
│   ├── pom.xml               # Maven dependencies and configuration
│   └── src/main/java/...     # Controllers, Services, Repositories, Entities, Security
├── frontend/                 # React single page application
│   ├── package.json          # Node dependencies and scripts
│   └── src/                  # Components, Pages, Context, Services, Styles
├── report.md                 # Technical project documentation
└── README.md                 # Project README
```

---

## 📝 License
This project is open-source under the MIT License.