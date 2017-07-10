var {
  nameNormalizer,
  createDocBuffer
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
  var converter = (data) => {
    data.CURRENTUSER = {};
    data.CURRENTUSER.SUBJECT = {};
    data.CURRENTUSER.SUBJECT.FULLNAME = data.currentUser.subject.fullname;
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
  var {
    converter,
    nameCreator,
  } = typesDictionary[type].func();
  return createDocBuffer(fileName, json, converter, nameCreator);
}

module.exports = {
  printFromType,
};
