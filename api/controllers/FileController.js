/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs-extra');
var path = require('path');

var files = 'assets/files';

var types = {
  shkola: 'shkola.docx',
  univer: 'univer.docx',
  otziv: 'otziv.docx',
};

function getDoc(filePath, name, data){
  var content = fs
      .readFileSync(path.resolve(filePath, name), 'binary');

  var zip = new JSZip(content);
  var doc = new Docxtemplater();

  return doc.loadZip(zip).setData(data).render();
}

module.exports = {
  getFile: function(req, res) {

    var data = req.params.all();
    var filename = types[data.type];

    if (req.method == 'POST'){

      try {

        var doc = getDoc(files, filename, data);
      }
      catch (error) {
        var e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties,
        };
        console.log(JSON.stringify({error: e}));
        return res.apiBadRequest('Something bad(');
      }
      return res.ok('file/getFile');
    }else{

      try {
        var doc = getDoc(files, filename, data);
      }
      catch (error) {
        var e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties,
        };
        console.log(JSON.stringify({error: e}));
        return res.redirect(400, 'file');
      }

      try {
        var buf = doc.getZip()
                     .generate({type: 'nodebuffer'});

        res.attachment(filename); // Set disposition and send it.

        const stream = require('stream');
        let datastream = new stream.PassThrough();
        datastream.end(buf);
        return datastream.pipe(res);
      }
      catch (error) {
        console.log(error);
        return res.redirect(400, 'file');
      }
    }
  },

  // getFile: function(req, res) {

  //   try{
  //     let datastream = new Buffer.from(JSON.stringify(req.session.datastream));
  //     var filename = req.session.filename;

  //     res.attachment(filename); // Set disposition and send it.

  //     // const stream = require('stream');
  //     // let datastream = new stream.PassThrough();
  //     // datastream.end(buf);
  //     // req.session.buf = null;
  //     // req.session.filename = null;
  //     return datastream.pipe(res);
  //   }
  //   catch (error){
  //     console.log(error);
  //     return res.redirect(307, 'file');
  //   }
  // },
};

