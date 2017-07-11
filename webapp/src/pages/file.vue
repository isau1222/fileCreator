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
      <!-- <div v-for="(value, propertyName) in chosenItem.data">
        <div>
          {{ value.meta }} <input  type="text" v-model="chosenItem.data[propertyName].data"> <br>
        </div>
      </div> -->
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
        checkingNotification: {
          type: 'checkingNotification',
          name: 'Уведомление о проведении проверки',
          data:{
            subject:{
              name: 'ООО РИЭЛ ГЕО ПРОДЖЕКТ',
              address: 'Улица пушкина, дом колотушкина',
            },
            creationDate: '10.09.1998',
            company: {
              name: 'Макдоналдс',
              urAddress: 'Улица есенина, дом каруслина',
              ogrn: 'Предприятие. ОГРН\\ОГРНИП',
              inn: '1337',
              dealAddress: 'Квартира петровых, спросить у бобровых',
            },
            task: {
              date: '10.02.1945',
              number: '322',
              rights: 'Суд',
              startDate: '12.03.2007',
            },
            verification: {
              type: 'плановая',
              form: 'документарная',
            },
            fio: 'Барышников Б. Б.',
            currentDate: '10.07.2017',
          },
        },
        directiveNotification: {
          type: 'directiveNotification',
          name: 'Распоряжение о проведении проверки',
          data:{
            subject:{
              name: 'ООО РИЭЛ ГЕО ПРОДЖЕКТ',
              address: 'Улица пушкина, дом колотушкина',
              head: 'Руководитель Субъекта ГД',
            },
            date: '10.09.1998',
            number: '1488',
            verification: {
              type: 'плановая',
              form: 'документарная',
            },
            company: {
              name: 'Предприятие.Наименование организации',
              inn: '1337',
              urAddress: 'Улица есенина, дом каруслина',
              dealAddress: 'Квартира петровых, спросить у бобровых',
            },
            post: 'Проверяющий',
            inspector: 'Барышников Барыш Барышович',
            serviceCertificate: 'Какое-то служебное удостоверение',
            involvedPersons: 'Лица, привлекаемые к участию',
            cheking: {
              target: 'Какая-то цель проведения проверки',
              tasks: 'найти виновных, ...',
              object: 'коррупция',
              days: 5,
              startDate: '12.03.2007',
              endDate: '12.03.2008',
              rights: 'Суд',
            },
            controlActivities: 'Мероприятия по контролю за соблюдением обязательных требований',
            reglamentList: 'Список адм. регламентов по осуществлению проверки',
            documentList: 'Список обязательных документов',
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
        var path = 'file/getFile';

        var str = JSON.stringify(this.chosenItem.data);
        var params = '?type=' + this.chosenItem.type + '&json=' + str;
        // location.replace(path + params);
        window.open(path + params);

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
