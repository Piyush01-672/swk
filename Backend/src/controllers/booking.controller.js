import { Booking } from '../models/Booking.js';
import { WorkerProfile } from '../models/WorkerProfile.js';
import { ObjectId } from 'mongodb';

const toObjectId = (id) => {
  try {
    return id ? new ObjectId(id) : null;
  } catch (e) {
    return null;
  }
};

const buildPopulatePipeline = () => ([
  { $lookup: { from: 'services', localField: 'service', foreignField: '_id', as: 'service' } },
  { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
  { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
  { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
  { $lookup: { from: 'worker_profiles', localField: 'worker', foreignField: '_id', as: 'worker_profile' } },
  { $unwind: { path: '$worker_profile', preserveNullAndEmptyArrays: true } },
]);

export const createBooking = async (req, res) => {
  try {
    const { serviceId, customerId, workerId, scheduled_at, address, city, amount } = req.body;

    const doc = {
      service: toObjectId(serviceId),
      customer: toObjectId(customerId),
      worker: toObjectId(workerId),
      status: 'pending',
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      address: address || null,
      city: city || null,
      amount: amount || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const errors = Booking.validate(doc);
    // Note: validate might fail if serviceId etc are null/undefined from doc, so check inputs
    if (!serviceId || !customerId || !workerId) return res.status(400).json({ message: 'Missing required fields' });

    const result = await Booking.collection().insertOne(doc);
    const insertedId = result.insertedId;

    const pipeline = [
      { $match: { _id: insertedId } },
      ...buildPopulatePipeline(),
    ];

    const booking = await Booking.collection().aggregate(pipeline).next();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listBookings = async (req, res) => {
  try {
    const query = req.mongoQuery || {};

    // Special handling for worker_user_id filter which is not a direct field
    if (req.query.worker_user_id) {
      const wp = await WorkerProfile.collection().findOne({ user: toObjectId(req.query.worker_user_id) });
      if (wp) query.worker = wp._id;
      else query.worker = null;
    }

    // Explicitly handle worker: null check from wrapper
    if (req.query.is_worker_null === '1') {
      query.worker = null;
    }

    // Pipeline
    const pipeline = [
      { $match: query },
      ...buildPopulatePipeline(),
      { $sort: { createdAt: -1 } },
    ];

    if (req.query.limit) {
      pipeline.push({ $limit: parseInt(req.query.limit) });
    }

    const bookings = await Booking.collection().aggregate(pipeline).toArray();
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getByWorkerId = async (req, res) => {
  try {
    const { workerId } = req.params;
    const workerObjId = toObjectId(workerId);
    if (!workerObjId) return res.status(400).json({ message: 'Invalid ID' });

    const pipeline = [
      { $match: { worker: workerObjId } },
      ...buildPopulatePipeline(),
      { $sort: { createdAt: -1 } },
    ];

    const results = await Booking.collection().aggregate(pipeline).toArray();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const objId = toObjectId(id);
    if (!objId) return res.status(400).json({ message: 'Invalid id' });

    const pipeline = [
      { $match: { _id: objId } },
      ...buildPopulatePipeline(),
    ];

    const booking = await Booking.collection().aggregate(pipeline).next();
    if (!booking) return res.status(404).json({ message: 'Not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    const objId = toObjectId(id);
    if (!objId) return res.status(400).json({ message: 'Invalid id' });

    // Convert any id fields to ObjectId
    if (updates.service) updates.service = toObjectId(updates.service) || updates.service;
    if (updates.customer) updates.customer = toObjectId(updates.customer) || updates.customer;
    if (updates.worker) updates.worker = toObjectId(updates.worker) || updates.worker;
    delete updates._id;

    const result = await Booking.collection().updateOne({ _id: objId }, { $set: updates });
    if (result.matchedCount === 0) return res.status(404).json({ message: 'Not found' });

    const pipeline = [
      { $match: { _id: objId } },
      ...buildPopulatePipeline(),
    ];

    const updated = await Booking.collection().aggregate(pipeline).next();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
