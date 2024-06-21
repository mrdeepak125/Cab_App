const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fromLocation: String,
  toLocation: String,
  pickupDate: String,
  pickupTime: String,
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('Booking', bookingSchema);
