var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var fs = require('fs');
var path = require('path');

const pathToTemplates = __dirname + '/assets/templates/';

var method_FileNameDictionary = {
  'expertConclusion': 'Экспертное заключение.docx',
};

function saveBuffer(buf, fileName) {
  fs.writeFileSync(pathToTemplates + fileName, buf);
}

function readDoc(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, pathToTemplates + fileName), 'binary',
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

function createDocBuffer(fileName, json, jsonObjConverter, nameCreator) {
  return readDoc(fileName)
    .then(doc => {
      var obj = JSON.parse(json);
      if (jsonObjConverter)
        obj = jsonObjConverter(obj);
      fileName = nameCreator(obj);
      doc.setData(obj);

      try {
        // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
        doc.render()
      }
      catch (error) {
        var e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties,
        }
        console.log(JSON.stringify({ error: e }));
        // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
        throw error;
      }

      return {
        buf: doc.getZip().generate({ type: 'nodebuffer' }),
        fileName,
      };
    })
}

function nameNormalizer(name) {
  return name.replace(/[/\*?|:<>"]{1}/g, '_');
}

/**
 * 
 * @param {object} json 
 * @param {string} json.expertConclusionDate - [Экспертное заключение.Дата]
 * @param {string} json.expertConclusionNumber - [Экспертное заключение.Номер]
 * @param {string} json.firstWhoDidExpertise - [Экспертное заключение.Кем проведена экспертиза.ФИО + Должность + Сведения об аккредитации]
 * @param {string} [json.secondWhoDidExpertise] - [Экспертное заключение.Эксперт.ФИО + Должность + Сведения об аккредитации],
 * @param {string} json.expertiseNumber - [Экспертиза.Номер определения о назначении экспертизы] 
 * @param {string} json.expertiseDate - [Экспертиза.Дата определения о назначении экспертизы] 
 * @param {string} json.verifyAgency - [Проверка.Орган, осущ. проверку. Наимеенование + Адрес]  
 * @param {string} json.listOfDocuments - [Экспертиза.перечень поступивших материалов]
 * @param {string} json.expertConclusionEstablish - [Экспертное заключение.В ходе экспертизы установлено]
 * @param {string} json.expertFinalConclusion - [Экспертное заключение.Выводы]
 * @param {string} json.infoAboutSamplesFromLaboratory - [Экспертиза.Сведения о пробах из лаборатории]
 * @param {string} json.expertInitials - [Экспертное заключение.Эксперт]
 * @return {Promise} next .then get {buf, fileName}
 */
function printExpertConclusion(json) {
  var converter = (data) => {
    if (data.secondWhoDidExpertise)
      data.secondWhoDidExpertise += ',';
    else
      data.secondWhoDidExpertise = "";
    return data;
  };
  var nameCreator = (data) => {
    return 'Экспертное заключение ' + nameNormalizer(data.expertConclusionNumber) + '.docx'
  };

  var fileName = method_FileNameDictionary['expertConclusion'];
  return createDocBuffer(fileName, json, converter, nameCreator)
}
module.exports = {
  printExpertConclusion,
};