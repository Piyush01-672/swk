import { ServiceCategory } from '../models/ServiceCategory.js';
import { ObjectId } from 'mongodb';

export const listCategories = async (req, res) => {
    try {
        const query = req.mongoQuery || {};

        // Default sort by display_order
        const categories = await ServiceCategory.collection()
            .find(query)
            .sort({ display_order: 1 })
            .toArray();

        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        let query;
        try {
            query = { _id: new ObjectId(id) };
        } catch {
            query = { id: id }; // Handle custom string IDs if used
        }

        const category = await ServiceCategory.collection().findOne(query);
        if (!category) return res.status(404).json({ message: 'Not found' });
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCategory = async (req, res) => {
    try {
        const data = req.body;
        const errors = ServiceCategory.validate(data);
        if (errors.length > 0) return res.status(400).json({ message: errors.join(', ') });

        data.is_active = data.is_active !== undefined ? data.is_active : true;
        data.createdAt = new Date();
        data.updatedAt = new Date();

        const result = await ServiceCategory.collection().insertOne(data);
        res.json({ ...data, _id: result.insertedId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
