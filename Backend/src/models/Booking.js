import { getDb } from '../config/db.js';

const COLLECTION = 'bookings';

export const Booking = {
  collection: () => getDb().collection(COLLECTION),

  validate: (data) => {
    const errors = [];
    if (!data.customer_id) errors.push('Customer ID is required');
    if (!data.worker_id) errors.push('Worker ID is required');
    if (!data.service) errors.push('Service details are required');
    return errors;
  },

  createIndexes: async () => {
    const db = getDb();
    await db.collection(COLLECTION).createIndex({ customer_id: 1 });
    await db.collection(COLLECTION).createIndex({ worker_id: 1 });
  }
};
