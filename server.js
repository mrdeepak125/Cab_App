const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Import models
const Booking = require('./models/Booking');
const Contact = require('./models/Contact');
const Car = require('./models/Car');
const Admin = require('./models/Admin');

// Session setup
app.use(session({
  secret: process.env.SECRET_KEY || 'your-default-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production
}));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Secure the admin routes
const requireLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Hardcoded credentials
const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = 'Asus@1234';

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Find the admin document (you can adjust this part based on your actual logic)
    let admin = await Admin.findOne({ username: ADMIN_USERNAME });
    
    if (!admin) {
      // Create an admin document if it doesn't exist
      admin = new Admin({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      await admin.save();
    }

    req.session.userId = admin._id;
    res.redirect('/admin');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/admin', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.post('/admin/add-car', requireLogin, upload.single('carImage'), async (req, res) => {
  const { carCompany, carModel, carYear, carFuelType, carSeater } = req.body;
  const carImage = `/uploads/${req.file.filename}`;

  const newCar = new Car({
    carCompany,
    carModel,
    carYear,
    carFuelType,
    carSeater,
    carImage,
    carStatus: 'not-available' // default status
  });

  try {
    await newCar.save();
    res.send('Car added successfully');
  } catch (err) {
    res.status(500).send('Error adding car');
  }
});

app.get('/admin/cars', requireLogin, async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).send('Error fetching cars');
  }
});

app.patch('/admin/update-car-status/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { carStatus } = req.body;

    const updatedCar = await Car.findByIdAndUpdate(
      id,
      { carStatus },
      { new: true }
    );

    if (updatedCar) {
      res.send('Car status updated successfully');
    } else {
      res.status(404).send('Car not found');
    }
  } catch (err) {
    res.status(500).send('Error updating car status');
  }
});

app.get('/admin/pending-bookings', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pending-bookings.html'));
});

app.get('/admin/pending-bookings/data', requireLogin, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' });
    res.json(bookings);
  } catch (err) {
    res.status(500).send('Error fetching bookings');
  }
});

app.get('/admin/pending-complaints', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pending-complaints.html'));
});

app.get('/admin/pending-complaints/data', requireLogin, async (req, res) => {
  try {
    const complaints = await Contact.find();
    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).send('Error fetching complaints');
  }
});

app.patch('/admin/update-complaint-status/:id', requireLogin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (updatedContact) {
      res.send('Complaint status updated successfully');
    } else {
      res.status(404).send('Complaint not found');
    }
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).send('Error updating complaint status');
  }
});

app.post('/book-cab', async (req, res) => {
  const newBooking = new Booking({
    fromLocation: req.body['from-location'],
    toLocation: req.body['to-location'],
    pickupDate: req.body['pickup-date'],
    pickupTime: req.body['pickup-time']
  });

  try {
    await newBooking.save();
    res.send('Booking saved successfully');
  } catch (err) {
    res.status(500).send('Error saving booking');
  }
});

app.post('/contact', async (req, res) => {
  const newContact = new Contact({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  try {
    await newContact.save();
    res.send('sends complaint');
  } catch (err) {
    res.status(500).send('Error saving contact');
  }
});

app.get('/admin/upload-car-picture', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'upload-car-picture.html'));
});

app.post('/admin/upload-car-picture', requireLogin, upload.single('carPicture'), (req, res) => {
  res.send('File uploaded successfully');
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/service.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'service.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
