var {

  nameNormalizer,
  createDocBuffer,
  createXLSXBuffer,
} = require('./assetWorkers.js');

var typesDictionary = {
  protocolOfAO: {
    func: printProtocolOfAO,
    fileName: 'Протокол об АП.docx',
  },
  claimLetter: {
    func: printClaimLetter,
    fileName: 'Претензионное письмо.docx',
  },
  expertConclusion: {
    func: printExpertConclusion,
    fileName: 'Экспертное заключение.docx',
  },
  decreeAboutAdministrativePunishment: {
    func: printDecreeAboutAdministrativePunishment,
    fileName: 'Постановление о назначении административного наказания.docx',
  },
  actOfVerification: {
    func: printActOfVerification,
    fileName: 'Акт проведения проверки.docx',
  },
  checkingNotification: {
    func: checkingNotification,
    fileName: 'Уведомление о проведении проверки.docx',
  },
  directiveNotification: {
    func: directiveNotification,
    fileName: 'Распоряжение о проведении проверки.docx',
  },
  raidTask: {
    func: raidTask,
    fileName: 'Рейдовое задание.docx',
  },
  actOfSurvey: {
    func: printActOfSurvey,
    fileName: 'Акт обследования (рейд).docx',
  },
  predpisanie: {
    func: predpisanie,
    fileName: 'Предписание.docx',
  },
  agreementInProcuracy: {
    func: printAgreementInProcuracy,
    fileName: 'Заявление о согласовании в прокуратуре.docx',
  },
  specialistProvision: {
    func: specialistProvision,
    fileName: 'Заявление на предоставление специалиста.docx',
  },
  specialistSamplesAccept: {
    func: specialistSamplesAccept,
    fileName: 'Об участии специалиста в отборе проб.docx',
  },
  specialistSamplesDecline: {
    func: specialistSamplesDecline,
    fileName: 'О невозможности участия специалиста в отборе проб.docx',
  },
};

var XLSXTypesDictionary = {
  annualPlanOfPlannedInspections: {
    func: printAnnualPlanOfPlannedInspections,
    fileName: 'Ежегодный план плановых проверок.xlsx',
  },
};

//в квадратных скобках необязательный аргумент
/**
 *
 * @PIO-369
 * @param {object} json
 * @param {object} json.expertConclusion - экспертное заключение.
 * @param {string} json.expertConclusion.date - [Экспертное заключение.Дата]
 * @param {string} json.expertConclusion.number - [Экспертное заключение.Номер]
 * @param {object} json.expertise - экспертиза
 * @param {string} json.expertConclusion.firstWhoDidExpertise - [Экспертное заключение.Кем проведена экспертиза.ФИО + Должность + Сведения об аккредитации]
 * @param {string} [json.expertConclusion.secondWhoDidExpertise] - [Экспертное заключение.Эксперт.ФИО + Должность + Сведения об аккредитации],
 * @param {string} json.expertise.number - [Экспертиза.Номер определения о назначении экспертизы]
 * @param {string} json.expertise.date - [Экспертиза.Дата определения о назначении экспертизы]
 * @param {string} json.expertise.verifyAgency - [Проверка.Орган, осущ. проверку. Наимеенование + Адрес]
 * @param {string} json.expertise.listOfDocuments - [Экспертиза.перечень поступивших материалов]
 * @param {string} json.expertConclusion.establish - [Экспертное заключение.В ходе экспертизы установлено]
 * @param {string} json.expertConclusion.final - [Экспертное заключение.Выводы]
 * @param {string} json.expertise.infoAboutSamplesFromLaboratory - [Экспертиза.Сведения о пробах из лаборатории]
 * @param {string} json.expertise.expertInitials - [Экспертное заключение.Эксперт]
 * @return {Promise} next .then get {buf, fileName}
 */
function printExpertConclusion() {
  var converter = (data) => {
    if (data.expertise) {
      if (data.expertise.secondWhoDidExpertise)
        data.expertise.secondWhoDidExpertise += ',';
      else
        data.expertise.secondWhoDidExpertise = "";
    } else {
      throw new Error('Template need expertise information!');
    }
    return data;
  };

  var nameCreator = (data) => {
    return 'Экспертное заключение' + nameNormalizer(data.expertConclusion.number) + '.docx';
  };
  return {
    converter,
    nameCreator,
  };
}

/**
 *
 * @PIO-155
 * @param {object} json
 * @param {object} json.verification - проверка
 * @param {object} json.verification.verifyAgency - проеряющий орган
 * @param {string} json.verification.verifyAgency.fullname - [Проверка.Орган, осущ.проверку.Наименование]
 * @param {string} json.verification.verifyAgency.address - [Проверка.Орган, осущ.проверку.Адрес субъекта ГД]
 * @param {string} json.verification.verifyAgency.phone - [Проверка.Орган, осущ.проверку. телефон субъекта ГД]
 * @param {object} json.claimLetter - претенз. письмо
 * @param {string} json.claimLetter.date - [Ущерб.Дата (претенз. письма)]
 * @param {string} json.claimLetter.number - [Ущерб.Номер (претенз. письма)
 * @param {string} json.claimLetter.toAddress - [Ущерб.В адрес]
 * @param {string} json.claimLetter.toName - [Ущерб.На имя]
 * @param {string} json.verification.verifyAgency.name - [Проверка.Орган, осущ. проверку]
 * @param {string} json.result - результаты проверки
 * @param {string} json.result.terms - сроки проверки
 * @param {string} json.result.terms.from - [Результат. Сроки фактического проведения проверки: от]
 * @param {string} json.result.terms.to - [Сроки фактического проведения проверки: до]
 * @param {string} json.verification.type - [Проверка.вид проверки]
 * @param {string} json.verification.companyForVerificate - [Проверка.Предприятие]
 * @param {string} json.result.place - [Результат.фактическое место проведения проверки]
 * @param {string} json.damage - ущерб
 * @param {string} json.damage.summary - [Ущерб.Краткое содержание]
 * @param {string} json.verification.verifyAgency.leader - [Проверка.Орган, осущ. проверку.Руководителя]
 * @param {string} json.currentUser - текущий пользователь
 * @param {string} json.currentUser.fullname - [ФИО текущего пользователя]
 * @param {string} json.currentUser.subject - субъект ГД текущего пользователя
 * @param {string} json.currentUser.subject.phone - [Субъект ГД текущего пользователя.телефон]
 * @return {Promise} next .then get {buf, fileName}
 */
function printClaimLetter() {

  var converter = undefined;

  var nameCreator = (data) => {
    return 'Претензионное письмо' + nameNormalizer(data.claimLetter.number) +
      ' на адрес ' + nameNormalizer(data.claimLetter.toAddress) + '.docx';
  };
  return {
    converter,
    nameCreator,
  };
}

/**
 *
 * @PIO-141-1
 * @param {object} json
 * @param {string} json.currentUser.subject.fullname - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.currentUser.subject.address - [Адрес Субъекта ГД текущего пользователя]
 * @param {string} json.AO.number - [Дело об АП.№ постановления (протокола, определения)]
 * @param {string} json.AO.date - [Дело об АП.Дата постановления (протокола, определения)]
 * @param {string} json.AO.place - [Дело об АП.Место]
 * @param {string} json.AO.inspector.position - [Дело об АП.должность инспектора]
 * @param {string} json.AO.inspector.fullname - [Дело об АП.ФИО инспектора]
 * @param {string} json.AO.inspector.sertificateNumber - [Дело об АП.реквизиты служебного удостоверения]
 * @param {string} json.AO.infoAboutWitnessesAndVictims - [Дело об АП.Сведения о свидетелях и потерпевших]
 * @param {string} json.AO.suspectFullname - [Дело об АП.Наименование лица, в отношении которого возбуждено дело]
 * @param {string} json.result.placeOfViolation - [Результат.Фактическое место проведения]
 * @param {string} json.violation.type - [Нарушение.Тип нарушения]
 * @param {string} json.violation.nature - [Нарушение.Характер нарушения]
 * @param {array} json.violation.violatedActs - массив нарушенных правовых актов
 * @param {string} json.violation.violatedActs.actNumber - [Положения нарушенных правовых актов.Номер пункта/статьи]
 * @param {string} json.violation.violatedActs.actName -  [Наименование НПА из справочника]
 * @param {string} json.violation.violatedActs.fullText - [Положения нарушенных правовых актов.Текст статьи, пункта НПА из справочника]
 * @param {string} json.AO.reasonForCreatingCase - [Дело об АП.Повод для возбуждения дела]
 * @return {Promise} next .then get {buf, fileName}
 */
function printProtocolOfAO() {
  var converter = undefined;
  var nameCreator = (data) => {
    return 'Протокол об административном правонарушении.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 *
 * @PIO-141-2
 * @param {object} json
 * @param {string} json.currentUser.subject.fullname - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.currentUser.subject.address - [Адрес Субъекта ГД текущего пользователя]
 * @param {string} json.solution.date - [Решение по делу.вид решения с кодом 03.Дата решения]
 * @param {string} json.AO.place - [Дело об АП.Место]
 * @param {string} json.AO.inspector.position - [Дело об АП.должность инспектора]
 * @param {string} json.AO.inspector.fullname - [Дело об АП.ФИО инспектора]
 * @param {string} json.AO.inspector.sertificateNumber - [Дело об АП.реквизиты служебного удостоверения]
 * @param {string} json.AO.suspectFullname - [Дело об АП.Наименование лица, в отношении которого возбуждено дело]
 * @param {string} json.result.placeOfViolation - [Результат.Фактическое место проведения]
 * @param {string} json.violation.type - [Нарушение.Тип нарушения]
 * @param {string} json.violation.nature - [Нарушение.Характер нарушения]
 * @param {string} json.AO.number - [Дело об АП.№ постановления (протокола, определения)]
 * @param {string} json.AO.date - [Дело об АП.Дата постановления (протокола, определения)]
 * @param {string} json.AO.amountOfFineUL - [Дело об АП.Сумма штрафа ЮЛ]
 * @param {string} json.AO.amountOfFineFLIPDL - [Дело об АП.Сумма штрафа  ФЛ/ИП/ДЛ]
 * @param {string} json.AO.wayOfDelivery - [Дело об АП.Способ вручения]
 * @param {string} json.AO.whoGotAndInfoAboutPostOffice - [Дело об АП. Кто получил/Сведения о почтовом отправлении]
 * @param {string} json.AO.proofOfPayment - [Дело об АП.Дата факт.оплаты]
 * @param {string} json.AO.paymentRequisites -[Дело об АП.Реквизиты платежного документа]
 * @return {Promise} next .then get {buf, fileName}
 */
function printDecreeAboutAdministrativePunishment() {
  var converter = undefined;
  var nameCreator = (data) => {
    return 'Постановление о назначении административного наказания.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 *
 * @PIO-110-1
 * @param {object} json
 * @param {string} json.currentUser.subject.fullname - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.currentUser.subject.addressAndPhone -[Адрес и телефон из справочника «Субъекты ГД»]
 * @param {string} json.act.draftingPlace - [Место составления акта]
 * @param {string} json.act.date.dateFormat - [Дата, время составления акта в формате даты]
 * @param {string} json.act.date.timeFormat - [Дата, время составления акта в формате время]
 * @param {string} json.act.number - [№ акта]
 * @param {string} json.verification.place - [Фактическое место проведения]
 * @param {string} json.basis.task.number - [Основание:Задание.Номер]
 * @param {string} json.basis.task.date -  [Основание:Задание.Дата]
 * @param {string} json.verification.type - [Проверка.вид]
 * @param {string} json.verification.form - [Проверка.форма проведения]
 * @param {string} json.verification.company.name -  [Проверка.Предприятие.Название организации]
 * @param {string} json.verification.terms - сроки проверки
 * @param {string} json.verification.terms.from - [Сроки фактического проведения проверки от]
 * @param {string} json.verification.terms.to - [Сроки фактического проведения проверки до]
 * @param {string} json.verification.terms.duration.days - [вычислить кол-во дней между сроками факт. проведения проверки от и до, вычесть субботу и вс]
 * @param {string} json.verification.terms.duration.hours - [Срок проведения, ч.]
 * @param {string} json.verification.requisitesOfApproval - [Проверка.Реквизиты согласования]
 * @param {string} json.verification.procuracyAgency - [Проверка.наименование органа прокуратуры, согл. проверку]
 * @param {string} json.verification.inspector.fullname - [ФИО инспектора]
 * @param {string} json.verification.inspector.sertificateNumber - [Реквизиты служ. удостоверения]
 * @param {string} json.verification.peopleWhoDidVerification - [Лица, проводившие проверку]
 * @param {string} json.verification.peopleWhoWereOnVerification - [Руководитель, иные представители проверяемого лица, присутствовавшие при проверке]
 * @param {string} json.verification.result - [Результат]
 * @param {string} json.verification.reasonsOfImpossibility - [Причины невозможности проведения проверки]
 * @param {array} json.verification.[violationTypes] - нарушения, сортированные по типам
 * @param {array} json.verification.violationTypes.type - [Нарушение.тип нарушения]
 * @param {array} json.verification.violationTypes.nature - [Нарушение.Характер нарушения]
 * @param {array} json.verification.violationTypes.violatedActs - нарушенные правовые акты
 * @param {string} json.verification.violationTypes.violatedActs.number - [Положения нарушенных правовых актов.Номер пункта/статьи]
 * @param {string} json.verification.violationTypes.violatedActs.name - [Наименование НПА]
 * @param {string} json.verification.violationTypes.violatedActs.fullText - [Положения нарушенных правовых актов.Текст]
 * @param {string} json.verification.violationTypes.peopleWhoDidIt - [Нарушение.Лица, допустившие нарушение]
 * @param {string} json.act.acquaintance - [Ознакомление/Отказ только для значения «Отказ»]
 *
 * @return {Promise} next .then get {buf, fileName}
 */
function printActOfVerification() {
  var converter = (data) => {
    if (data.basis) {
      data.hasBasis = true;
    }
    else {
      data.hasBasis = false;
    }
    if (data.verification.result === "Невыявлены  нарушения" ||
      data.verification.result === "Невозможно провести проверку") {
      data.verification.pointer = '.';
    }
    else {
      data.verification.pointer = ':';
    }
    if (data.verification.violationTypes) {
      for (var violType of data.verification.violationTypes) {
        if (violType.violatedActs) {
          for (var violActIndex in violType.violatedActs) {
            if (violActIndex === '0') {
              violType.violatedActs[violActIndex].violatedFirstInfo = "Согласно:";
            }
            else {
              violType.violatedActs[violActIndex].violatedFirstInfo = "";
            }
          }
        }
      }
    }
    return data;
  };
  var nameCreator = (data) => {
    return 'Акт_' + nameNormalizer(data.act.number) + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}



/**
 *
 * @PIO-110-2
 * @param {object} json
 * @param {string} json.currentUser.subject.fullname - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.currentUser.subject.addressAndPhone -[Адрес и телефон из справочника «Субъекты ГД»]
 * @param {string} json.act.number - [№ акта]
 * @param {string} json.act.date.dateFormat - [Дата, время составления акта в формате даты]
 * @param {string} json.act.draftingPlace - [Место составления акта]
 * @param {string} json.verification.terms - сроки проверки
 * @param {string} json.verification.terms.from - [Сроки фактического проведения проверки от]
 * @param {string} json.verification.terms.to - [Сроки фактического проведения проверки до]
 * @param {string} json.act.date.timeFormat - [Дата, время составления акта в формате время]
 * @param {string} json.verification.place - [Фактическое место проведения]
 * @param {string} json.verification.inspector.position - [Дело об АП.должность инспектора]
 * @param {string} json.verification.inspector.fullname - [Дело об АП.ФИО инспектора]
 * @param {string} json.verification.inspector.sertificateNumber - [Дело об АП.реквизиты служебного удостоверения]
 * @param {string} json.basis.task.number - [Основание:Задание.Номер]
 * @param {string} json.basis.task.date -  [Основание:Задание.Дата]
 * @param {string} json.verification.peopleWhoDidVerification - [Лица, проводившие проверку]
 * @param {string} json.verification.result - [Результат]
 * @param {string} json.verification.reasonsOfImpossibility - [Причины невозможности проведения проверки]
 * @param {array} json.verification.[violationTypes] - нарушения, сортированные по типам
 * @param {array} json.verification.violationTypes.type - [Нарушение.тип нарушения]
 * @param {array} json.verification.violationTypes.nature - [Нарушение.Характер нарушения]
 * @param {array} json.verification.violationTypes.violatedActs - нарушенные правовые акты
 * @param {string} json.verification.violationTypes.violatedActs.number - [Положения нарушенных правовых актов.Номер пункта/статьи]
 * @param {string} json.verification.violationTypes.violatedActs.name - [Наименование НПА]
 * @param {string} json.verification.violationTypes.violatedActs.fullText - [Положения нарушенных правовых актов.Текст]
 * @param {string} json.verification.violationTypes.peopleWhoDidIt - [Нарушение.Лица, допустившие нарушение]

 * @param {string} json.act.acquaintance - [Ознакомление/Отказ только для значения «Отказ»]
 *
 * @return {Promise} next .then get {buf, fileName}
 */

function printActOfSurvey() {
  var converter = (data) => {
    if (data.basis) {
      data.hasBasis = true;
    }
    else {
      data.hasBasis = false;
    }
    if (data.verification.result === "Невыявлены  нарушения" ||
      data.verification.result === "Невозможно провести проверку") {
      data.verification.pointer = '.';
    }
    else {
      data.verification.pointer = ':';
    }
    if (data.verification.violationTypes) {
      for (var violType of data.verification.violationTypes) {
        if (violType.violatedActs) {
          for (var violActIndex in violType.violatedActs) {
            if (violActIndex === '0') {
              violType.violatedActs[violActIndex].violatedFirstInfo = "Согласно:";
            }
            else {
              violType.violatedActs[violActIndex].violatedFirstInfo = "";
            }
          }
        }
      }
    }
    return data;
  };
  var nameCreator = (data) => {
    return 'Акт_' + nameNormalizer(data.act.number) + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 *
 * @PIO-70-1
 * @param {object} json
 * @param {string} json.currentDate - [Текущая_дата]
 * @param {string} json.procuracyAgency - [Наименование органа прокуратуры, согл. проверку]
 * @param {string} json.subjectGDAndAddress - [Субъект ГД + Адрес (из справочника)]
 * @param {string} json.company
 * @param {string} json.company.fullnameAndAddressAndNumber - [сущность «Предприятие».Наименование предприятия/ФИО ИП +юридический адрес + ОГРН/ОГРИП + ИНН]
 * @param {string} json.company.realAddress - [Адрес фактического осуществления деятельности]
 * @param {string} json.verification.registerDate - [сущность "Проверка".Дата государственной регистрации]
 * @param {string} json.verification.lastVerificationDate - [сущность "Проверка".Дата окончания последней проверки]
 * @param {string} json.verification.dateOfBeginActivity - [сущность "Проверка" .Дата начала осуществления хозяйственной деятельности]
 * @param {string} json.verification.anotherBasis - [сущность "Проверка".иные основания]
 * @param {string} json.verification.beginDate - [Плановое начало проверки]
 * @param {string} json.leader - [ФИО руководителя Субъекта ГД]
 *
 * @return {Promise} next .then get {buf, fileName}
 */

function printAgreementInProcuracy() {
  var converter = (data) => {
    return data;
  };
  var nameCreator = (data) => {
    return 'Заявление о согласовании в прокуратуре.docx';
  };

  return {
    converter,
    nameCreator,
  };
}


/**
 * @param {object} json
 * @param {string} json.year - [ГОД]
 * @param {string} json.verification.confirmPerson - [сущность "Проверка".Лицо, утверждающее план проверок]
 * @param {string} json.verification.documentRequisites - [сущность "Проверка".Реквизиты документа, утверждающего проверку]
 * @param {array} json.companies - массив компаний
 * @param {array} json.companies
 * @param {array} json.companies.name - [сущность "Предприятие".НАИМЕНОВАНИЕ ПРЕДПРИЯТИЯ]
 * @param {array} json.companies.juridicalAddress - [сущность "Предприятие". Юридический адрес (место жительства ИП)]
 * @param {array} json.companies.realAddress - [сущность "Предприятие" .Адрес фактического осуществления деятельности]
 * @param {array} json.companies.OGRNOrOGRNIP - [сущность "Предприятие".ОГРН/ОГРНИП]
 * @param {array} json.companies.INN - [сущность "Предприятие".ИНН]
 * @param {array} json.companies.verification.goal - [сущность "проверка".цель]
 * @param {array} json.companies.verification.registerDate - [сущность "Проверка".Дата государственной регистрации]
 * @param {array} json.companies.verification.lastVerificationDate - [сущность "Проверка".Дата окончания последней проверки]
 * @param {array} json.companies.verification.dateOfBeginActivity - [сущность "Проверка".Дата начала осуществления хозяйственной деятельности]
 * @param {array} json.companies.verification.anotherBasis - [сущность "Проверка".Иные основания]
 * @param {array} json.companies.verification.beginDate.formatMM - [сущность "Проверка". Плановое начало проверки в формате "ММ" ]
 * @param {array} json.companies.verification.duration.days - [сущность "Проверка".Срок проведения плановой проверки (дн)]
 * @param {array} json.companies.verification.duration.hours - [сущность "проверка".Срок проведения плановой проверки (раб.часов)]
 * @param {array} json.companies.verification.code - [сущность "Проверка". форма проведения проверки - код (из справочника форм)]
 * @param {array} json.companies.verification.controlAgency - [сущность "Проверка".Органы контроля, участвующие в проверке совместно]
 * @param {array} json.companies.dangerCalss - [сущность "предприятие". класс опасности]
 * @param {array} json.companies.ERP - [сущность "проверка".Номер по ЕРП]
 */
function printAnnualPlanOfPlannedInspections() {
  var converter = (data) => {
    for (var companyIndex in data.companies) {
      data.companies[companyIndex].number = Number(companyIndex)+1;
      data.companies[companyIndex].whiteSpace='';
    }
    return data;
  };
  var nameCreator = (data) => {
    return 'Ежегодный план плановых проверок.xlsx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-103
 * @param {object} json
 * @param {string} json.year - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.subject.address - [Адрес Субъекта ГД текущего пользователя]
 * @param {string} json.creationDate - [ДАТА_СОЗДАНИЯ]
 * @param {string} json.company.name - [Предприятие.Наименование организации]
 * @param {string} json.company.urAddress - [Предприятие.Юридический адрес]
 * @param {string} json.company.ogrn - [Предприятие. ОГРН\ОГРНИП]
 * @param {string} json.company.inn - [Предприятие.ИНН]
 * @param {string} json.company.dealAddress - [Предприятие.Адрес фактического осуществления деятельности]
 * @param {string} json.task.date - [Задание.ДАТА]
 * @param {string} json.task.number - [ЗАДАНИЕ.НОМЕР]
 * @param {string} json.task.rights - [Задание.Правовые основания для проведения проверки]
 * @param {string} json.task.startDate - [Задание.ДАТА_НАЧАЛА]
 * @param {string} json.verification.type - [вид проверки]
 * @param {string} json.verification.form - [форма проверки]
 * @param {string} json.fio - [Фамилия И. О.]
 * @param {string} json.currentDate - [текущая дата]
 * @return {Promise} next .then get {buf, fileName}
 */
function checkingNotification() {
  var converter = (data) => {
    // var today = new Date();
    // var dd = today.getDate();
    // var mm = today.getMonth()+1; //January is 0!
    // var yyyy = today.getFullYear();
    // data['currentDate'] =  dd + '.' + mm + '.' + yyyy;

    return data;
  };
  var nameCreator = (data) => {
    return 'Уведомление по проверке' + nameNormalizer(data.task.number) + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-95-1
 * @param {object} json
 * @param {string} json.subject.name - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.subject.address - [Адрес Субъекта ГД текущего пользователя]
 * @param {string} json.subject.head - [Руководитель Субъекта ГД]
 * @param {string} json.date - [ДАТА]
 * @param {string} json.number - [НОМЕР]
 * @param {string} json.verification.type - [вид проверки]
 * @param {string} json.verification.form - [форма проверки]
 * @param {string} json.company.name - [Предприятие.Наименование организации]
 * @param {string} json.company.inn - [Предприятие.ИНН]
 * @param {string} json.company.urAddress - [Предприятие.Юридический адрес]
 * @param {string} json.company.dealAddress - [Предприятие.Адрес фактического осуществления деятельности]
 * @param {string} json.post - [Должность]
 * @param {string} json.inspector - [Инспектор (ФИО)]
 * @param {string} json.serviceCertificate - [Служебное удостоверение]
 * @param {string} json.involvedPersons - [Лица, привлекаемые к участию]
 * @param {string} json.cheking.target - [Проверка.Цель]
 * @param {string} json.cheking.tasks - [Проверка.Задачи]
 * @param {string} json.cheking.object - [Проверка.Предмет проверки]
 * @param {int} json.cheking.days - [Проверка.Cрок проведения (дн)]
 * @param {string} json.cheking.startDate - [Проверка.Дата начала]
 * @param {string} json.cheking.endDate - [Проверка.Дата окончания]
 * @param {string} json.cheking.rights - [Проверка.Правовые основания для проведения]
 * @param {string} json.controlActivities - [Мероприятия по контролю за соблюдением обязательных требований]
 * @param {string} json.reglamentList - [Список адм. регламентов по осуществлению проверки]
 * @param {string} json.documentList - [Список обязательных документов]
 * @return {Promise} next .then get {buf, fileName}
 */
function directiveNotification() {
  var converter = (data) => {
    return data;
  };
  var nameCreator = (data) => {
    return 'Задание по проверке' + nameNormalizer(data.number) + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-95-2
 * @param {object} json
 * @param {string} json.subject.name - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.subject.address - [Адрес Субъекта ГД текущего пользователя]
 * @param {string} json.date - [ДАТА]
 * @param {string} json.number - [НОМЕР]
 * @param {string} json.cheking.target - [Проверка.ПРОВЕРКА_ЦЕЛЬ]
 * @param {string} json.cheking.rights - [Проверка.ПРАВОВЫЕ-ОСНОВАНИЯ]
 * @param {string} json.cheking.startDate - [Проверка.Дата начала]
 * @param {string} json.cheking.endDate - [Проверка.Дата окончания]
 * @param {string} json.controlActivities - [Мероприятия по контролю за соблюдением обязательных требований]
 * @param {string} json.cheking.territory - [ПРОВЕРКА_ТЕРРИТОРИЯ]
 * @param {string} json.cheking.route - [ПРОВЕРКА_МАРШРУТ]
 * @param {string} json.post - [Должность]
 * @param {string} json.inspector - [Инспектор (ФИО)]
 * @param {string} json.serviceCertificate - [Служебное удостоверение]
 * @param {string} json.involvedPersons - [Лица, привлекаемые к участию]
 * @param {int} json.days - [срок составления акта (дн)]
 * @param {string} json.subject.head - [Руководитель Субъекта ГД]
 * @param {string} json.fio - [ФИО текущего пользователя]
 * @param {string} json.subject.phone - [телефон субъекта ГД]
 * @return {Promise} next .then get {buf, fileName}
 */
function raidTask() {
  var converter = (data) => {
    return data;
  };
  var nameCreator = (data) => {
    return 'Задание по проверке' + nameNormalizer(data.number) + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-117
 * @param {object} json
 * @param {string} json.subject.name - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
 * @param {string} json.subject.address - [Адрес Субъекта ГД текущего пользователя]
 * @param {string} json.subject.phone - [телефон Субъекта ГД]
 * @param {string} json.number - [Номер]
 * @param {string} json.act.draftingPlace - [Место составления акта]
 * @param {string} json.act.date - [Дата вынесения]
 * @param {string} json.result.actNumber - [Результат.№ акта (через нарушение)]
 * @param {string} json.result.actDate - [Результат.Дата составления акта]
 * @param {string} json.inspector.post - [Должность инспектора]
 * @param {string} json.inspector.fio - [ФИО инспектора]
 * @param {string} json.inspector.sertificateNumber - [Реквизиты служебного удостоверения]
 * @param {string} json.violation.persons - [Нарушение. Список лиц, допустивших нарушение]
 * @param {string} json.content - [Содержание предписания]
 * @param {string} json.time - [Срок исполнения]
 * @param {string} json.reason - [Основание]
 * @param {string} json.gettingDate - [Дата получения]
 * @param {string} json.sendingDate - [Дата отправления]
 * @param {string} json.postalNumber - [№ почтового отправления]
 */
function predpisanie() {
  var converter = (data) => {
    return data;
  };
  var nameCreator = (data) => {
    return 'Предписание_' + nameNormalizer(data.number) + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-166-1
 * @param {object} json
 * @param {string} json.verification.verifyAgency.fullname - [Проверка.Орган, осущ.проверку.Наименование]
 * @param {string} json.verification.verifyAgency.address - [Проверка.Орган, осущ.проверку.Адрес субъекта ГД]
 * @param {string} json.verification.verifyAgency.phone - [Проверка.Орган, осущ.проверку. телефон субъекта ГД]
 * @param {string} json.verification.verifyAgency.subjectName - [Проверка.Орган,осущ.проверку. Наименование субъекта ГД]
 * @param {string} json.specialistParticipation - Участие специалиста
 * @param {string} json.specialistParticipation.reqDate - [Участие специалиста.Заявка на дату]
 * @param {string} json.verification.type - [Проверка.Вид проверки]
 * @param {string} json.verification.company.fullName - [Проверка.Предприятие.Наименование_предприятия]
 * @param {string} json.verification.territory - [Проверка.Территория]
 * @param {string} json.specialistParticipation.selectionObject.name - [Участие специалиста.Объект отбора.Название]
 * @param {string} json.specialistParticipation.issuedBy - [Участие специалиста.Кем утв.заявка]
 */
function specialistProvision() {
  var converter = (data) => {
    return data;
  };
  var nameCreator = (data) => {
    return 'Заявление на предоставление специалиста' + nameNormalizer('1337') + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-166-2
 * @param {object} json
 * @param {string} json.specialistParticipation.reqDate - [Участие специалиста.Заявка на дату]
 * @param {string} json.specialistParticipation.lab.name - [Участие специалиста. Лаборатория. Наименование]
 * @param {string} json.specialistParticipation.specialist.post - [Участие специалиста. Специалист. Должность]
 * @param {string} json.specialistParticipation.specialist.fio - [Участие специалиста. Специалист. ФИО]
 * @param {string} json.specialistParticipation.specialist.accreditation - [Участие специалиста. Специалист. Сведения об аккредитации]
 * @param {string} json.verification.verifyAgency.subjectName - [Проверка.Орган,осущ.проверку. Наименование субъекта ГД]
 */
function specialistSamplesAccept() {
  var converter = (data) => {
    return data;
  };
  var nameCreator = (data) => {
    return 'Об участии специалиста в отборе проб' + nameNormalizer('1337') + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-166-3
 * @param {object} json
 * @param {string} json.specialistParticipation.explanations - [Участие специалиста.Пояснения]
 * @param {string} json.specialistParticipation.reqDate - [Участие специалиста.Заявка на дату]
 * @param {string} json.verification.verifyAgency.subjectName - [Проверка.Орган,осущ.проверку. Наименование субъекта ГД]
 */
function specialistSamplesDecline() {
  var converter = (data) => {
    return data;
  };
  var nameCreator = (data) => {
    return 'О невозможности участия специалиста в отборе проб' + nameNormalizer('1337') + '.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @param {string} type
 * @param {object} json
 * @return {Promise} next .then get {buf, fileName}
 */
function printFromType(type, json) {
  if (typesDictionary[type]) {
    let fileName = typesDictionary[type].fileName;
    let {
      converter,
      nameCreator,
    } = typesDictionary[type].func();
    return createDocBuffer(fileName, json, converter, nameCreator);
  }
  else if (XLSXTypesDictionary[type]) {
    let fileName = XLSXTypesDictionary[type].fileName;
    let {
      converter,
      nameCreator,
    } = XLSXTypesDictionary[type].func();
    return createXLSXBuffer(fileName, json, converter, nameCreator);
  }
  else {
    throw new Error('Unrecognized type!');
  }
}

module.exports = {
  printFromType,
};
