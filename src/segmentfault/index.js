const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const marked = require("marked");

const utils = require("../utils");
const readFile = utils.readFile;
const getCookie = utils.getCookie;
module.exports = {
  segmentfaultPublisher: async (articlePath) => {
    if (!articlePath) {
      return;
    }
    const protocol = "https://";
    const base_host = "segmentfault.com/";
    const base_api = "/api";
    const cookie = await getCookie("https://segmentfault.com/");

    const path = {
      saveDraft: `${protocol}${base_host}${base_api}/article/draft/save`,
      addArticles: `${protocol}${base_host}${base_api}/articles/add`,
      write: `${protocol}${base_host}/write`
    };

    // add 添加文章
    // save 保存
    const request = axios.create({
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
        cookie: cookie
      }
    });

    const saveDraft = (formData) => {
      return request.post(
        `${path.saveDraft}?${formData.query}`,
        {
          ...formData
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            referer: `${path.write}?freshman=1`
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

    const doAddArticles = (formData) => {
      return request.post(
        `${path.addArticles}?${formData.query}`,
        {
          ...formData
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            referer: `${path.write}?freshman=1`
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

    const getQueryFromWritePage = () => {
      return request.get(`${path.write}?freshman=1`);
    };

    const formData = {
      do: "saveArticle",
      type: "1",
      title: "",
      text: "dsadsa",
      weibo: "0",
      blogId: "0",
      id: "",
      articleId: "",
      "tags[]": "1040000000089899", //前端，todo:可在writePage获得大部分标签值
      url: "",
      draftId: "",
      query: "" //每个请求都需要带上
    };

    const queryData = await getQueryFromWritePage();

    if (queryData && queryData.data) {
      const result = /"\/api\/user\/logout\?(.*?)">/.exec(queryData.data);
      if (result) {
        formData.query = result[1];
      }
    }

    const draftIdData = await saveDraft(formData);

    if (draftIdData && draftIdData.data) {
      formData.draftId = draftIdData.data.data;
    }

    const md = await readFile(articlePath);
    const result = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(md);
    formData.text = md.replace(result[0], "");
    formData.title = result[1];

    const doAddArticlesData = await doAddArticles(formData);
    if (doAddArticlesData && doAddArticlesData.data) {
      console.log(doAddArticlesData.data.data);
    }
  }
};
