import { getDb } from '../config/db.js';

const COLLECTION = 'service_categories';

export const ServiceCategory = {
    collection: () => getDb().collection(COLLECTION),

    validate: (data) => {
        const errors = [];
        if (!data.name) errors.push('Name is required');
        if (!data.icon) errors.push('Icon is required');
        return errors;
    },

    createIndexes: async () => {
        const db = getDb();
        await db.collection(COLLECTION).createIndex({ is_active: 1 });
        await db.collection(COLLECTION).createIndex({ display_order: 1 });
    }
};
