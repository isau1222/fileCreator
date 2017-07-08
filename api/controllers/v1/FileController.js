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
};

module.exports = {
  getFile: function(req, res) {
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
      // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
      // throw error;
      return;
    }
    var buf = doc.getZip()
                 .generate({type: 'nodebuffer'});

    const stream = require('stream');
    let datastream = new stream.PassThrough();
    datastream.end(buf);

    res.attachment(filename); // Set disposition and send it.

    return datastream.pipe(res);
  },
};

