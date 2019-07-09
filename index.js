const fs = require('fs')
const path = require('path')

const yazl = require('yazl')
const tinyJsonHttp = require('tiny-json-http')


class ZipUploadWebpackPlugin {

    constructor(options) {

        const userOptions = options || {}

        const defaultOptions = {
            autoUpload: true,
            zipname: "build",
            inject: true,
            compile: true,
            showErrors: true,
            excludeFile: []
        }

        this.options = Object.assign(defaultOptions, userOptions)
        
    }



    apply (compiler) {
        const self = this
        let isCompilationCached = false

        // zip压缩名称
        const zipname = this.options.zipname
        if (path.resolve(zipname) === path.normalize(zipname)) {
            this.options.zipname = path.relative(compiler.options.output.path, zipname)
        }

        // 给zip压缩名加上zip类型
        this.options.zipname += ".zip"

        // 把打包路径下所有文件都加到zip中
        // 如果excludeFile有这个名称则排除
        const _fnAddFile = options => {
            let filePath = options.source + '/' + options.name;
            if(options.excludeFile.includes(options.name)) return options._zip;
            let stat = fs.lstatSync(filePath);
            if(stat.isFile()){
                options.zip.addFile(filePath, options.name);
            }else{
                options.zip.addEmptyDirectory(options.name);
                fs.readdirSync(filePath).forEach( f => _fnAddFile({source:options.source, name: options.name+'/'+ f,zip:options.zip}));
            }

            return options.zip
        }

        const _fnUploadHuawei = options => {
            process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
            const appid = options.appid;
            if(!options.username || !options.password) {
                throw new Error("请配置账号和密码！");
                return;
            }
            return tinyJsonHttp.post({
                url: "https://cloudlinkworkplace-login.huaweicloud.com/sso/v1/oidc/token",
                headers: {
                    'Accept': 'application/json',
                    'rejectUnauthorized': 'false',
                    'User-Agent':'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)',
                    'Content-Type':'application/x-www-form-urlencoded'
                },
                data: {
                    username: options.username,
                    password: options.password
                }
            }).then(resp=>{
                const token = `Bearer ${resp.body.access_token}`
                const data = {}
                data[appid] = fs.createReadStream(options.zipname)
                return tinyJsonHttp.post({
                    url: "https://cloudlinkworkplace-api.huaweicloud.com/wedebugcloud/rest/ide/uploadDevelopFile",
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': token,
                        'rejectUnauthorized': 'false',
                        'User-Agent':'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)',
                        'Content-Type':'multipart/form-data'
                    },
                    data:data
                }).then(resp=>resp.body)
            })
        }


        compiler.hooks.done.tapAsync('WebPackZip', (stats,callback) => {
            const outputPath = compiler.options.output.path
            let _zip = new yazl.ZipFile()

            fs.readdirSync(outputPath).forEach( f => {
                const options = {
                    source: outputPath,
                    name: f,
                    zip: _zip,
                    excludeFile : self.options.excludeFile
                }
                _zip = _fnAddFile(options)
            })
            _zip.outputStream.pipe(fs.createWriteStream(this.options.zipname)).on("close", function() {
                // console.log("zip done")
                //自动上传华为
                if (self.options.autoUpload) {
                    _fnUploadHuawei( self.options ).then( result => {
                        console.log(result.msg)
                        callback()
                    }).catch(err=>{
                        console.log(err)
                    })
                }
            })
            _zip.end()
        })
    }

}


module.exports = ZipUploadWebpackPlugin























