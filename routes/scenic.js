const jwt = require("koa-jwt");
const { secret } = require("../credentials");
const Router = require("koa-router");
const router = new Router({ prefix: "/scenics" });  // 路由前缀
const {
  create,
  findByID,
  delete: del,
  update,
  find,
} = require("../controllers/scenic");  // 控制器方法

const auth = jwt({ secret });  // jwt鉴权

router.post("/", auth, create);  // 创建游记

router.get("/all", find);  // 获取所有景点

router.get("/:id", findByID);  // 根据ID查询

router.delete("/:id", auth, del);

router.patch("/:id", auth, update);  // 更新游记信息

module.exports = router;