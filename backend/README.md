# Beyond Tasks Backend

A RESTful Backend API built using **Node.js**, **Express.js**, and **MongoDB**. The project includes Authentication, Authorization, Product Management, Task Management, Pagination, and Image Upload using Multer.

---

## 🚀 Features

- User Authentication (Register & Login)
- JWT-Based Authentication
- Role-Based Authorization (Admin & User)
- Task Management CRUD APIs
- Product Management CRUD APIs
- Product Pagination
- Image Upload using Multer
- MongoDB with Mongoose
- Password Hashing using bcryptjs
- Protected Routes
- RESTful API Design

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Multer
- dotenv
- Nodemon
- Postman

---

## 📁 Project Structure

```
backend/
│
├── uploads/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── taskController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Task.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── scripts/
│   │   └── seed.js
│   │
│   └── index.js
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone <repository-url>
```

### Navigate to the Project

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

## ▶️ Run the Project

Development Mode

```bash
npm run dev
```

Production Mode

```bash
npm start
```

---

## 🌱 Seed Database

Populate the database with sample users and tasks.

```bash
npm run seed
```

---

# 🔐 Authentication APIs

## Register User

```
POST /api/auth/register
```

## Login User

```
POST /api/auth/login
```

Returns a JWT token.

---

# ✅ Task APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/tasks | Get All Tasks |
| GET | /api/tasks/:id | Get Task by ID |
| POST | /api/tasks | Create Task |
| PUT | /api/tasks/:id | Update Task |
| DELETE | /api/tasks/:id | Delete Task |

---

# 📦 Product APIs

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/products | Get All Products |
| GET | /api/products/:id | Get Product by ID |
| POST | /api/products | Create Product |
| PUT | /api/products/:id | Update Product |
| DELETE | /api/products/:id | Delete Product |

---

## 📄 Pagination

Retrieve paginated products.

Example:

```
GET /api/products?page=1&limit=5
```

Example Response

```json
{
  "currentPage": 1,
  "totalPages": 2,
  "totalProducts": 10,
  "products": []
}
```

---

## 🖼️ Image Upload

Upload product images using **multipart/form-data**.

Form Data:

| Key | Type |
|------|------|
| name | Text |
| description | Text |
| price | Text |
| category | Text |
| image | File |

Uploaded files are stored inside:

```
uploads/
```

Images can be accessed via:

```
http://localhost:5000/uploads/<filename>
```

---

## 👤 User Roles

### Admin

- Create Products
- View Products
- Update Products
- Delete Products

### User

- Create Products
- View Products

---

## 🔒 Protected Routes

Protected APIs require a JWT token.

Authorization Header:

```
Authorization: Bearer <your_token>
```

---

## 🧪 Testing

All APIs can be tested using **Postman**.

The project includes collections for:

- Authentication APIs
- Task APIs
- Product APIs

---

## 📌 Future Improvements

- Product Search
- Product Filtering
- Product Sorting
- Refresh Tokens
- Email Verification
- Forgot Password
- Request Validation
- Global Error Handling
- API Documentation (Swagger)
- Unit & Integration Tests

---

## 👩‍💻 Developed By

**Hamna**

Backend Internship Project using **Node.js**, **Express.js**, and **MongoDB**.
