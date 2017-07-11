var {
  nameNormalizer,
  createDocBuffer,
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
};

/* json emitation for test:
var json = {
      expertConclusion: {
        date: '30.11.1997',
        number: '73',
        establish: 'установлено что-то там',
        final: 'важный вывод тут',
        firstWhoDidExpertise: 'Аникин Андрей Сергеевич',
      },
      expertise: {
        number: '32',
        date: '02.12.1997',
        verifyAgency: 'ООО Проверочка',
        listOfDocuments: '3 пробирки, затупленный нож',
        infoAboutSamplesFromLaboratory: 'некая информация об образцах',
        expertInitials: 'Аникин А.С.',
      },
    };
*/
//в квадратных скобках необязательный аргумент
/**
 *
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


/* json emitation for test:
var json = {
      verification: {
        verifyAgency: {
          fullname: 'общество с ограниченной ответственностью Проверочка',
          name: 'ООО Проверочка',
          address: 'Ул. жуковского, дом 34',
          leader: 'Аникин Андрей Сергеевич',
          phone: '7903002002002',
        },
        type: 'типпроверкикакой-то',
        companyForVerificate: 'ООО РИэл Гео Проджект',
      },
      result: {
        terms: {
          from: '30.11.2017',
          to: '20.12.1017',
        },
        place: 'Ул. Строителей, дом 1',
      },
      damage: {
        summary:'разбито 3 стула',
      },
      claimLetter: {
        date: '01.01.2018',
        number: '123',
        toAddress:'ул. Тверская, д.4',
        toName: 'Аникин Андрей Сергеевич',
      },
      currentUser: {
        fullname: 'Рогозин Владислав Валерьевич',
        subject: {
          phone: '+79652704783',
        }
      },
    };
*/
/**
 *
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

/*  json emitation for test:
var json = {
  currentUser: {
    subject: {
      fullname: 'какой-то субъект',
      address: 'ул. Тверская, д.5',
    },
  },
  AO: {
    number: '12',
    date: '30.11.2000',
    place: 'ул. Орлова, д. 89',
    inspector: {
      position: 'сержант',
      fullname: 'Полное Имя Сержанта',
      sertificateNumber: '13312334-89',
    },
    infoAboutWitnessesAndVictims: 'Некая информация о свидетелях и жертвах',
    suspectFullname: 'Полное Имя Подозреваемоего',
    reasonForCreatingCase: 'Очень важная причина',
  },
  result: {
    placeOfViolation: 'место правонарушения',
  },
  violation: {
    type: 'тип правонарушения',
    nature: 'характер правонарушения',
    violatedActs: [
      {
        actNumber:'231',
        actName: 'Имя первого акта',
        fullText: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, voluptatem?',
      },
      {
        actNumber:'22',
        actName: 'Имя второго акта',
        fullText: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Excepturi, voluptatem?',
      },
    ],
  },
};*/

/**
 *
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
 * @param {string} json.verification.propleWhoWereOnVerification - [Руководитель, иные представители проверяемого лица, присутствовавшие при проверке]
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
    return 'Акт_'+nameNormalizer(data.act.number)+'.docx';
  };

  return {
    converter,
    nameCreator,
  };
}

/**
 * @PIO-103
 * @param {object} json
 * @param {string} json.subject.name - [НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ]
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
 * @param {string} type
 * @param {object} json
 * @return {Promise} next .then get {buf, fileName}
 */
function printFromType(type, json) {
  var fileName = typesDictionary[type].fileName;
  var {
    converter,
    nameCreator,
  } = typesDictionary[type].func();
  return createDocBuffer(fileName, json, converter, nameCreator);
}

module.exports = {
  printFromType,
};
