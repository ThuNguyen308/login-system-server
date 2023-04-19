import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        avatar: String,
        email: {
            type: String,
            unique: true,
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            default: 'user'
        }
    },
    {
        collection: "User"
    }
);

export const UserModel = mongoose.model('User', schema)