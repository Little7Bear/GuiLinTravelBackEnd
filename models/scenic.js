const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const schema = new Schema(
  {
    __v: { type: Number, select: false },
    name: { type: String, required: true },
    userId: { type: String, required: true },  //创建者ID
    cover: { type: String, required: true },  // 封面图片
    imgs: { type: Array, default: [], required: true },// 图片集合
    summary: { type: String, required: true },//摘要
    reference: { type: String },//用时参考
    traffic: { type: String },//交通信息
    ticket: { type: String },//门票信息
    openTime: { type: String },//开放时间
  },
  { timestamps: true }
);

module.exports = model("Scenic", schema);