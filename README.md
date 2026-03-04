🏟️ Turf Booking Web Application

A full-stack Turf Booking Web Application that allows users to sign up, log in, view available turfs, and book turf slots.
Built using Node.js, Express, MongoDB, and Vanilla HTML/CSS/JavaScript with a clear separation between frontend and backend.

**🚀 Features**

🔐 User Authentication

- Signup with name, email, and password

- Login with credential validation

- JWT-based authentication

🏟️ Turf Dashboard

- Displays available turfs with pricing

- User redirected to turf page after successful login

📅 Booking System

- Select turf, time slot, and date

- Booking details stored in MongoDB

🛡️ Session Handling

- JWT token stored in browser

- Protected pages (login required)

🗄️ Database

- MongoDB (Local / Atlas supported)

- Users and bookings stored in collections

**🛠️ Tech Stack**\
Frontend

  HTML5

- CSS3

- JavaScript (Vanilla JS)

Backend

-Node.js

- Express.js

- MongoDB

- Mongoose

- JWT (jsonwebtoken)

- bcrypt (password hashing)

- dotenv

📁 Project Structure
```text
truf-auth/
│
├── backend/
│   ├── controllers/
│   │   └── authController.js
│   ├── models/
│   │   ├── user.js
│   │   └── booking.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── bookingRoutes.js
│   ├── index.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── signup.html
    ├── login.html
    ├── turf.html
    ├── dashboard.html
    ├── script.js
    └── style.css
```

**⚙️ Environment Variables**\

Create a .env file inside the backend folder:
```text
MONGO_URI=mongodb://127.0.0.1:27017/turfDB
JWT_SECRET=mysecretkey
PORT=5000
```

▶️ How to Run the Project

**backend** \
- cd backend
- npm install


**frontend**\
- cd frontend
- npm install


🔄 Application Flow

- User registers via Signup Page

- User logs in via Login Page

- On successful login → redirected to Turf Page

- User selects turf & booking details

- Booking stored in MongoDB

📌 Future Enhancements

- 💳 Payment Gateway Integration

- 📊 Admin Dashboard

- 📆 Slot Availability Check

- 🔐 Role-based Authentication

- 📱 Mobile Responsive UI






