const Note = require("../models/notes");
const User = require("../models/users");
const dayjs = require("dayjs");
const mongoose = require('mongoose');
const _ = require("lodash");
// const Day = require("../models/noteDays");
// const Section = require("../models/noteSections");

class NoteController {
  async create(ctx) {  // 创建
    ctx.verifyParams({  // 传入参格式校验
      name: { type: "string", required: true },
      userID: { type: "string", required: true },
      days: { type: "array", required: true },
    });

    const { name, userID, days } = ctx.request.body;
    const noteObj = {
      name,
      userID,
      days
    }
    await new Note(noteObj).save();
    ctx.body = { code: 0 };
  }

  async findByUserID(ctx) { //根据用户ID查询游记
    let userID = ctx.params.userID
    const user = await User.findById(userID)
    const notes = await Note.find({ userID }).sort('-createdAt')

    let cards = []
    let receiveLike = 0, receiveCollect = 0;
    notes.forEach(note => {
      let card = {
        title: note.name,
        cover: note.days[0].sections[0].url,
        date: dayjs(note.createdAt).format('YYYY-MM-DD'),
        dayTotal: note.days.length,
        like: note.likeCount,
        comment: note.commentCount,
        id: note._id
      }
      receiveLike += note.likeCount
      receiveCollect += note.collectCount
      cards.push(card)
    });

    let resData = {
      avatar_url: user.avatar_url,
      username: user.name,
      ownCount: notes.length,
      likeCount: user.likeCount,
      collectCount: user.collectCount,
      receiveLike: receiveLike,
      receiveCollect: receiveCollect,
      notes: cards,
    }

    ctx.body = { code: 0, data: resData };
  }

  async findByID(ctx) { //根据用户ID查询游记
    let { articleID } = ctx.query
    const note = await Note.findById(articleID)
    const user = await User.findById(note.userID)

    let res = {
      name: note.name,
      date: dayjs(note.createdAt).format('YYYY-MM-DD'),
      avatar_url: user.avatar_url,
      username: user.name,
      userID: user._id,
      dayTotal: note.days.length,
      likeCount: note.likeCount,
      commentCount: note.commentCount,
      collectCount: note.collectCount,
      days: note.days
    }

    ctx.body = { code: 0, data: res };
  }

  async delete(ctx) {
    await Note.findByIdAndRemove(ctx.params.id);
    ctx.body = { code: 0 };
  }

  async update(ctx) {
    const params = ctx.request.body;

    const note = await Note.findByIdAndUpdate(ctx.params.id, params);
    if (!note) {
      return ctx.body = {
        code: 10002,
        message: '游记不存在',
      }
    }

    const newNote = await Note.findById(ctx.params.id);

    const res = {
      name: newNote.name,
      days: newNote.days,
      likeCount: newNote.likeCount,
      commentCount: newNote.commentCount,
      collectCount: newNote.collectCount,
    }

    ctx.body = { code: 0, data: res };
  }

  async find(ctx) {
    let { pageIndex, pageSize, sort } = ctx.query;
    pageIndex = parseInt(pageIndex)
    pageSize = parseInt(pageSize)
    let skip = (pageIndex - 1) * pageSize

    let sortField = ''
    switch (sort) {
      case 'hot':
        sortField = 'likeCount'
        break;
      case 'latest':
        sortField = 'createdAt'
        break;
    }


    const notes = await Note.find({}).sort('-' + sortField)
      .limit(pageSize)
      .skip(skip);

    let result = []
    notes.forEach(async note => {
      const user = await User.findById(note.userID)

      let obj = {
        id: note._id,
        title: note.name,
        date: dayjs(note.createdAt).format('YYYY-MM-DD'),
        avatar_url: user.avatar_url,
        username: user.name,
        dayTotal: note.days.length,
        likeCount: note.likeCount,
        commentCount: note.commentCount,
        cover: note.days[0].sections[0].url,
      }
      result.push(obj)
    });

    // 查询总数
    const count = await Note.countDocuments({});

    ctx.body = { code: 0, data: result, total: count }
  }

  async createComment(ctx) {//新增评论
    const request = ctx.request.body;
    const oldNote = await Note.findById(ctx.params.id);
    // 删除
    if (request.commentId) {
      _.pull(oldNote.commentList, request.commentId)
    } else {
      request.id = mongoose.Types.ObjectId();
      oldNote.commentList.push(request)
    }

    let params = {
      commentList: oldNote.commentList
    }
    await Note.findByIdAndUpdate(ctx.params.id, params);

    const note = await Note.findById(ctx.params.id);
    let res = []
    for (const comment of note.commentList) {
      const user = await User.findById(comment.userId)
      let item = {
        userId: user._id,
        username: user.name,
        avatar_url: user.avatar_url,
        id: comment.id,
        text: comment.text,
        date: comment.date,
      }
      res.push(item)
    }
    ctx.body = { code: 0, data: res };
  }

  async findComments(ctx) {//查找所有评论
    const note = await Note.findById(ctx.params.id);
    let res = []
    for (const comment of note.commentList) {
      const user = await User.findById(comment.userId)

      let item = {
        userId: user._id,
        username: user.name,
        avatar_url: user.avatar_url,
        id: comment.id,
        text: comment.text,
        date: comment.date,
      }
      res.push(item)
    }
    ctx.body = { code: 0, data: res };
  }

  async deleteComment(ctx) {//删除评论
    // const { commentId } = ctx.request.body
    // const note = await Note.findById(ctx.params.id);
    // let id = mongoose.Types.ObjectId(commentId)
    // console.log(id);
    // _.pull(note.commentList, id)
    // let params = {
    //   commentList: note.commentList
    // }
    // await Note.findByIdAndUpdate(ctx.params.id, params);
    console.log(ctx.params.id);
    console.log('12345646464566666666666666656');
    ctx.body = { code: 0 };
  }
}

module.exports = new NoteController();