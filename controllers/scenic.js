const Scenic = require("../models/scenic");

class ScenicController {
  async create(ctx) {  // 创建
    ctx.verifyParams({  // 传入参格式校验
      name: { type: "string", required: true },
      userId: { type: "string", required: true },
      imgs: { type: "array", required: true },
      summary: { type: "string", required: true },
    });

    let requset = ctx.request.body
    requset.cover = requset.imgs[0]
    await new Scenic(requset).save();
    ctx.body = { code: 0 };
  }

  async findByID(ctx) {
    const scenic = await Scenic.findById(ctx.params.id)

    let res = {
      title: scenic.name,
      imgs: scenic.imgs,
      summary: scenic.summary,
      reference: scenic.reference,
      traffic: scenic.traffic,
      ticket: scenic.ticket,
      openTime: scenic.openTime,
    }

    ctx.body = { code: 0, data: res };
  }

  async delete(ctx) {
    await Scenic.findByIdAndRemove(ctx.params.id);
    ctx.body = { code: 0 };
  }

  async update(ctx) {
    const params = ctx.request.body;
    params.cover = params.imgs[0]
    const scenic = await Scenic.findByIdAndUpdate(ctx.params.id, params);
    if (!scenic) {
      return ctx.body = {
        code: 10002,
        message: '景点不存在',
      }
    }

    const newScenic = await Scenic.findById(ctx.params.id);

    const res = {
      title: newScenic.name,
      imgs: newScenic.imgs,
      summary: newScenic.summary,
      reference: newScenic.reference,
      traffic: newScenic.traffic,
      ticket: newScenic.ticket,
      openTime: newScenic.openTime,
    }

    ctx.body = { code: 0, data: res };
  }

  async find(ctx) {
    let { pageIndex, pageSize } = ctx.query;
    pageIndex = parseInt(pageIndex)
    pageSize = parseInt(pageSize)
    let skip = (pageIndex - 1) * pageSize
    const scenics = await Scenic.find({}).sort('createdAt')
      .limit(pageSize)
      .skip(skip);

    let result = []

    for (const scenic of scenics) {
      let obj = {
        id: scenic._id,
        title: scenic.name,
        cover: scenic.cover,
      }
      result.push(obj)
    }

    // 查询总数
    const count = await Scenic.countDocuments({});

    ctx.body = { code: 0, data: result, total: count }
  }

}

module.exports = new ScenicController();