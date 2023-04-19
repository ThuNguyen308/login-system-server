import express from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/user.js'

const initialState = {
    currentUser: {
        email: '',
        fullName: '',
        phoneNumber: '',
        avatar: '',
        userId: '',
        role: '',
    }
};

const router = express.Router();

router.get('/getUsers', getUsers);

router.put('/:userId/update', updateUser);

router.post('/delete', deleteUser);

export default router;