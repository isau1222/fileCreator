/**
 * FileController
 *
 * @description :: Server-side logic for managing files
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

//путь к файлам
var files = 'assets/templates';

//словарь с именами файлов
var fileNameDictionary = {
  uvedom_o_proverke: 'Уведомление о проведении проверки.docx',
};

//обработчики методов. должны вернуть новую дату и имя будущего файлы
var methodHandlers = {
  uvedom_o_proverke: function(data){

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    data['currentDate'] =  dd + '.' + mm + '.' + yyyy;

    var fileName = fileNameDictionary.uvedom_o_proverke;

    return {
      json: data,
      fileName: fileName,
    };
  },
};

function readDoc(type) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(files, fileNameDictionary[type]), 'binary',
      (err, data) => {
        if (err) {
          console.log('rejhjjj');
          return reject(err);
        }
        var zip = new JSZip(data);
        var doc = new Docxtemplater();
        resolve(doc.loadZip(zip));
      })
  })
}

function getBuffer(type, json) {
  return readDoc(type)
    .then((doc) => {

      var result = methodHandlers[type](json);

      var fileName = result.fileName;
      var dataJson = result.json;

      doc.setData(dataJson);

      try {
        doc.render();
      }
      catch (error) {
        var e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties,
        }
        console.log(JSON.stringify({ error: e }));
        throw error;
      }
      return {
        buf: doc.getZip().generate({ type: 'nodebuffer' }),
        fileName: fileName,
      };
    })
}




//controller////controller////controller////controller////controller////controller////controller////controller////controller////controller//


var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs-extra');
var path = require('path');

module.exports = {
  getFile: function(req, res) {

    var type = req.param('type');
    var json = JSON.parse(req.param('json'));

    getBuffer(type, json).then(({buf, fileName})=>{
      res.attachment(fileName);

      const stream = require('stream');
      let datastream = new stream.PassThrough();
      datastream.end(buf);
      return datastream.pipe(res);
    });
  },
};

