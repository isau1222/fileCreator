<template>
  <div>
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

<script>
var utils = require('@/utils');
var api = require('@/api');

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
      chosenItem: '',
      type: null,
      info:{
        firstName: '',
        lastName: '',
      },
      items: {
        shkola: {
          type: 'shkola',
          name: 'Школа',
          data:{
            firstName: {
              meta: 'Имя',
              data: '',
            },
            lastName: {
              meta: 'Фамилия',
              data: '',
            },
          },
        },
        univer: {
          type: 'univer',
          name: 'Университет',
          data:{
            firstName: {
              meta: 'Имя',
              data: '',
            },
            lastName: {
              meta: 'Фамилия',
              data: '',
            },
            phone: {
              meta: 'Телефон',
              data: '',
            },
          },
        },
        otziv: {
          type: 'otziv',
          name: 'Отзыв',
          data:{
            firstName: {
              meta: 'Имя',
              data: '',
            },
            lastName: {
              meta: 'Фамилия',
              data: '',
            },
            phone: {
              meta: 'Телефон',
              data: '',
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

        var postPath = 'file/createFile';
        var params = getParamsFromJSON(this.chosenItem.data);
        params += 'type' + '=' + this.chosenItem.type + '&';
        console.log(params);

        api.post(postPath + params)
          .then(res => {
            var getPath = res.data;
            window.open(getPath, "_self");
            this.$router.push(-1);
          })
          .catch(err => {
            alert(err.response.data.message);
          });
      },
    },
  ]),
};
</script>
