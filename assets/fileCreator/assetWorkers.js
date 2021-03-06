var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var fs = require('fs');
var path = require('path');

const pathToTemplates = __dirname + '/../templates/';

var expressions = require("angular-expressions");
var angularParser = function (tag) {
  var expr = expressions.compile(tag);
  return { get: expr };
};

function nameNormalizer(name) {
  if (!name) {
    return '';
  }
  return name.toString().replace(/[/\*?|:<>"]{1}/g, '_');
}

function readDoc(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(pathToTemplates + fileName), 'binary',
      (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
  });
}

function createDocBuffer(fileName, json, jsonObjConverter, nameCreator) {
  return readDoc(fileName)
    .then(data => {
      var zip = new JSZip(data);
      var doc = new Docxtemplater();
      doc = doc.loadZip(zip);
      doc.setOptions({ parser: angularParser });
      var obj;
      if (typeof json === 'string') {
        obj = JSON.parse(json);
      }
      else {
        obj = json;
      }
      if (jsonObjConverter) {
        obj = jsonObjConverter(obj);
      }
      fileName = nameCreator(obj);

      doc.setData(obj);

      try {
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
        console.log(JSON.stringify({ error: e }));
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
        throw error;
      }

      return {
        buf: doc.getZip().generate({ type: 'nodebuffer' }),
        fileName,
      };
    });
}

var XLSXTemplate = require('xlsx-template');

function createXLSXBuffer(fileName, json, jsonObjConverter, nameCreator) {
  return readDoc(fileName)
    .then(data => {
      var obj;
      if (typeof json === 'string') {
        obj = JSON.parse(json);
      }
      else {
        obj = json;
      }
      if (jsonObjConverter) {
        obj = jsonObjConverter(obj);
      }
      fileName = nameCreator(obj);


      var template = new XLSXTemplate(data);
      var sheetNumber = 1;
      try {
        template.substitute(sheetNumber, obj);
      }
      catch (error) {
        var e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties,
        };
        console.log(JSON.stringify({ error: e }));
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
        throw error;
      }

      return {
        buf: template.generate({ type: 'nodebuffer' }),
        fileName,
      };
    });
}

module.exports = {
  nameNormalizer,
  createDocBuffer,
  createXLSXBuffer,
};
