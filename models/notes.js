const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const noteSchema = new Schema(
    {
        __v: { type: Number, select: false },
        name: { type: String, required: true },
        userID: { type: String, required: true },  // 用户ID
        days: { type: Array, required: true },  // 天数列表
        likeCount: { type: Number, default: 0 },
        commentCount: { type: Number, default: 0 },
        commentList: { type: Array, default: [] },
        collectCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = model("Note", noteSchema);