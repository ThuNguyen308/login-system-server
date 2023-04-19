import mongoose from 'mongoose';

import { UserModel } from '../models/UserModel.js';

import bcrypt from 'bcryptjs';


export const getAuth = (req, res) => {
    res.send("router auth success")
}

export const register = async (req, res) => {
    const {username, email, password, role} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10);

    try {
        const oldUser = await User.findOne({email});
        if (oldUser) {
            return res.json({error: "User Exists"});
        }
        await User.create({username, email, password: encryptedPassword, role});
        res.status(200);
    } catch (err) {
        res.status(500).json({error: err})
    }
}

export const getUsers = async (req, res) => {
    try {
        const allUser = await UserModel.find();
        res.status(200).json(allUser);
    } catch (error) {
        res.status(500).json({error})
    }
}

export const updateUser = async (req, res) => {
    const accessToken = req.headers.token.split(' ')[1];
    const { userId } = req.params;
    const { username, email, avatar } = req.body;

    const oldUser = await User.findOne({_id: userId});
    if (!oldUser) {
        return res.json({status: "User Not Exists!!"});
    }

    try {
        const user = jwt.verify(accessToken, process.env.JWT_SECRET, (err, res) => {
            if (err) {
                return "token expired";
            }
            return res;
        });

        if (user === "token expired") {
            return res.send({status: "error", data: "token expired"});
        }

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId
            },
            {
                $set: {
                    username,
                    email,
                    avatar
                },
            },
            {
                new: true,
            }
        )

        res.status(200).json(updatedUser);
    } catch (error) {
        res.send("Something went wrong");
    }
}

export const deleteUser = async (req, res) => {
    const {userId} = req.body
    try {
        await User.deleteOne(
            {_id: userId}
        )
        res.send({ status: "ok"})
    } catch (error) {
        console.log(error);
    }
}