const axios = require("axios");
const qs = require("qs");
const fs = require("fs");
const marked = require("marked");

const utils = require("../utils");
/**
 * - 根据cookie:auth、auth.sig从auth接口获取token、clientId、userId
 * - 根据cookie:auth、auth.sig从draftStorage获取postId
 * - 根据token、clientId、userId、src获取标签Id
 * - 根据markdown从updateDraft接口保存md
 * - 根据postId从postPublish发布文章
 */
module.exports = {
  juejinPublisher: async (articlePath) => {
    const readFile = utils.readFile;
    const getCookie = utils.getCookie;
    const cookie = await getCookie("https://juejin.im/");

    const protocol = "https://";
    const base_host = "juejin.im";
    const version = "/v1";

    const juejin_path = {
      auth: `${protocol}${base_host}/auth`,
      categories: `${protocol}gold-tag-ms.${base_host}/${version}/categories`,
      draftStorage: `${protocol}post-storage-api-ms.${base_host}/${version}/draftStorage`,
      updateDraft: `${protocol}post-storage-api-ms.${base_host}/${version}/updateDraft`,
      postPublish: `${protocol}post-storage-api-ms.${base_host}/${version}/postPublish`
    };

    // base axios
    const request = axios.create({
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36",
        cookie: cookie
      }
    });

    // auth data
    const getAuthData = async () => {
      return request.get(juejin_path.auth);
    };

    const getPostId = async (formData) => {
      return request.post(
        juejin_path.draftStorage,
        {
          ...formData
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
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

    // update draft
    const doUpdateDraft = async (formData) => {
      //掘金 获取auth
      return request.post(
        juejin_path.updateDraft,
        {
          ...formData
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
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

    // getCatego
    const getCategories = async (formData) => {
      return request.get(juejin_path.categories, {
        headers: {
          "X-Juejin-Client": formData.device_id,
          "X-Juejin-Src": formData.src,
          "X-Juejin-Token": formData.token,
          "X-Juejin-Uid": formData.uid
        }
      });
    };

    const doPostPublish = async (formData) => {
      const transformData = Object.keys(formData).reduce((transformed, key) => {
        transformed[key] = encodeURIComponent(formData[key]);
        return transformed;
      }, {});
      return request.post(
        juejin_path.postPublish,
        {
          ...transformData
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
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

    let token = "";
    let device_id = "";
    let uid = "";
    let src = "web";
    let postId = "";
    let markdown = "";

    const formData = {
      token: "",
      device_id: "",
      uid: "",
      src: "web",
      postId: "",
      markdown: "",
      type: "markdown",
      title: "",
      html: "",
      screenshot: "",
      isTitleImageFullscreen: "",
      content: "",
      tags: "",
      category: ""
    };

    const authData = await getAuthData();

    if (authData && authData.data) {
      const auth = authData.data;
      formData.device_id = auth.clientId;
      formData.token = auth.token;
      formData.uid = auth.userId;
    }

    console.log(authData.data);

    const postIdData = await getPostId(formData);

    if (postIdData && postIdData.data && postIdData.data.d.length) {
      formData.postId = postIdData.data.d[0];
    }

    const categoriesData = await getCategories(formData);
    if (categoriesData && categoriesData.data && categoriesData.data.d) {
      const categoryList = categoriesData.data.d.categoryList;
      const category = categoryList.find(
        (category) => category.name === "前端"
      );
      if (category) {
        formData.category = category.id;
        formData.tags = category.tagId;
      }
    }

    //todo:save md
    const md = await readFile(articlePath);
    const result = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(md);
    formData.markdown = md.replace(result[0], "");
    //掘金根据html直接渲染
    formData.html = marked(formData.markdown);
    formData.title = result[1];

    console.log(formData);
    const doUpdateDraftData = await doUpdateDraft(formData);
    if (
      doUpdateDraftData &&
      doUpdateDraftData.data &&
      doUpdateDraftData.data.s === 1
    ) {
      doPostPublish(formData);
    }
  }
};
