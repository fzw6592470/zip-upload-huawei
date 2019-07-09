var path = require('path');

var ZipUploadWebpackPlugin = require('..');

module.exports = {
	entry: './index.js',

	output: {
	    path: path.join(__dirname, 'build'),
	    publicPath: '',
	    filename: 'bundle.js'
  	},

  	plugins: [
  		new ZipUploadWebpackPlugin({
  			appid: "20190708113012615",
  			zipname: "20190708113012615",
  			username: "18779453377",
  			password: "834101",
  		})
  	]

}