const toutiao = require("./toutiao");
const juejin = require("./juejin");
const zhihu = require("./zhihu");
const segmentfault = require("./segmentfault");
const jianshu = require("./jianshu");
const wechat = require("./wechat");
const csdn = require("./csdn");

const platformPublisher = {
  toutiaoPublisher: toutiao.toutiaoPublisher,
  juejinPublisher: juejin.juejinPublisher,
  zhihuPublisher: zhihu.zhihuPublisher,
  segmentfaultPublisher: segmentfault.segmentfaultPublisher,
  jianshuPublisher: jianshu.jianshuPublisher,
  csdnPublisher: csdn.csdnPublisher,
  wechatPublisher: wechat.wechatPublisher
};

const Publisher = async ({
  articlePath = "",
  allPlatform = false,
  platform = []
} = {}) => {
  const path = articlePath || "./src/file.md";

  const platformList = [
    "",
    "wechatPublisher",
    "toutiaoPublisher",
    "zhihuPublisher",
    "juejinPublisher",
    "segmentfaultPublisher",
    "jianshuPublisher",
    "csdnPublisher"
  ];

  (!allPlatform ? platform.map((i) => platformList[i]) : platformList)
    .filter(Boolean)
    .forEach((platform) => {
      platformPublisher[platform](path);
    });
};

module.exports = Publisher;
