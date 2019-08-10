const toutiao = require("./toutiao");
const juejin = require("./juejin");
const zhihu = require("./zhihu");
const segmentfault = require("./segmentfault");

const publish = {
  toutiaoPublisher: toutiao.toutiaoPublisher,
  juejinPublisher: juejin.juejinPublisher,
  zhihuPublisher: zhihu.zhihuPublisher,
  segmentfaultPublisher: segmentfault.segmentfaultPublisher
};

const Publisher = async (articlePath) => {
  const path = articlePath || "./src/file.md";
  [
    toutiao.toutiaoPublisher,
    juejin.juejinPublisher,
    zhihu.zhihuPublisher,
    segmentfault.segmentfaultPublisher
  ].forEach((platformPublisher) => {
    platformPublisher(path);
  });
};

module.exports = Publisher;
