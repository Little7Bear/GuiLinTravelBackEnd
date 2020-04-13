const jwt = require("koa-jwt");
const { secret } = require("../credentials");
const Router = require("koa-router");
const router = new Router({ prefix: "/users" });  // 路由前缀
const {
  find,
  findById,
  create,
  checkOwner,
  update,
  updatePassword,
  delete: del,
  login,
  updateAmount,
  verifyState,
} = require("../controllers/users");  // 控制器方法

const auth = jwt({ secret });  // jwt鉴权

router.post("/", create); //注册

router.post("/login", login);  // 用户登录

router.get("/all", find);  // 获取用户列表

router.get("/verify", verifyState);  // 验证是否已经点赞、收藏

router.get("/:id", findById);  // 获取特定用户

router.patch("/:id", auth, checkOwner, update);  // 更新用户信息（需要jwt认证和验证操作用户身份）

router.patch("/amount/:id", auth, checkOwner, updateAmount);  // 更新点赞、收藏

router.patch("/update-password/:id", auth, checkOwner, updatePassword);  // 修改密码

router.delete("/:id", auth, checkOwner, del);  // 删除用户（需要jwt认证和验证操作用户身份）

module.exports = router;