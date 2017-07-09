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

module.exports = {
  createFile: function(req, res) {

    var data = req.params.all();
    var filename = types[data.type];

    try {
      //Load the docx file as a binary
      var content = fs
          .readFileSync(path.resolve(files, filename), 'binary');

      var zip = new JSZip(content);

      var doc = new Docxtemplater();
      doc.loadZip(zip);
      doc.setData(data);
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render();
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
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    }
    var buf = doc.getZip()
                 .generate({type: 'nodebuffer'});

    req.session.buf = buf;
    req.session.filename = filename;

    return res.ok('file/getFile');
  },

  getFile: function(req, res) {

    try{
      var buf = new Buffer.from(JSON.stringify(req.session.buf));
      var filename = req.session.filename;

      res.attachment(filename); // Set disposition and send it.

      const stream = require('stream');
      let datastream = new stream.PassThrough();
      datastream.end(buf);

      return datastream.pipe(res);
    }
    catch (error){
      return res.redirect(307, 'file');
    }
  },
};

