const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const marked = require("marked");

const utils = require("../utils");
module.exports = {
  wechatPublisher: async (articlePath) => {
    if (!articlePath) {
      return;
    }
    const readFile = utils.readFile;
    const getCookie = utils.getCookie;
    const cookie = await getCookie("https://mp.weixin.qq.com/");
    const protocol = "https://";
    const base_host = "mp.weixin.qq.com";
    const base_api = "/api";

    //根据token和appmsgid获取draftId

    const request = axios.create({
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
        cookie: cookie
      },
      validateStatus(status) {
        return status >= 200 && status < 500;
      },
      maxRedirects: 0 //避免重定向
    });

    request.interceptors.response.use(
      (data) => {
        if (data && data.status === 200) {
          return data.data;
        }
        if (data && data.status === 302) {
          return data.headers;
        }
      },
      (err) => {
        return Promise.resolve(err);
      }
    );

    const path = {
      getTokenPath() {
        return `${protocol}${base_host}/cgi-bin/loginpage?url=%2Fcgi-bin%2Fhome%3Ft%3Dhome%2F`;
      },
      getSaveArticlePath(token) {
        return `${protocol}${base_host}/cgi-bin/operate_appmsg?t=ajax-response&sub=create&type=10&token=${token}&lang=zh_CN`;
      },
      getWriterPath(token) {
        return `${protocol}${base_host}/acct/writermgr?action=page&token=${token}&lang=zh_CN&f=json&ajax=1&random=${Math.random()}`;
      }
    };

    const getToken = () => {
      console.log(path.getTokenPath());
      return request.get(path.getTokenPath(), {});
    };

    const getWriter = (formData) => {
      return request.get(path.getWriterPath(formData.token));
    };

    const setCopyright = () => {
      return request.get(
        `https://mp.weixin.qq.com/acct/writermgr?action=page&token=948952310&lang=zh_CN&f=json&ajax=1&random=0.9707283940073879`,
        {
          headers: {
            referer:
              "https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=10&appmsgid=100000047&token=948952310&lang=zh_CN"
          }
        }
      );
    };

    const saveArticle = (formData) => {
      return request.post(
        path.getSaveArticlePath(formData.token),
        {
          content0: "",
          can_reward0: 0,
          auto_gen_digest0: 0,
          random: Math.random(),
          count: 1,
          isnew: 0,
          data_seq: 0,
          ...formData
        },
        {
          headers: {
            Host: "mp.weixin.qq.com",
            "content-type": "application/x-www-form-urlencoded;",
            Referer: path.getSaveArticlePath(formData.token)
          },
          transformRequest: [
            function(data) {
              data = qs.stringify(data);
              return data;
            }
          ]
        }
      );
    };

    const formData = {
      title0: "",
      content0: "",
      token: "",
      can_reward0: 0,
      author0: "",
      writerid0: "",
      original_article_type0: "科技互联网"
    };

    //todo:save md
    const md = await readFile(articlePath);
    const result = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(md);
    formData.content0 = md.replace(result[0], "");
    //掘金根据html直接渲染
    formData.content0 = marked(formData.content0).replace(/\n*/g, "");
    formData.title0 = result[1];

    // 获取token
    const headers = await getToken();
    formData.token = qs.parse(headers.location).token;

    const writerInfo = await getWriter(formData);

    if (
      writerInfo &&
      writerInfo.pageinfo &&
      writerInfo.pageinfo.writerlist.length
    ) {
      const writer = writerInfo.pageinfo.writerlist[0];
      formData.author0 = writer.nickname;
      formData.writerid0 = writer.writerid;
      formData.can_reward0 = 1;
      formData.copyright_type0 = 1;
    }

    await saveArticle(formData);
  }
};
