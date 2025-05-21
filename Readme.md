Customer Lead Management System (MERN Stack)

- A full-stack web application to manage customer leads with role-based access control.

Features:

Authentication (JWT)
Role-Based Access (Super Admin, Sub-Admin, Agent)
User Management (Admins Only)
Lead Management (CRUD + Filter + Tag + Assign)
CSV Export
Dashboard with Analytics

Tech Stack:

Frontend: React.js, Tailwind CSS, Axios
Backend: Node.js, Express.js
Database: MongoDB with Mongoose

-> Getting Started
Backend:
````
cd backend
npm install
npm run dev

# Create .env file:
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

Frontend:
````
cd frontend
npm install
npm start

-> Demo Credentials (Optional) : 

- Super Admin: superadmin@example.com / password
- Sub-Admin: subadmin@example.com / password
- Agent: agent@example.com / password