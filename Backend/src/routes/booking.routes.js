import express from 'express';
import { createBooking, listBookings, updateBooking, getByWorkerId, getById } from '../controllers/booking.controller.js';
import { queryParser } from '../middlewares/queryParser.js';

const router = express.Router();

// List bookings with query parser
router.get('/', queryParser, listBookings);

// Create a new booking
router.post('/', createBooking);

// Update an existing booking
router.patch('/:id', updateBooking);

// Get bookings for a specific worker profile
router.get('/worker/:workerId', getByWorkerId);

// Get a single booking by id
router.get('/:id', getById);

export default router;
