import mongoose from "mongoose";

const UserDetailsSchema = new mongoose.Schema(
    {
        username: String,
        avatar: String,
        email: { type: String, unique: true},
        password: String,
        role: String
    },
    {
        collection: "UserInfo"
    }
);

mongoose.model("UserInfo", UserDetailsSchema)