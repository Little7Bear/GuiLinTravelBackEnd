const jwt = require("koa-jwt");
const { secret } = require("../credentials");
const Router = require("koa-router");
const router = new Router({ prefix: "/notes" });  // 路由前缀
const {
  create,
  findByUserID,
  findByID,
  delete: del,
  update,
  find,
  createComment,
  findComments,
  deleteComment
} = require("../controllers/notes");  // 控制器方法

const auth = jwt({ secret });  // jwt鉴权

router.post("/", auth, create);  // 创建游记

router.get("/", findByID);  // 根据ID查询

router.get("/all", find);  // 获取用户列表

router.get("/user/:userID", auth, findByUserID);  // 根据用户ID查询

router.delete("/:id", auth, del);

router.patch("/:id", auth, update);  // 更新游记信息

router.patch("/comments/:id", auth, createComment);  // 新增评论

router.get("/comments/:id", auth, findComments);  // 查找所有评论

router.delete("/comments/:id", auth, deleteComment);  // 删除评论

module.exports = router;