const mongoose = require("mongoose");
const { timeStamp } = require("console");
const { ObjectId } = mongoose.Schema;
const image = require("./image");
const user = require("./user");


const swapSchema = new mongoose.Schema({
    creator: {
        type: ObjectId,
        ref: "User",
        required: true
    },
    participant: {
        type: ObjectId,
        ref: "User"
    },
    description: { type: String },
    images: [
        {
            type: ObjectId,
            ref: "Image",
        }
    ],
    swapOffer: [
        {
            owner: {
                type: ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true
            },
            unit: {
                type: String,
                required: true
            },
        }
    ],
    lastEditedBy: {
        type: ObjectId,
        ref: user,
        timeStamp
    },
    status: {
        name: {
            type: String,
            required: true,
            default: "Negotiating"
        },
        value: {
            type: Number,
            required: true,
            default: 0
        },
    },
    chat: [
        {
            type: new mongoose.Schema(
                {
                    owner: { type: ObjectId, ref: user, required: true },
                    message: String
                },
                { timestamps: true }
            )
        }
    ],
},
    { timestamps: true }
);

module.exports = mongoose.model("Swap", swapSchema);

