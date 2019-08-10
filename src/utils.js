const chrome = require('chrome-cookies-secure');
const fs = require('fs');

const readFile = (path)=>{
  return new Promise((resolve,reject)=>{
    fs.readFile(path,'utf8',(err,data)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(data)
    })
  })
}

const getCookie = (path)=>{
  return new Promise((resolve,reject)=>{
      chrome.getCookies(path,(err,cookie)=>{
        if(err){ 
          reject(err)
        }
        const str = Object.keys(cookie).reduce((str,key)=>{
          return str += `${key}=${cookie[key]}; `
        },'')
        resolve(str)
    })
  })
}

module.exports = {
  getCookie,
  readFile
}