const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const marked = require("marked");

const utils = require("../utils");

module.exports = {
  jianshuPublisher: async (articlePath) => {
    const readFile = utils.readFile;
    const getCookie = utils.getCookie;
    const protocol = "https://";
    const base_host = "www.jianshu.com/";
    // const base_api = "/api";
    const cookie = await getCookie("https://www.jianshu.com/");

    const path = {
      getNotebooksPath() {
        return `${protocol}${base_host}/author/notebooks`;
      },
      getNotesPath() {
        return `${protocol}${base_host}/author/notes`;
      },
      getSaveNotePath(id) {
        return `${protocol}${base_host}/author/notes/${id}`;
      },
      getPublishPath(id) {
        return `${protocol}${base_host}/author/notes/${id}/publicize`;
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

    const getNotebooks = () => {
      return request.get(path.getNotebooksPath(), {
        headers: {
          referer: "https://www.jianshu.com/writer",
          accept: "application/json",
          "accept-encoding": "gzip, deflate, br",
          "accept-language": "zh-CN,zh;q=0.9"
        }
      });
    };

    // const getColumnInfo = (url_token) => {
    //   return request.get(path.getColumnInfoPath(url_token));
    // };

    const createNote = (formData) => {
      return request.post(
        path.getNotesPath(),
        {
          ...formData,
          title: Date.now(),
          at_bottom: false
        },
        {
          headers: {
            accept: "application/json",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "zh-CN,zh;q=0.9"
            // referer: path.getWritePath()
          }
        }
      );
    };

    const saveNote = (formData) => {
      const { notebook_id, ...rest } = formData;
      return request.put(
        path.getSaveNotePath(formData.id),
        {
          ...rest,
          autosave_control: 1
        },
        {
          headers: {
            accept: "application/json",
            referer: "https://www.jianshu.com/writer"
          }
        }
      );
    };

    const publish = (formData) => {
      return request.post(
        path.getPublishPath(formData.id),
        {},
        {
          headers: {
            accept: "application/json"
          }
        }
      );
    };

    const formData = {
      notebook_id: "",
      id: "", //note Id
      title: "",
      content: ""
    };

    //获取noteId
    const notebooks = await getNotebooks();

    // if (notebooks) {
    formData.notebook_id = Array.isArray(notebooks) && notebooks[0].id;
    // }

    const data = await createNote(formData);

    if (data) {
      formData.id = data.id;

      //todo:save md
      const md = await readFile(articlePath);
      const result = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(md);

      formData.content = md.replace(result[0], "");
      formData.content = marked(formData.content).replace(/\n*/g, "");
      formData.title = result[1];

      await saveNote(formData);
      await publish(formData);
    }
  }
};
