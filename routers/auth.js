import express from 'express';
import { getAuth, register } from '../controllers/auth.js'

const router = express.Router();

router.get('/', getAuth);

router.post('/register', register)

export default router;