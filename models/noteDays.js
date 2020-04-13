const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const schema = new Schema(
    {
        __v: { type: Number, select: false },
        sort: { type: Number, required: true },//第几天
        noteID: { type: String, required: true },//所属游记ID
        sections: { type: Array, required: true },  //章节列表
    }
);

module.exports = model("NoteDay", schema);