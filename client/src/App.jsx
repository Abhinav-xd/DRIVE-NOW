import React, { useState, useEffect } from 'react';
import { Calendar, Car, User, LogOut, Menu, X, Search, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function VehicleRentalApp() {
  const [currentView, setCurrentView] = useState('home');
  const [vehicles, setVehicles] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth states
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // Booking states
  const [bookingForm, setBookingForm] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      fetchVehicles();
    }
  }, [token]);

  useEffect(() => {
    if (user && currentView === 'my-rentals') {
      fetchMyRentals();
    }
  }, [currentView, user]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/vehicles`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchMyRentals = async () => {
    try {
      const response = await fetch(`${API_URL}/rentals/my-rentals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMyRentals(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentView('home');
        fetchVehicles();
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      alert('Error during authentication');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('home');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/rentals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle._id,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Booking successful!');
        setSelectedVehicle(null);
        setBookingForm({ startDate: '', endDate: '' });
        fetchVehicles();
        setCurrentView('my-rentals');
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch (error) {
      alert('Error during booking');
    }
  };

  const cancelRental = async (rentalId) => {
    if (!window.confirm('Are you sure you want to cancel this rental?')) return;
    
    try {
      const response = await fetch(`${API_URL}/rentals/${rentalId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        alert('Rental cancelled successfully');
        fetchMyRentals();
        fetchVehicles();
      }
    } catch (error) {
      alert('Error cancelling rental');
    }
  };

  const calculateDays = () => {
    if (bookingForm.startDate && bookingForm.endDate) {
      const start = new Date(bookingForm.startDate);
      const end = new Date(bookingForm.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesType = filterType === 'all' || vehicle.type === filterType;
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Login/Register View
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">DriveNow</h1>
            <p className="text-gray-600 mt-2">Your premium vehicle rental service</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                authMode === 'login'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                authMode === 'register'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder="Full Name"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
            {authMode === 'register' && (
              <input
                type="tel"
                placeholder="Phone Number"
                value={authForm.phone}
                onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105"
            >
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main App View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">DriveNow</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              <button
                onClick={() => setCurrentView('home')}
                className={`font-medium transition ${
                  currentView === 'home' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Browse Vehicles
              </button>
              <button
                onClick={() => setCurrentView('my-rentals')}
                className={`font-medium transition ${
                  currentView === 'my-rentals' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                My Rentals
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden border-t py-4 space-y-2">
              <button
                onClick={() => { setCurrentView('home'); setShowMobileMenu(false); }}
                className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Browse Vehicles
              </button>
              <button
                onClick={() => { setCurrentView('my-rentals'); setShowMobileMenu(false); }}
                className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                My Rentals
              </button>
              <div className="px-4 py-2 text-gray-600">
                Logged in as: {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 mb-8 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Ride</h2>
              <p className="text-lg opacity-90">Choose from our premium selection of vehicles</p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-10 pr-8 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map(vehicle => (
                <div key={vehicle._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                  <div className="relative h-48 bg-gray-200">
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                    {!vehicle.available && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Rented
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{vehicle.name}</h3>
                    <p className="text-gray-600 mb-4">{vehicle.brand} • {vehicle.year}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vehicle.features?.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">${vehicle.pricePerDay}</p>
                        <p className="text-sm text-gray-500">per day</p>
                      </div>
                      <button
                        onClick={() => vehicle.available && setSelectedVehicle(vehicle)}
                        disabled={!vehicle.available}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${
                          vehicle.available
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {vehicle.available ? 'Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No vehicles found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {currentView === 'my-rentals' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Rentals</h2>
            <div className="space-y-4">
              {myRentals.map(rental => (
                <div key={rental._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img 
                      src={rental.vehicleId?.image} 
                      alt={rental.vehicleId?.name}
                      className="w-full md:w-48 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{rental.vehicleId?.name}</h3>
                          <p className="text-gray-600">{rental.vehicleId?.brand}</p>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                          rental.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          rental.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-semibold">{new Date(rental.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-semibold">{new Date(rental.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Total Price</p>
                          <p className="text-2xl font-bold text-indigo-600">${rental.totalPrice}</p>
                        </div>
                        {rental.status === 'pending' && (
                          <button
                            onClick={() => cancelRental(rental._id)}
                            className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                          >
                            Cancel Rental
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {myRentals.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">You don't have any rentals yet</p>
                  <button
                    onClick={() => setCurrentView('home')}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    Browse Vehicles
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedVehicle.name}</h2>
                <p className="text-gray-600">{selectedVehicle.brand} • {selectedVehicle.year}</p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <img 
              src={selectedVehicle.image} 
              alt={selectedVehicle.name}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingForm.startDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  min={bookingForm.startDate || new Date().toISOString().split('T')[0]}
                  value={bookingForm.endDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              {calculateDays() > 0 && (
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Days:</span>
                    <span className="font-semibold">{calculateDays()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Price per day:</span>
                    <span className="font-semibold">${selectedVehicle.pricePerDay}</span>
                  </div>
                  <div className="border-t border-indigo-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        ${calculateDays() * selectedVehicle.pricePerDay}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition transform hover:scale-105"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
