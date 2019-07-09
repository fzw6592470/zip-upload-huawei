# zip-upload-huawei
 Automatically packaged into a zip archive and upload the Huawei wecode platform

 <h2 align="center">Install</h2>

 ```bash
npm i --save-dev zip-upload-huawei
 ```

 <h2 align="center">Usage</h2>

 ### Configuration
 #### `appid`

 Type: `String`

 Huawei wecode appid


 #### `zipname`

 Type: `String`
 Default: `build`

 The final zip name to be packaged, the default is "build", the final zip package name is "build.zip" or you enter the "zipname".zip


 #### `username`

 Type: `String`

 huawei cloudlink workplace login name


 #### `password`
 Type: `String`
 
 huawei cloudlink workplace login password

 #### `excludeFile`
 Type: `Array`

 Exclude packaged file list
 e.g: `["static"]`

 
 #### example

 **webpack.config.js**

 ```js
 const ZipUploadHuaWei = require('zip-upload-huawei');
 module.exports = {
  plugins: [
    new ZipUploadHuaWei({
      appid: '123456789123456789',
      zipname: '20190709',
      username: 'MartinCui',
      password: '123456',
      excludeFile: ['static']
    }),
  ]
 }
 ```


 ## License

 [MIT](./LICENSE)
