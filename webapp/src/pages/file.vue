<template>
  <div>
    <h4 class="error" v-if="error">{{error}}</h4>

    <h1>HELLO</h1>

    <div>
      <select v-model="selected">
        <option disabled value="">Выберите один из вариантов</option>
        <option v-for="(value, propertyName) in items">
        {{ value.name }}
        </option>
      </select>
    </div>

    <form v-if="chosenItem" v-on:submit.prevent="loadFile">
      <h2>
        {{chosenItem.name}}
      </h2>
      <div v-for="(value, propertyName) in chosenItem.data">
        <div>
          {{ value.meta }} <input  type="text" v-model="chosenItem.data[propertyName].data"> <br>
        </div>
      </div>
      Отправить: <input type="submit" value="Отправить">
    </form>
  </div>
</template>


<style lang="scss">
  .error{
    color: red;
  }
</style>

<script>
var utils = require('@/utils');
var api = require('@/api');
// var axios = require('axios');

module.exports = {

  name: 'File',

  route: {
    meta: {
      crumb: 'File',
    },
  },

  data() {
    return {
      selected: '',
      error: null,
      chosenItem: '',
      type: null,
      info:{
        firstName: '',
        lastName: '',
      },
      items: {
        // shkola: {
        //   type: 'shkola',
        //   name: 'Школа',
        //   data:{
        //     firstName: {
        //       meta: 'Имя',
        //       data: '',
        //     },
        //     lastName: {
        //       meta: 'Фамилия',
        //       data: '',
        //     },
        //   },
        // },
        // univer: {
        //   type: 'univer',
        //   name: 'Университет',
        //   data:{
        //     firstName: {
        //       meta: 'Имя',
        //       data: '',
        //     },
        //     lastName: {
        //       meta: 'Фамилия',
        //       data: '',
        //     },
        //     phone: {
        //       meta: 'Телефон',
        //       data: '',
        //     },
        //   },
        // },
        // otziv: {
        //   type: 'otziv',
        //   name: 'Отзыв',
        //   data:{
        //     firstName: {
        //       meta: 'Имя',
        //       data: '',
        //     },
        //     lastName: {
        //       meta: 'Фамилия',
        //       data: '',
        //     },
        //     patronymic: {
        //       meta: 'Отчество',
        //       data: '',
        //     },
        //     smth: {
        //       meta: 'Smth',
        //       data: '',
        //     },
        //   },
        // },
        uvedom_o_proverke: {
          type: 'uvedom_o_proverke',
          name: 'Уведомление о проведении проверки',
          data:{
            subjectName: {
              meta: 'НАИМЕНОВАНИЕ СУБЪЕКТА ГД ТЕК. ПОЛЬЗОВАТЕЛЯ',
              data: 'ООО РИЭЛ ГЕО ПРОДЖЕКТ',
              type: 'name',
            },
            subjectAddress: {
              meta: 'Адрес Субъекта ГД текущего пользователя',
              data: 'Улица пушкина, дом колотушкина',
              type: 'name',
            },
            creationDate: {
              meta: 'ДАТА_СОЗДАНИЯ',
              data: '10.09.1998',
              type: 'name',
            },
            companyName: {
              meta: 'Предприятие.Наименование организации',
              data: 'Риэл Гео Прожект',
              type: 'name',
            },
            companyUrAddress: {
              meta: 'Предприятие.Юридический адрес',
              data: 'Улица есенина, дом каруслина',
              type: 'name',
            },
            companyOgrn: {
              meta: 'Предприятие. ОГРН\\ОГРНИП',
              data: '1488',
              type: 'name',
            },
            companyInn: {
              meta: 'Предприятие.ИНН',
              data: '1337',
              type: 'name',
            },
            companyDealAddress: {
              meta: 'Предприятие.Адрес фактического осуществления деятельности',
              data: 'Квартира петровых, спросить у бобровых',
              type: 'name',
            },
            taskDate: {
              meta: 'Задание.ДАТА',
              data: '10.02.1945',
              type: 'name',
            },
            taskNumber: {
              meta: 'ЗАДАНИЕ.НОМЕР',
              data: '322',
              type: 'name',
            },
            taskRights: {
              meta: 'Задание.Правовые основания для проведения проверки',
              data: 'Суд',
              type: 'name',
            },
            taskStartDate: {
              meta: 'Задание.ДАТА_НАЧАЛА',
              data: '12.03.2007',
              type: 'name',
            },
            verificationType: {
              meta: 'вид проверки',
              data: 'плановая',
              type: 'name',
            },
            verificationForm: {
              meta: 'форма проверки',
              data: 'документарная',
              type: 'name',
            },
            lastName: {
              meta: 'Фамилия исполнителя',
              data: 'Барышников',
              type: 'name',
            },
            i: {
              meta: 'И исполнителя',
              data: 'Б',
              type: 'name',
            },
            o: {
              meta: 'О исполнителя',
              data: 'Б',
              type: 'name',
            },
          },
        },
      },
    };
  },
  // computed: {
  //   chosenItem: function () {
  //     for(var item in this.items){
  //       if (this.items[item].name == this.selected){
  //         return this.items[item];
  //       }
  //     }
  //   },
  // },
  watch: {
    selected(val) {
      for(var item in this.items){
        if (this.items[item].name == this.selected){
          this.chosenItem = this.items[item];
          return;
        }
      }
    },
  },
  methods: utils.merge([
    {
      loadFile() {

        function getParamsFromJSON(values){
          var params = '?';

          for(var name in values) {
            var value = values[name].data;
            params += name + '=' + value + '&';
          }
          return params;
        }
        // var jsonObject = JSON.parse(this.chosenItem.data);
        // console.log(jsonObject);
        var str = JSON.stringify(this.chosenItem);
        // console.log(str);
        // return;


        var path = 'file/getFile';
        // var params = getParamsFromJSON(this.chosenItem.data);
        // params += 'type' + '=' + this.chosenItem.type + '&';
        // console.log(params);

        var params = '?params=' + str;
        location.replace(path + params);
        // api.post(path + params)
        //     .then(response => {
        //       console.log(response);
        //       location.replace(path + params);
        //       this.error = null;
        //     })
        //     .catch(err => {
        //       this.error = err.response.data.message;
        //       console.log(err.response.data.message);
        //     });
      },
    },
  ]),
};
</script>
