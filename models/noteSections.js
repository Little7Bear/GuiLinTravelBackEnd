const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const schema = new Schema(
    {
        __v: { type: Number, select: false },
        noteID: { type: String, required: true },  // 游记ID
        date: { type: Date, required: true },  //日期
        imgUrl: { type: String },  //照片地址
        describe: { type: String },  //照片描述
        address: { type: String },  //地址
        addressType: {  //地址类型
            type: String,
            enum: ["scenic", "restaurant", "hotel", "shopping"] //景点、餐厅、住宿、购物
        },
    }
);

module.exports = model("NoteSection", schema);