# 🛒 PERN E-Commerce Platform

A full-stack e-commerce platform built using the **PERN stack** — PostgreSQL, Express.js, React.js, and Node.js. The application provides secure authentication, role-based access control, product management, image uploads, order/task management, and an AI-powered agent for interacting with application features through authorized tools.

---

## 🚀 Features

### 🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Google OAuth authentication
- Password reset / forgot password functionality
- Protected frontend routes
- Authentication middleware
- Role-based authorization
- Separate permissions for **Admin** and **User**
- Secure access to protected APIs

### 👤 User Management

- User profile management
- Admin user management
- View registered users
- Role-based access control
- User-specific data access

### 📦 Product Management

Admins can:

- Create products
- Update products
- Delete products
- Upload product images
- Search/select suitable product images

Users can:

- View products
- View individual product details

Additional functionality:

- Product pagination
- Product search/lookups
- Protected product operations
- Admin-only modification and deletion

### 🛍️ Orders & Tasks

- Order management
- User-specific order access
- Task management
- Protected order and task operations
- Role-based access to application data

### 🤖 AI-Powered Agent

The project also includes an AI-powered agent that can interact with the application through defined tools.

The agent can perform authorized operations such as:

- Create products
- Update products
- Delete products
- Search product images
- Place orders
- Delete orders
- List products
- List orders
- List tasks
- Find users
- Find products

The agent follows the authenticated user's role and permissions and does not perform unauthorized operations.

### 🖼️ Image Handling

- Product image uploads
- Image handling through backend APIs
- Product image selection/search functionality
- Image replacement during product updates

### 📄 Pagination

Product listings support pagination to avoid loading all records at once.

Example:

```text
Current Page: 1
Total Pages: 2
Total Products: 10
```

---

## 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │      React.js       │
                    │   Tailwind CSS      │
                    │     Frontend        │
                    └──────────┬──────────┘
                               │
                               │ HTTP Requests
                               ▼
                    ┌─────────────────────┐
                    │     Express.js      │
                    │       Backend      │
                    │                     │
                    │ Routes & Middleware │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
      Authentication       Products          Orders/Tasks
       & Authorization     Management          Management
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │      Database       │
                    └─────────────────────┘

                               ▲
                               │
                    ┌─────────────────────┐
                    │    AI Agent         │
                    │                     │
                    │ Application Tools   │
                    └─────────────────────┘
```

---

## 🛠️ Technologies Used

### Frontend

- React.js
- Tailwind CSS
- JavaScript
- React Router
- Axios
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express.js
- JavaScript
- JWT
- Google OAuth
- Multer
- RESTful APIs

### Database

- PostgreSQL

### AI

- AI-powered agent
- Function/tool calling
- Application-specific tools
- Role-aware agent instructions

---

## 📁 Project Structure

```text
PERN/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tools/
│   ├── uploads/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── routes/
│   │   └── App.jsx
│   ├── .env
│   └── package.json
│
└── README.md
```

> The exact folder structure may vary depending on the latest project implementation.

---

## 🔑 User Roles

The application supports two main roles.

### Admin

Admins have access to:

```text
✓ View products
✓ Create products
✓ Update products
✓ Delete products
✓ Manage users
✓ View orders
✓ Manage authorized order operations
✓ Use AI agent administrative tools
```

### User

Regular users have access to:

```text
✓ Register/Login
✓ View products
✓ View product details
✓ Manage their own profile
✓ View their own orders
✓ View their own tasks
✓ Place orders
```

Users cannot perform admin-only product modification or deletion operations.

---

## 🔒 Security

The application implements several security mechanisms:

- JWT authentication
- Protected routes
- Authentication middleware
- Role-based authorization
- Password hashing
- Environment variables for sensitive configuration
- User-specific resource access
- Backend permission validation

Sensitive values such as database credentials, JWT secrets, OAuth credentials, and API keys should be stored in environment variables and should **never be committed to GitHub**.

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000

DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id

OPENAI_API_KEY=your_openai_api_key
```

The exact variables may vary depending on the enabled features and deployment configuration.

---

## 💻 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

Navigate into the project:

```bash
cd PERN
```

---

### 2. Setup Backend

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your `.env` file and configure the PostgreSQL database and required API credentials.

Start the backend:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

---

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment variables if required.

Start the frontend:

```bash
npm start
```

The frontend will normally run on:

```text
http://localhost:3000
```

---

## 🗄️ PostgreSQL Database

The project uses **PostgreSQL** as its relational database.

The database contains application data such as:

```text
Users
Products
Orders
Tasks
```

The backend communicates with PostgreSQL through database queries and uses relationships between the application's entities.

---

## 🔄 Authentication Flow

```text
User
 │
 ▼
Login / Register
 │
 ▼
Backend Authentication
 │
 ├── Validate credentials
 │
 └── Generate JWT
 │
 ▼
JWT returned to frontend
 │
 ▼
Authenticated requests
 │
 ▼
Authentication Middleware
 │
 ▼
Role Authorization
 │
 ▼
Protected Resource
```

---

## 🤖 AI Agent Flow

The AI agent works with application-specific tools instead of directly modifying the database.

```text
User Request
     │
     ▼
  AI Agent
     │
     ▼
Understand Request
     │
     ▼
Select Appropriate Tool
     │
     ▼
Extract Parameters
     │
     ▼
Execute Tool
     │
     ▼
Backend Service / API
     │
     ▼
PostgreSQL
     │
     ▼
Tool Result
     │
     ▼
AI Agent
     │
     ▼
User Response
```

The agent also receives the authenticated user's ID and role so that operations can be restricted according to the user's permissions.

---

## 🧰 AI Agent Tools

The agent uses application-specific tools for different operations.

### Product Tools

```text
create product
update product
delete product
search product images
get products
get product by ID
```

### Order Tools

```text
place order
delete order
list orders
```

### Lookup Tools

```text
find users
find products
list products
list orders
list tasks
```

The agent is instructed not to invent product IDs, user IDs, prices, or other application data.

---

## 🌐 API Overview

### Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
```

### Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Other Resources

The backend also provides protected APIs for users, orders, tasks, and AI-agent operations according to the application's implemented routes.

---

## 📱 Responsive UI

The frontend is built with **React.js and Tailwind CSS** and is designed to provide a responsive user experience across different screen sizes.

The application includes interfaces for:

- Authentication
- Product listing
- Product details
- User profile
- User management
- Product management
- Orders
- AI agent interaction

---

## 🚀 Deployment

The frontend can be deployed using platforms such as **Vercel**, while the backend and PostgreSQL database can be deployed using suitable cloud infrastructure.

For production deployment, make sure to configure:

- Production environment variables
- PostgreSQL connection
- CORS configuration
- Frontend API URL
- JWT configuration
- OAuth configuration
- AI API credentials
- File/image storage configuration

---

## 🎯 Project Objectives

The main objectives of this project were to:

- Build a complete full-stack e-commerce application.
- Learn and implement the PERN architecture.
- Work with PostgreSQL databases.
- Build RESTful APIs using Express.js.
- Implement secure authentication and authorization.
- Implement role-based access control.
- Handle file and image uploads.
- Implement pagination.
- Integrate Google authentication.
- Build an AI-powered agent using function/tool calling.
- Connect AI tools with real application functionality.
- Prepare the application for cloud deployment.

---

## 📌 Key Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack application development
- React.js
- Tailwind CSS
- Node.js and Express.js
- PostgreSQL
- REST API development
- JWT authentication
- OAuth
- Middleware
- Role-based authorization
- File uploads
- Pagination
- Database relationships
- AI agents
- Function/tool calling
- API integration
- Production deployment

---

## 👩‍💻 Author

**Hamna Mazher**

Full-Stack Developer Intern  
Interested in **AI Automation, AI Agents, and Full-Stack Development**.

---

## ⭐ Project Status

🚧 **Active Development**

The project is being prepared for production deployment and further improvements.
