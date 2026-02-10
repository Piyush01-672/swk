import express from 'express';
import { listCategories, getCategoryById, createCategory } from '../controllers/service.controller.js';
import { queryParser } from '../middlewares/queryParser.js';

const router = express.Router();

router.get('/', queryParser, listCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);

export default router;
