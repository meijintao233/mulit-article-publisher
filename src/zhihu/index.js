const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const marked = require("marked");

const utils = require("../utils");
module.exports = {
  zhihuPublisher: async (articlePath) => {
    console.log(11);
    if (!articlePath) {
      return;
    }
    const readFile = utils.readFile;
    const getCookie = utils.getCookie;
    const protocol = "https://";
    const base_host = "zhuanlan.zhihu.com/";
    const base_api = "/api";
    const cookie = await getCookie("https://zhihu.com/");

    const path = {
      getDraftsPath() {
        return `${protocol}${base_host}${base_api}/articles/drafts`;
      },
      getDraftPath(id) {
        return `${protocol}${base_host}${base_api}/articles/${id}/draft`;
      },
      getPublishPath(id) {
        return `${protocol}${base_host}${base_api}/articles/${id}/publish`;
      },
      getUserInfoPath() {
        return "https://www.zhihu.com/api/v4/me";
      },
      getColumnInfoPath(url_token) {
        return `https://www.zhihu.com/api/v4/members/${url_token}/column-contributions`;
      },
      getWritePath() {
        return `${protocol}${base_host}/write`;
      },
      getEditPath(id) {
        return `${protocol}${base_host}/p/${id}/edit`;
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

    const getUserInfo = () => {
      return request.get(path.getUserInfoPath());
    };

    const getColumnInfo = (url_token) => {
      return request.get(path.getColumnInfoPath(url_token));
    };

    const sendDrafts = () => {
      return request.post(path.getDraftsPath(), {
        headers: {
          referer: path.getWritePath()
        }
      });
    };

    const sendDraft = (id, formData) => {
      return request.patch(
        path.getDraftPath(id),
        {
          ...formData
        },
        {
          headers: {
            referer: path.getEditPath(id)
          }
        }
      );
    };

    const publish = (id, formData) => {
      return request.put(
        path.getPublishPath(id),
        {
          column: formData.column,
          commentPermission: "anyone"
        },
        {
          headers: {
            referer: path.getEditPath(id)
          }
        }
      );
    };

    const formData = {
      id: "", // article id
      url_token: "",
      column: {},
      title: "",
      content: ""
    };

    const userInfo = await getUserInfo();
    formData.url_token = userInfo.url_token || "";
    const columnInfo = await getColumnInfo(formData.url_token);

    if (columnInfo && columnInfo.data && columnInfo.data.length) {
      //暂时用第一个专栏
      formData.column = columnInfo.data[0].column;
    }

    const data = await sendDrafts();

    if (data) {
      const id = data.id;

      //todo:save md
      const md = await readFile(articlePath);
      const result = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(md);

      formData.content = md.replace(result[0], "");
      formData.content = marked(formData.content).replace(/\n*/g, "");
      formData.title = result[1];

      await sendDraft(id, formData);
      await publish(id, formData);
    }
  }
};
