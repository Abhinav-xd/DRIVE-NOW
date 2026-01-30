const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vehicle-rental';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // car, bike, suv, etc.
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: Number,
  pricePerDay: { type: Number, required: true },
  image: String,
  available: { type: Boolean, default: true },
  features: [String],
  seating: Number,
  transmission: String, // automatic, manual
  fuelType: String
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Rental Schema
const rentalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Rental = mongoose.model('Rental', rentalSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phone });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const { type, available } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (available !== undefined) filter.available = available === 'true';
    
    const vehicles = await Vehicle.find(filter);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create rental (protected)
app.post('/api/rentals', authMiddleware, async (req, res) => {
  try {
    const { vehicleId, startDate, endDate } = req.body;
    
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.available) {
      return res.status(400).json({ error: 'Vehicle not available' });
    }

    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = days * vehicle.pricePerDay;

    const rental = new Rental({
      userId: req.userId,
      vehicleId,
      startDate,
      endDate,
      totalPrice,
      status: 'pending'
    });

    await rental.save();
    
    // Mark vehicle as unavailable
    vehicle.available = false;
    await vehicle.save();

    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's rentals (protected)
app.get('/api/rentals/my-rentals', authMiddleware, async (req, res) => {
  try {
    const rentals = await Rental.find({ userId: req.userId })
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel rental (protected)
app.patch('/api/rentals/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, userId: req.userId });
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    rental.status = 'cancelled';
    await rental.save();

    // Make vehicle available again
    await Vehicle.findByIdAndUpdate(rental.vehicleId, { available: true });

    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed some sample vehicles (for testing)
app.post('/api/seed-vehicles', async (req, res) => {
  try {
    await Vehicle.deleteMany({});
    
    const sampleVehicles = [
      {
        name: 'Tesla Model 3',
        type: 'sedan',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        pricePerDay: 89,
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500',
        available: true,
        features: ['Autopilot', 'Premium Sound', 'Glass Roof'],
        seating: 5,
        transmission: 'automatic',
        fuelType: 'electric'
      },
      {
        name: 'BMW X5',
        type: 'suv',
        brand: 'BMW',
        model: 'X5',
        year: 2023,
        pricePerDay: 120,
        image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500',
        available: true,
        features: ['Leather Seats', '4WD', 'Panoramic Roof'],
        seating: 7,
        transmission: 'automatic',
        fuelType: 'gasoline'
      },
      {
        name: 'Honda Civic',
        type: 'sedan',
        brand: 'Honda',
        model: 'Civic',
        year: 2023,
        pricePerDay: 45,
        image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=500',
        available: true,
        features: ['Fuel Efficient', 'Backup Camera', 'Bluetooth'],
        seating: 5,
        transmission: 'automatic',
        fuelType: 'gasoline'
      },
      {
        name: 'Jeep Wrangler',
        type: 'suv',
        brand: 'Jeep',
        model: 'Wrangler',
        year: 2023,
        pricePerDay: 95,
        image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500',
        available: true,
        features: ['Off-Road Package', 'Removable Top', '4WD'],
        seating: 5,
        transmission: 'automatic',
        fuelType: 'gasoline'
      },
      {
        name: 'Mercedes C-Class',
        type: 'luxury',
        brand: 'Mercedes',
        model: 'C-Class',
        year: 2023,
        pricePerDay: 110,
        image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500',
        available: true,
        features: ['Premium Interior', 'Navigation', 'Heated Seats'],
        seating: 5,
        transmission: 'automatic',
        fuelType: 'gasoline'
      },
      {
        name: 'Toyota Camry',
        type: 'sedan',
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        pricePerDay: 55,
        image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500',
        available: true,
        features: ['Reliable', 'Spacious', 'Safety Features'],
        seating: 5,
        transmission: 'automatic',
        fuelType: 'hybrid'
      }
    ];

    await Vehicle.insertMany(sampleVehicles);
    res.json({ message: 'Sample vehicles created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
