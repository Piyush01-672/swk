import express from 'express';
import { updateUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.patch('/:id', protect, updateUser);

export default router;
