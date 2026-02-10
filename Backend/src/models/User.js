import { getDb } from '../config/db.js';

const COLLECTION = 'users';

export const User = {
  collection: () => getDb().collection(COLLECTION),

  validate: (data) => {
    const errors = [];
    if (!data.email) errors.push('Email is required');
    if (!data.password) errors.push('Password is required');
    return errors;
  },

  createIndexes: async () => {
    const db = getDb();
    await db.collection(COLLECTION).createIndex({ email: 1 }, { unique: true });
  }
};
