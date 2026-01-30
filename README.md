# 🚗 DriveNow - Vehicle Rental Web Application

A modern, full-stack vehicle rental application with a beautiful UI and MongoDB integration for user-specific data management.

## ✨ Features

### Frontend
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📱 **Mobile-First** - Fully responsive on all devices
- 🔐 **Authentication** - Secure login and registration
- 🚙 **Vehicle Browsing** - Search and filter vehicles by type
- 📅 **Booking System** - Easy date selection and price calculation
- 📊 **Rental Management** - View and cancel your bookings
- ⚡ **Real-time Updates** - Instant availability status

### Backend
- 🔒 **JWT Authentication** - Secure token-based auth
- 💾 **MongoDB Integration** - User-specific data storage
- 📝 **RESTful API** - Clean, organized endpoints
- 🔐 **Password Hashing** - bcrypt for secure passwords
- 🎯 **User Isolation** - Each user sees only their rentals

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone or Download the Project

```bash
cd vehicle-rental-app
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create a .env file (optional)
# MONGODB_URI=mongodb://localhost:27017/vehicle-rental
# JWT_SECRET=your-secret-key-here
# PORT=5000

# Start the server
npm start

# Or use nodemon for development
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory (from root)
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/vehicle-rental`

### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update the `MONGODB_URI` in `server/server.js` or create a `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vehicle-rental
   ```

## 📊 Seeding Sample Data

To populate the database with sample vehicles, make a POST request:

```bash
# Using curl
curl -X POST http://localhost:5000/api/seed-vehicles

# Or use Postman/Insomnia to POST to:
# http://localhost:5000/api/seed-vehicles
```

This will create 6 sample vehicles in your database.

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Vehicles
- `GET /api/vehicles` - Get all vehicles (query: type, available)
- `GET /api/vehicles/:id` - Get single vehicle

### Rentals (Protected)
- `POST /api/rentals` - Create new rental
- `GET /api/rentals/my-rentals` - Get user's rentals
- `PATCH /api/rentals/:id/cancel` - Cancel rental

### Utility
- `POST /api/seed-vehicles` - Seed sample vehicles

## 📱 Usage Guide

### 1. First Time Setup
1. Start MongoDB
2. Start the backend server
3. Seed sample vehicles (optional but recommended)
4. Start the frontend
5. Open browser to `http://localhost:3000`

### 2. Register/Login
- Create a new account or login
- Your data is stored securely in MongoDB
- Each user has isolated data

### 3. Browse Vehicles
- View all available vehicles
- Use search to find specific vehicles
- Filter by type (Sedan, SUV, Luxury)

### 4. Book a Vehicle
- Click "Book Now" on any available vehicle
- Select start and end dates
- Review total price
- Confirm booking

### 5. Manage Rentals
- View your bookings in "My Rentals"
- Cancel pending rentals if needed
- Track rental status

## 🎨 UI Features

- **Gradient Backgrounds** - Beautiful color schemes
- **Hover Effects** - Interactive elements with smooth transitions
- **Card Layouts** - Clean, organized information display
- **Responsive Grid** - Adapts to any screen size
- **Modal Dialogs** - Elegant booking interface
- **Status Badges** - Clear visual indicators
- **Mobile Menu** - Hamburger navigation on mobile

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- User data isolation
- Input validation

## 🏗️ Project Structure

```
vehicle-rental-app/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/                # Backend Node.js app
    ├── server.js          # Express server & MongoDB
    └── package.json
```

## 🔧 Customization

### Adding More Vehicles
Edit the sample data in `server/server.js` in the `/api/seed-vehicles` endpoint.

### Changing Colors
Modify Tailwind classes in `client/src/App.jsx`:
- `indigo-600` → your color choice
- Update gradient colors in hero section

### Adding Features
- Payment integration
- Email notifications
- Rating system
- Admin dashboard
- Vehicle reviews

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify port 5000 is available
- Check MongoDB connection string

### Frontend won't connect
- Ensure backend is running on port 5000
- Check CORS settings
- Verify API_URL in App.jsx

### Cannot login/register
- Check MongoDB connection
- Verify JWT_SECRET is set
- Check browser console for errors

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and use this project as a template for your own vehicle rental applications!

## 📧 Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.

---

Built with ❤️ using React, Node.js, and MongoDB
