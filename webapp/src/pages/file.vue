<template>
  <div>
    <h1>HELLO</h1>

    <div>
      <select v-model="selected">
        <option disabled value="">Выберите один из вариантов</option>
        <option v-for="(value, propertyName) in types">
        {{ propertyName }}
        </option>
      </select>
    </div>

    <form v-if="selected" method="post" v-on:submit.prevent="loadFile">
      <h2>
        {{selected}}
      </h2>
      <div v-for="(value, propertyName) in chosenForm">
        <div v-if="propertyName != 'type'">
          {{ propertyName }} <input  type="text" v-model="chosenForm[propertyName]"> <br>
        </div>
      </div>
      Отправить: <input type="submit" value="Отправить">
    </form>

  </div>
</template>

<script>
var utils = require('@/utils');
var api = require('@/api');
// var fileSaver = require('@/file-saver');
// var streamSaver;

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
      type: null,
      info:{
        firstName: '',
        lastName: '',
      },
      types: {
        shkola: {
          type: 'shkola',
          firstName: '',
          lastName: '' ,
        },
        univer: {
          type: 'univer',
          firstName: '',
          lastName: '' ,
          phone: '' ,
        },
      },
      // [{
      //   firstName: '',
      //   lastName: '',
      // },
      // {
      //   firstName: '',
      //   lastName: '',
      // },]
    };
  },
  computed: {
    // геттер вычисляемого значения
    chosenForm: function () {
      // `this` указывает на экземпляр vm
      // return 'asdasasd';
      return this.types[this.selected];
    },
  },
  methods: utils.merge([
    {
      loadFile() {
        // if (!this.streamSaver || !this.fileSaver){
        //   return;
        // }
        // console.log(streamsaver);
        // console.log(this.info);

        // var url = Object.keys(this.info).map(function(k) {
        //   if (!this.info[k].isFunction()){
        //     return encodeURIComponent(k) + '=' + encodeURIComponent(this.info[k]);
        //   }
        // }).join('&');
        // console.log(url);
          // window.open(path,"_self")
          // this.$router.push(-1);

        // var sampleBytes = new Int8Array(4096);

        // var saveByteArray = (function () {
        //     var a = document.createElement("a");
        //     document.body.appendChild(a);
        //     a.style = "display: none";
        //     return function (data, name) {
        //         var blob = new Blob(data, {type: "octet/stream"}),
        //             url = window.URL.createObjectURL(blob);
        //         a.href = url;
        //         a.download = name;
        //         a.click();
        //         window.URL.revokeObjectURL(url);
        //     };
        // }());

        // saveByteArray([sampleBytes], 'example.txt');
        //
        // console.log(this.chosenForm);
        // return;
        // this.chosenForm.type = this.selected;
        function getParamsFromJSON(values){
          var params = '?';

          for(var name in values) {
            var value = values[name];
            params += name + '=' + value + '&';
          }
          return params;
        }

        // function addType(string, obj){
        //   return string += 'type' + '=' + obj.type + '&';
        // }

        var path = 'v1/file/getFile';
        var params = getParamsFromJSON(this.chosenForm);
        // params = addType(params, this.chosenForm);
        console.log(params);
        window.open('api/' + path + params, "_self");
        this.$router.push(-1);


        //
        // api.post(path)
        //   .then(res => {
        //     // saveByteArray([res.data], 'example.xlsx');
        //     console.log(res.data);
        //     // var blob = new Blob([res], {type: ''});
        //     // this.fileSaver.saveAs(blob, 'A.xlsx');
        //     // console.log(res.data);
        //     // const fileStream = streamsaver.createWriteStream('filename.xlsx');
        //     // const writer = fileStream.getWriter();
        //     // Later you will be able to just simply do
        //     // res.body.pipeTo(fileStream)

        //     // const reader = res.data.getReader();
        //     // console.log(reader);


        //     // const pump = () => reader.read()
        //     //     .then(({ value, done }) => {
        //     //       if (done){
        //     //         console.log('done!');
        //     //         writer.close();
        //     //       }else{
        //     //         console.log('writing...');
        //     //         writer.write(value).then(pump);
        //     //       }
        //     //     })
        //     //     .catch(err => {
        //     //       console.log(err);
        //     //     });
        //     // // Start the reader
        //     // pump()
        //     //   .then(() =>
        //     //     console.log('Closed the stream, Done writing')
        //     //   )
        //     //   .catch(err => {
        //     //     console.log(err);
        //     //   });
        //   })
        //   .catch(err => {
        //     console.log(err);
        //   });
      },
    },
  ]),

  mounted() {
    this.streamSaver = require('streamsaver');
    this.fileSaver = require('file-saver');
    // this.loadFile(streamSaver);
  },
};
</script>
