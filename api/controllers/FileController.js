/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
// function getData(data){

//   for (var prop in data){
//     // console.log(prop);
//     if (data[prop].type == 'name'){
//       for (var i = 0; i < padejs.length; i++){
//         var newProp = prop + '_' + padejs[i];
//         // console.log(newProp);
//         // data[newProp] = data[prop].data + '_' + padejs[i];
//         data[newProp] = data[prop].data + '_' + padejs[i];
//       }

//     }else if(data[prop].type == 'phone'){
//       console.log('PHONE!!');
//     }
//     // for (var i = 0; i < padejs.length; i++){
//     //   var newProp = prop + '_' + padejs[i];
//     //   console.log(newProp);
//     //   // data[prop]
//     // }
//     data[prop] = data[prop].data;
//   }
//   return data;
// }

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

function getDoc(filePath, filename, data){
  var content = fs
      .readFileSync(path.resolve(filePath, filename), 'binary');

  var zip = new JSZip(content);
  var doc = new Docxtemplater();

  var genData = {};
  for (var prop in data){
    genData[prop] = data[prop].data;
  }

  return doc.loadZip(zip).setData(genData).render();
}

module.exports = {
  getFile: function(req, res) {

    var params = JSON.parse(req.param('params'));
    // var data = req.params.all();
    var filename = types[params.type];

    if (req.method == 'POST'){

      try {

        var doc = getDoc(files, filename, params.data);
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
        var doc = getDoc(files, filename, params.data);
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

