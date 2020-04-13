const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        __v: { type: Number, select: false },
        name: { type: String, required: true },
        password: { type: String, required: true },  // 密码
        avatar_url: { // 头像
            type: String,
            default: "/img/default-avatar.png",
        },
        gender: {  //   性别
            type: String,
            enum: ["male", "female", "secret"],
            default: "secret",
            required: true
        },
        birthday: {
            type: Date,
        },
        status: {
            type: Number,
            //0 管理员
            //1 普通用户
            enum: [0, 1],
            default: 1,
        },
        likeCount: { type: Number, default: 0 },//喜欢游记数
        likeList: { type: Array, default: [] },
        collectCount: { type: Number, default: 0 },//收藏游记数
        collectList: { type: Array, default: [] },
    },
    { timestamps: true }
);

module.exports = model("User", userSchema);