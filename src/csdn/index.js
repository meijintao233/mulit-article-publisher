const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const marked = require("marked");

const utils = require("../utils");

module.exports = {
  csdnPublisher: async (articlePath) => {
    if (!articlePath) {
      return;
    }
    const readFile = utils.readFile;
    const getCookie = utils.getCookie;
    const protocol = "https://";
    const base_host = "mp.csdn.net/";
    // const base_api = "/api";
    const cookie = await getCookie("https://mp.csdn.net/");

    const path = {
      getPublishPath() {
        return `${protocol}${base_host}/mdeditor/saveArticle`;
      }
    };

    const request = axios.create({
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
        cookie: cookie
      }
    });

    request.interceptors.response.use(
      (data) => {
        if (data && data.status === 200) {
          return data.data;
        }
      },
      (err) => {
        return Promise.resolve(err);
      }
    );

    const publish = (formData) => {
      return request.post(
        path.getPublishPath(),
        { ...formData },
        {
          headers: {
            accept: "application/json"
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
      notebook_id: "",
      id: "", //note Id
      title: "",
      content: "",
      markdowncontent: "",
      type: "original", //原创
      readType: "public", //公开
      channel: "14" //前端
    };

    //todo:save md
    const md = await readFile(articlePath);
    const result = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(md);

    formData.content = md.replace(result[0], "");
    formData.markdowncontent = formData.content;
    formData.content = marked(formData.content).replace(/\n*/g, "");
    formData.title = result[1];

    await publish(formData);
  }
};
