const toutiao = require("./toutiao");
const juejin = require("./juejin");
const zhihu = require("./zhihu");
const segmentfault = require("./segmentfault");
const jianshu = require("./jianshu");

const publish = {
  toutiaoPublisher: toutiao.toutiaoPublisher,
  juejinPublisher: juejin.juejinPublisher,
  zhihuPublisher: zhihu.zhihuPublisher,
  segmentfaultPublisher: segmentfault.segmentfaultPublisher,
  jianshuPublisher: jianshu.jianshuPublisher,
  csdnPublisher: csdn.csdnPublisher
};

const Publisher = async (articlePath) => {
  const path = articlePath || "./src/file.md";
  [
    toutiao.toutiaoPublisher,
    juejin.juejinPublisher,
    zhihu.zhihuPublisher,
    segmentfault.segmentfaultPublisher,
    jianshu.jianshuPublisher,
    csdn.csdnPublisher
  ].forEach((platformPublisher) => {
    platformPublisher(path);
  });
};

module.exports = Publisher;
