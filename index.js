const fs = require('fs')
const path = require('path')

const yazl = require('yazl')
const _fetch = require('node-fetch')
const { URLSearchParams } = require('url')
const FormData = require('form-data')


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

        


        compiler.hooks.done.tapAsync('WebPackZip', (stats,callback) => {
            const outputPath = compiler.options.output.path
            let _zip = new yazl.ZipFile()

            // 把打包路径下所有文件都加到zip中
            // 如果excludeFile有这个名称则排除
            const _fnAddFile = options => {
                let filePath = options.source + '/' + options.name;
                if(self.options.excludeFile.includes(options.name)) return;
                let stat = fs.lstatSync(filePath);
                if(stat.isFile()){
                    _zip.addFile(filePath, options.name);
                }else{
                    _zip.addEmptyDirectory(options.name);
                    fs.readdirSync(filePath).forEach( f => _fnAddFile({source:options.source, name: options.name+'/'+ f}));
                }
            }

            const _fnUploadHuawei = options => {
				process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
				const appid = options.appid;
				if(!options.username || !options.password) {
                    throw new Error("请配置账号和密码！");
                    return;
                }
				const params = new URLSearchParams()
				params.append('username', options.username)
				params.append('password', options.password)
				return _fetch('https://cloudlinkworkplace-login.huaweicloud.com/sso/v1/oidc/token', {
					method: 'POST',
					body: params,
					headers: {
						'rejectUnauthorized': 'false',
						'Content-Type': "application/x-www-form-urlencoded;charset=UTF-8"
					}
				}).then(res => res.json())
				.then(json => {
					console.log(json)
					const token = `Bearer ${json.access_token}`
					const stream = fs.createReadStream(options.zipname)
					const form = new FormData()
					form.append(appid, stream)
					return _fetch('https://cloudlinkworkplace-api.huaweicloud.com/wedebugcloud/rest/ide/uploadDevelopFile', {
						method: 'POST',
						body: form,
						headers: {
							'Authorization': token,
							'rejectUnauthorized': 'false',
						}
					}).then(res => res.json())
				})
			}

            fs.readdirSync(outputPath).forEach( f => {
                const options = {
                    source: outputPath,
                    name: f,
                }
                _fnAddFile(options)
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























