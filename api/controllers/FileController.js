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

var files = 'assets/templates';

var types = {
  // shkola: 'shkola.docx',
  // univer: 'univer.docx',
  // otziv: 'otziv.docx',
  uvedom_o_proverke: 'Уведомление о проведении проверки.docx',
};


var addProps = {
  uvedom_o_proverke: function(data){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    data['currentDate'] =  dd + '.' + mm + '.' + yyyy;
    return data;
  },
};

// function addProps(data){
//   var gendata = data;
//   return gendata;
// }
//
function genData(data, type){

  var genData = {};
  for (var prop in data){
    genData[prop] = data[prop].data;
  }

  genData = addProps[type](genData);
  return genData;
}

function getDoc(filePath, filename, data){
  var content = fs
      .readFileSync(path.resolve(filePath, filename), 'binary');

  var zip = new JSZip(content);
  var doc = new Docxtemplater();

  return doc.loadZip(zip).setData(data).render();
}

module.exports = {

  getFile: function(req, res) {

    var params = JSON.parse(req.param('params'));
    // var data = req.params.all();
    var filename = types[params.type];

    var newData = genData(params.data, params.type);

    if (req.method == 'POST'){

      try {

        var doc = getDoc(files, filename, newData);
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
        var doc = getDoc(files, filename, newData);
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

        res.attachment(filename); // Set disposition and send it.

        var buf = doc.getZip()
             .generate({type: 'nodebuffer'});

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

