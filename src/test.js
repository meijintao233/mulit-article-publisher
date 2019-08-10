const fs = require("fs");

// (async ()=>{
//  fs.readFile('./src/file.md',"utf8",(err,data)=>{
//   //  console.log(data.replace(/^---\s+title:(.*)\s/,'666\n'))
//    const a = /^---\s*title:\s?(.*)\s*(.*:\s?.*\s)*---\s*/.exec(data);
//    const b = data.replace(a[0],'')
//    console.log(a)
//  })
// })()
const os = require("os");
const sqlite3 = require("sqlite3");
const chrome = require("chrome-cookies-secure");
(async () => {
  // const homeDir = os.homedir();
  chrome.getCookies("https://mp.toutiao.com/", (err, cookie) => {
    const a = Object.keys(cookie).reduce((str, key) => {
      return (str += `${key}=${cookie[key]}; `);
    }, "");
    console.log(a);
    console.log(cookie);
  });
  // const d = cookie.map(c =>({
  //   key:c.name,
  //   value: new Buffer(JSON.parse(c.encrypted_value),'utf-8').toString()
  // }))
  // console.log(d)
})();
