const User = require("../models/users");
const jsonwebtoken = require("jsonwebtoken");
const md5 = require('blueimp-md5');
const { secret } = require("../credentials");
const _ = require("lodash");

class UserController {
  async create(ctx) {  // 注册
    ctx.verifyParams({  // 传入参格式校验
      name: { type: "string", required: true },
      password: { type: "password", required: true, max: 15, min: 6 }
    });

    const { name, password } = ctx.request.body;
    let params = {
      name,
      password: md5(md5(password) + secret)
    }

    const repeatedUser = await User.findOne({ name });
    if (repeatedUser) {  // 校验用户名是否已存在
      return ctx.body = {
        code: 10001,
        message: '用户已存在',
      }
    }

    const user = await new User(params).save();

    const obj = {
      _id: user._id,
      name: user.name,
    }

    let pa = {
      id: user._id,
      status: user.status,
    }

    const token = jsonwebtoken.sign(obj, secret, { expiresIn: "1d" });  // 注册成功返回jwt加密后的token信息
    ctx.body = { token, code: 0, user: pa };
  }

  async login(ctx) {  // 登录
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "password", required: true, max: 15, min: 6 }
    });

    const params = {
      name: ctx.request.body.name,
      password: md5(md5(ctx.request.body.password) + secret),
    }

    const user = await User.findOne(params);
    if (!user) {
      return ctx.body = {
        code: 10001,
        message: '用户名或密码不正确',
      }
    }
    const { _id, name } = user;
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: "1d" });  // 登录成功返回jwt加密后的token信息
    let obj = {
      id: user._id,
      status: user.status,
    }
    ctx.body = { token, code: 0, user: obj };
  }

  async findById(ctx) {  // 根据id查询特定用户
    let id = ctx.params.id
    if (id !== '') {
      const user = await User.findById(id)
      if (!user) {
        return ctx.body = {
          code: 10002,
          message: '用户不存在',
        }
      }

      let result = {
        avatar_url: user.avatar_url,
        name: user.name,
        gender: user.gender,
        birthday: user.birthday || '',
      }

      ctx.body = { code: 0, user: result };
    }
  }

  async verifyState(ctx) {  // 验证特定用户是否已经点赞或收藏某条游记
    let id = ctx.query.id
    let noteId = ctx.query.noteId
    if (id !== '') {
      const user = await User.findById(id)
      let { likeList, collectList } = user

      let result = {}
      if (collectList.includes(noteId)) {
        result.collect = 1
      } else {
        result.collect = 0
      }

      if (likeList.includes(noteId)) {
        result.like = 1
      } else {
        result.like = 0
      }

      ctx.body = { code: 0, data: result };
    }
  }

  async find(ctx) {  // 查询用户列表(分页)
    let { pageIndex, pageSize } = ctx.query;
    pageIndex = parseInt(pageIndex)
    pageSize = parseInt(pageSize)
    let skip = (pageIndex - 1) * pageSize

    const users = await User.find({}).sort('-createdAt')
      .limit(pageSize)
      .skip(skip);

    let result = []
    users.forEach(user => {
      let obj = {
        id: user._id,
        avatar_url: user.avatar_url,
        name: user.name,
        gender: user.gender,
        createdAt: user.createdAt,
      }
      result.push(obj)
    });

    // 查询总数
    const count = await User.countDocuments({});

    ctx.body = { code: 0, users: result, total: count }
  }

  async update(ctx) {  // 更新用户基本信息
    ctx.verifyParams({
      name: { type: "string", required: true },
      avatar_url: { type: "string", required: true },
      gender: { type: "string", required: true },
    });

    const { name, avatar_url, gender, birthday } = ctx.request.body;
    const params = {
      name, avatar_url, gender, birthday
    }

    const user = await User.findByIdAndUpdate(ctx.params.id, params);
    if (!user) {
      return ctx.body = {
        code: 10002,
        message: '用户不存在',
      }
    }

    const newUser = await User.findById(ctx.params.id);

    let obj = {
      avatar_url: newUser.avatar_url,
      name: newUser.name,
      gender: newUser.gender,
      birthday: newUser.birthday,
    }

    ctx.body = { code: 0, user: obj };
  }

  async updateAmount(ctx) {  // 更新点赞、收藏
    const { likeCount, collectCount, noteId } = ctx.request.body;
    const oldUser = await User.findById(ctx.params.id);

    let params = {}
    // 点赞
    if (likeCount) {
      params = {
        likeCount: oldUser.likeCount += likeCount,
      }
      if (likeCount > 0) {
        oldUser.likeList.push(noteId)
      } else {
        _.pull(oldUser.likeList, noteId)
      }
      params.likeList = oldUser.likeList
    }

    // 收藏
    if (collectCount) {
      params = {
        collectCount: oldUser.collectCount += collectCount,
      }
      if (collectCount > 0) {
        oldUser.collectList.push(noteId)
      } else {
        _.pull(oldUser.collectList, noteId)
      }
      params.collectList = oldUser.collectList
    }

    const user = await User.findByIdAndUpdate(ctx.params.id, params);

    if (!user) {
      return ctx.body = {
        code: 10002,
        message: '用户不存在',
      }
    }

    await User.findById(ctx.params.id);
    ctx.body = { code: 0 };
  }

  async updatePassword(ctx) {  // 修改密码
    ctx.verifyParams({
      oldPassword: { type: "string", required: true },
      newPassword: { type: "string", required: true },
    });

    const { oldPassword, newPassword } = ctx.request.body;
    const member = await User.findById(ctx.params.id);
    console.log(member);
    if (member.password != md5(md5(oldPassword) + secret)) {
      return ctx.body = {
        code: 10002,
        message: '原密码错误',
      }
    }

    const params = {
      password: md5(md5(newPassword) + secret)
    }

    const user = await User.findByIdAndUpdate(ctx.params.id, params);
    if (!user) {
      return ctx.body = {
        code: 10002,
        message: '用户不存在',
      }
    }

    ctx.body = { code: 0 };
  }

  async checkOwner(ctx, next) {  // 判断用户身份合法性
    let user = ctx.state.user

    if (user.name !== 'admin' && ctx.params.id !== user._id) {
      ctx.throw(403, "没有权限");
    }

    await next();
  }

  async delete(ctx) {  // 删除用户
    const user = await User.findByIdAndRemove(ctx.params.id);
    if (!user) {
      ctx.throw(404, "用户不存在");
    }
    ctx.body = { code: 0 };
  }

}

module.exports = new UserController();