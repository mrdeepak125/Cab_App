const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  carCompany: String,
  carModel: String,
  carYear: Number,
  carFuelType: String,
  carSeater: Number,
  carImage: String,
  carStatus: { type: String, default: 'not-available' }
});

module.exports = mongoose.model('Car', carSchema);
