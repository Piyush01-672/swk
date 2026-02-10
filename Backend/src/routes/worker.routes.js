import express from 'express';
import { createProfile, getByUserId, updateByUserId, listWorkerProfiles } from '../controllers/worker.controller.js';
import { queryParser } from '../middlewares/queryParser.js';

const router = express.Router();

router.get('/', queryParser, listWorkerProfiles);
router.post('/', createProfile);
router.get('/user/:userId', getByUserId);
router.patch('/user/:userId', updateByUserId);

export default router;
