const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const marked = require("marked");

const utils = require("../utils");
module.exports = {
  toutiaoPublisher: async () => {
    const readFile = utils.readFile;
    const getCookie = utils.getCookie;
    const cookie = await getCookie("https://mp.toutiao.com/");
    const protocol = "https://";
    const base_host = "mp.toutiao.com/";
    const base_api = "/api";

    //根据token和appmsgid获取draftId

    const request = axios.create({
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
        cookie: cookie
      }
    });

    const getMediaInfo = () => {
      return request.get("https://mp.toutiao.com/get_media_info/", {
        headers: {
          referer: "https://mp.toutiao.com/profile_v3/graphic/publish"
        }
      });
    };

    const checkTitle = (formData) => {
      return request.get(
        `https://mp.toutiao.com/check_title/?title=${formData.title}&title_id=${
          formData.mediaId
        }`,
        {
          headers: {
            referer: "https://mp.toutiao.com/profile_v3/graphic/publish"
          }
        }
      );
    };

    const publish = (formData) => {
      return request.post(
        "https://mp.toutiao.com/core/article/edit_article_post/?source=mp&type=article",
        {
          ...formData
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            referer: "https://mp.toutiao.com/profile_v3/graphic/publish"
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
      title: "测试测试测试111",
      title_id: "",
      article_ad_type: 3,
      article_type: 0,
      save: 1,
      content:
        "<p>dsadas</p><p>dasdas</p><ul><li>ss</li><li>das</li><li>dasdas</li></ul><p><br></p><hr><p><br></p><h1>da</h1><p>das</p><p><strong>dasdas</strong></p>"
    };

    const data = await getMediaInfo();

    formData.title_id = `${Date.now()}_${data.data.data.media.id}`;

    //todo:save md
    const md = await readFile("./src/file.md");
    const result = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(md);
    formData.content = md.replace(result[0], "");
    //掘金根据html直接渲染
    formData.content = marked(formData.content).replace(/\n*/g, "");
    formData.title = result[1];

    await checkTitle(formData);
    await publish(formData);
  }
};
