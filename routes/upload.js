const jwt = require("koa-jwt");
const { secret } = require("../credentials");
const koaBody = require('koa-body')
const path = require('path')
const utils = require('../utils');
const Router = require("koa-router");
const router = new Router({ prefix: "/upload" });  // 路由前缀
const {
  updateAvatar,
  uploadNoteImg,
} = require("../controllers/upload");  // 控制器方法

const auth = jwt({ secret });  // jwt鉴权

const kb = koaBody({
  multipart: true,
  encoding: 'gzip',
  formidable: {
    maxFieldsSize: 2000 * 1024 * 1024,// 设置上传文件大小最大限制，默认20M
    keepExtensions: true,
    multiples: false,
    hash: 'sha1',
    uploadDir: path.join(__dirname, '..', '/public/uploads/'),
    onFileBegin: (name, file) => {
      // 获取文件后缀
      const ext = utils.getUploadFileExt(file.name);
      // 最终要保存到的文件夹目录
      const dirName = utils.getUploadDirName();
      const dir = path.join(__dirname, '..', `/public/uploads/${dirName}`);
      // 检查文件夹是否存在如果不存在则新建文件夹
      utils.checkDirExist(dir);
      // 获取文件名称
      const fileName = utils.getUploadFileName(ext);
      // 重新覆盖 file.path 属性
      file.path = `${dir}/${fileName}`;
    },
    onError: (err) => {
      console.log(err);
    }
  }
})

router.post("/users/:id", auth, kb, updateAvatar);  // 更新头像

router.post("/notes/:id", auth, kb, uploadNoteImg);  // 上传游记图片

module.exports = router;