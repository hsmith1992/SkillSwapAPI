const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const { timeStamp } = require("console");

const imageSchema = new mongoose.Schema(
    {
        name: String,
        data: Buffer,
        contentType: String,
        createdBy: {
            type: ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("Image", imageSchema);