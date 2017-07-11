/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const stream = require('stream');
var assets = require('../../assets/fileCreator/index.js');

module.exports = {
  getFile: function(req, res) {

    // var type = req.param('type');
    // var json = req.param('json');

        // var type = req.param('type');
    var json = {verification: ''};

    // if (!type || !json){
    //   return res.apiBadRequest();
    //   // return res.redirect('back');
    // }

    assets.printFromType('actOfVerification', json)
      .then(({buf, fileName})=>{
        res.attachment(fileName);

        let datastream = new stream.PassThrough();
        datastream.end(buf);
        return datastream.pipe(res);
      });
  },
};

