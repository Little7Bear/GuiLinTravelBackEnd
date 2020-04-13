const path = require("path");
const User = require("../models/users");

class UploadController {
  async updateAvatar(ctx) {  // 更新头像
    const file = ctx.request.files.file;
    let index = file.path.indexOf('uploads');
    const avatar_url = file.path.substring(index)

    let params = { avatar_url }
    const user = await User.findByIdAndUpdate(ctx.params.id, params);

    if (!user) {
      return ctx.body = {
        code: 10002,
        message: '用户不存在',
      }
    }

    ctx.body = { code: 0 };
  }

  async uploadNoteImg(ctx) {  // 上传游记图片
    const file = ctx.request.files.file;
    let index = file.path.indexOf('uploads');
    const url = file.path.substring(index)
    ctx.body = { code: 0, url };
  }
  
}

module.exports = new UploadController();