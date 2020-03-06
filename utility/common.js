//====API Call by axios
//import axios from "axios";
var axios = require('axios')
module.exports = new (function () {
  this.ConvertDateYMD = function (ISODatetime_React) {
    let d = new Date(ISODatetime_React),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear().toString();

    if (month.length < 2) {
      month = "-0" + month;
    } else {
      month = "-" + month;
    }
    if (day.length < 2) {
      day = "-0" + day;
    } else {
      day = "-" + day;
    }
    let dateYMD = [year, month, day].join("");

    return dateYMD;
  };

  this.AutoGenerateNumber = function (prefix, id, charlength) {
    charlength = charlength || 10;
    let d = new Date(),
      month = "" + (d.getMonth() + 1),
      year = d
        .getFullYear()
        .toString()
        .substr(-2);
    //,day = '' + d.getDate();

    if (month.length < 2) month = "0" + month;
    //if (day.length < 2) day = '0' + day;

    //var number = [year, month, day].join('');
    let number = [year, month].join("");
    let zero = [];
    if (prefix) {
      number = prefix + number;
    }
    charlength = charlength - number.length;
    for (let i = id.toString().length; i < charlength; i++) {
      zero.push("0");
    }
    if (id) {
      number = [number, zero.join(""), id].join("");
    } else {
      number = [number, zero.join("")].join("");
    }
    return number;
  };

  this.isLetter = letter => {
    const regx = /^[A-Za-z]+$/;
    return regx.test(letter);
  };

  /* this.toCamelCase = (str) => {
    str = str.toLowerCase()
    .split(' ')
    .map(word => {
        for (let i = 0; i < word.length; i++) {
            const char = word[i]
            if (this.isLetter(char)) {                    
                return word.replace(word[i], word[i].toUpperCase());
            }
        }
    });
    return str.join(' ');        
} */

  this.toCamelCase = str => {
    if (str.length > 0) {
      str = str.replace(/\b[a-z]/gi, letter => letter.toUpperCase());
    }
    return str;
  };

  this.getYearMonthNumber = () => {
    let date = new Date(),
      month = "" + (date.getMonth() + 1),
      year = date
        .getFullYear()
        .toString()
        .substr(-2);

    if (month.length < 2) month = "0" + month;
    return [year, month].join("");
  };

  this.getNextNumberFromCode = (prefixLength, code) => {
    let codeNumber = 0;
    let strCodeNumber = code.slice(prefixLength, code.length);
    codeNumber = parseInt(strCodeNumber) + 1;
    return codeNumber;
  };

  this.apiCall = async (method, url, data) => {
    if (method === "get") {
      let result
      if (data) {
        result = await axios.get(url, data);
      } else {
        result = await axios.get(url);
      }
      return result.data.data;
    }
    if (method === "post") {
      let result = await axios.post(url, { addUserDetails: data });
      return result.data;
    }
  };
})();
