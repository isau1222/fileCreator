
var {nameNormalizer, createDocBuffer} = require('./assetWorkers.js');

var typesDictionary = {
  protocolOfAdminisrativeOffense: {
    func: printProtocolOfAdminisrativeOffense,
    fileName: 'Протокол об АП.docx',
  },
  claimLetter: {
    func: printClaimLetter,
    fileName:  'Претензионное письмо',
  },
  expertConclusion: {
    func: printExpertConclusion,
    fileName: 'Экспертное заключение.docx',
  },
};

//в квадратных скобках необязательный аргумент
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
function printExpertConclusion() {
  var converter = (data) => {
    if (data.secondWhoDidExpertise)
      data.secondWhoDidExpertise += ',';
    else
      data.secondWhoDidExpertise = "";
    return data;
  };

  var nameCreator = (data) => {
    return 'Экспертное заключение' + nameNormalizer(data.expertConclusionNumber) + '.docx';
  };
  return {
    converter,
    nameCreator,
  };
}

/**
 * 
 * @param {object} json 
 * @param {string} json.verifyAgencyFullname - [Проверка.Орган, осущ.проверку.Наименование]
 * @param {string} json.verifyAgencyAddress - [Проверка.Орган, осущ.проверку.Адрес субъекта ГД]
 * @param {string} json.verifyAgencyPhone - [Проверка.Орган, осущ.проверку. телефон субъекта ГД]
 * @param {string} json.claimLetterDate - [Ущерб.Дата (претенз. письма)]
 * @param {string} json.claimNumber - [Ущерб.Номер (претенз. письма)
 * @param {string} json.claimLetterToAddress - [Ущерб.В адрес]
 * @param {string} json.claimLetterToName - [Ущерб.На имя]
 * @param {string} json.verifyAgencyName - [Проверка.Орган, осущ. проверку]
 * @param {string} json.verificationTermsFrom - [Результат. Сроки фактического проведения проверки: от]
 * @param {string} json.verificationTermsTo - [Сроки фактического проведения проверки: до] 
 * @param {string} json.typeOfVerification - [Проверка.вид проверки]
 * @param {string} json.companyForVerificate - [Проверка.Предприятие]
 * @param {string} json.placeOfVerification - [Результат.фактическое место проведения проверки]
 * @param {string} json.damageSummary - [Ущерб.Краткое содержание]
 * @param {string} json.verifyAgencyLeader - [Проверка.Орган, осущ. проверку.Руководителя]
 * @param {string} json.fullNameOfCurrentUser - [ФИО текущего пользователя]
 * @param {string} json.phoneOfCurrentUser - [Субъект ГД текущего пользователя.телефон]
 * @return {Promise} next .then get {buf, fileName}
 */
function printClaimLetter() {

  var converter = undefined;

  var nameCreator = (data) => {
    return 'Претензионное письмо' + nameNormalizer(data.claimNumber)
      + ' в адрес ' + nameNormalizer(data.claimLetterToAddress) + '.docx';
  };
  return {
    converter,
    nameCreator,
  };
}

/**
 * 
 * @param {object} json 
 * @param {string} json.currentUserSubjectFullname - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.currentUserSubjectAddress - [Адрес Субъекта ГД текущего пользователя]
 * @param {string} json.administrativeOffenseNumber - [Дело об АП.№ постановления (протокола, определения)]
 * @param {string} json.administrativeOffenseDate - [Дело об АП.Дата постановления (протокола, определения)]
 * @param {string} json.administrativeOffensePlace - [Дело об АП.Место]
 * @param {string} json.inspectorPosition - [Дело об АП.должность инспектора] 
 * @param {string} json.inspectorFullname - [Дело об АП.ФИО инспектора] 
 * @param {string} json.inspectorSertificateNumber - [Дело об АП.реквизиты служебного удостоверения]
 * @param {string} json.infoAboutWitnessesAndVictims - [Дело об АП.Сведения о свидетелях и потерпевших]
 * @param {string} json.suspectFullname - [Дело об АП.Наименование лица, в отношении которого возбуждено дело]
 * @param {string} json.placeOfViolation - [Результат.Фактическое место проведения]
 * @param {string} json.typeOfViolation - [Нарушение.Тип нарушения] 
 * @param {string} json.natureOfViolation - [Нарушение.Характер нарушения]
 * @param {array} json.violatedActs - массив нарушенных правовых актов
 * @param {string} json.violatedActs.actNumber - [Положения нарушенных правовых актов.Номер пункта/статьи] 
 * @param {string} json.violatedActs.actName -  [Наименование НПА из справочника]
 * @param {string} json.violatedActs.fullText - [Положения нарушенных правовых актов.Текст статьи, пункта НПА из справочника]
 * @param {string} json.reasonForCreatingCase - [Дело об АП.Повод для возбуждения дела]
 * @return {Promise} next .then get {buf, fileName}
 */
function printProtocolOfAdminisrativeOffense() {
  var converter = (data) => {
    data['currentUserSubjectFullname'.toUpperCase()] = data.currentUserSubjectFullname;
    return data;
  };
  var nameCreator = (data) => {
    return 'Протокол об административном правонарушении.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

function printFromType(type, json) {
  var fileName = typesDictionary[type].fileName;
  var { converter, nameCreator } = typesDictionary[type].func();
  return createDocBuffer(fileName, json, converter, nameCreator);
}

module.exports = {
  printFromType,
};