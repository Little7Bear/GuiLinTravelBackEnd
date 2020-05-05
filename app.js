const Koa = require('koa')
const koaStatic = require("koa-static");
const bodyParser = require('koa-bodyparser')
const error = require("koa-json-error")
const parameter = require("koa-parameter");
const routing = require('./routes')
const credentials = require('./credentials.js')

const app = new Koa();
app.port = process.env.PORT || 3000

// 数据库配置
const mongoose = require('mongoose')
mongoose.set('bufferCommands', false) //禁用缓冲,未连接数据库时不能使用schema
mongoose.set('useFindAndModify', false);//使用findOneAndUpdate()
let opts = { useUnifiedTopology: true, useNewUrlParser: true }
switch (app.env) {
  case 'development':
    mongoose.connect(
      credentials.mongo.development.connectionString,
      opts,
      () => console.log("database connection successful"))
    break;
  case 'production':
    mongoose.connect(credentials.mongo.production.connectionString,
      opts,
      () => console.log("database connection successful"))
    break;
  default:
    throw new Error('Unknown execution environment: ' + app.env);
}
mongoose.connection.on("error", console.error);

//token无效
app.use(function (ctx, next) {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        error: err.originalError ? err.originalError.message : err.message
      };
    } else {
      throw err;
    }
  });
});

// 静态资源
app.use(koaStatic(__dirname + "/public"));

app.use(bodyParser())

// 参数校验
app.use(parameter(app));

// 路由
routing(app);

app.use(
  error({
    postFormat: (e, { stack, ...rest }) =>
      process.env.NODE_ENV === "production" ? rest : { stack, ...rest }
  })
);

function startServer() {
  app.listen(app.port, () => {
    console.log('Serve started in ' + app.env +
      ' mode on http://localhost:' + app.port +
      ' press Ctrl-C to terminate.');
  });
}

// 应用集群扩展
if (require.main === module) {
  // 应用程序直接运行；启动应用服务器
  startServer();
} else {
  // 应用程序作为一个模块通过"require" 引入: 导出函数
  module.exports = startServer;
}