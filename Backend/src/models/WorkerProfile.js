import { getDb } from '../config/db.js';

const COLLECTION = 'worker_profiles';

export const WorkerProfile = {
  collection: () => getDb().collection(COLLECTION),

  validate: (data) => {
    const errors = [];
    if (!data.user_id) errors.push('User ID is required');
    return errors;
  },

  createIndexes: async () => {
    const db = getDb();
    await db.collection(COLLECTION).createIndex({ user_id: 1 }, { unique: true });
  }
};
