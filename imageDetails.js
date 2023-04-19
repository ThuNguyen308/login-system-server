import mongoose from 'mongoose';

const ImageDetailsSchema = new mongoose.Schema(
    {
        image: String
    },
    {
        collection: "ImageDetails"
    }
);

mongoose.model("ImageDetails", ImageDetailsSchema)