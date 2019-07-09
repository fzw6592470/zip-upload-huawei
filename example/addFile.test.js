
const _yazl = require('yazl');
const fs = require('fs');

let _zip = new _yazl.ZipFile();
const zipname = "123.zip";

_srcPath = "./src"

let self = {
	options: {
		excludeFile: ["static"]
	}
}

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

fs.readdirSync(_srcPath).forEach( f => {
    const options = {
        source: _srcPath,
        name: f,

    }
    _fnAddFile(options)
})
_zip.outputStream.pipe(fs.createWriteStream(zipname)).on("close", function() {
	console.log("done");
	// //自动上传华为
	// _fnUploadHuawei( self.options ).then( result => {
	// 	console.log(result);
	// 	callback();
	// }).catch(err=>{
	// 	console.log(err)
	// 	//callback();
	// })
});
_zip.end();