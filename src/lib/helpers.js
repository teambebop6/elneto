'use strict';

var moment = require('moment');

var monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

var dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

var shortDayNames = [];
dayNames.forEach(function(dayName){
  shortDayNames.push(dayName.slice(0,3));
});

var shortMonthNames = [];
monthNames.forEach(function(monthName){
  shortMonthNames.push(monthName.slice(0,3));
});

// Helpers
exports.formatPrice = function(price){
  return "CHF " + (parseFloat(price) / 100).toFixed(2);
}

exports.formatDateWithDDMMYYYY = function(date){
  return moment(date).format('DD/MM/YYYY');
}

exports.formatStandardDate = function(date){
  return moment(date).format('L');
}

exports.formatDate = function(date){
  if(!date){
    return "";
  }

  return ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth()+1)).slice(-2) + "/" + date.getFullYear();
}

exports.formatFullDateString = function(date){
  if(!date){ return ""; }

  return dayNames[date.getDay()] + ", " + date.getDate() + ". " + monthNames[date.getMonth()] + " " + date.getFullYear();
}

exports.formatDateString = function(date){
  if(!date){ return ""; }

  return shortDayNames[date.getDay()] + " " + date.getDate() + " " + shortMonthNames[date.getMonth()] + " " + date.getFullYear();
}

exports.isMultiDay = function(trip){
  if(!trip.date_begin || !trip.date_end){ return ""; }

  return (trip.date_begin.toDateString() != trip.date_end.toDateString())
}

exports.days_duration_string = function(trip){
  if(!trip.date_begin || !trip.date_end){ return ""; }

  var days = Math.ceil(Math.abs(trip.date_end.getTime() - trip.date_begin.getTime()) / (1000 * 3600 * 24));
  return days > 1 ? days + " Tage" : days + " Tag";
}
exports.days_duration = function(trip){
  if(!trip.date_begin || !trip.date_end){ return ""; }

  var days = Math.ceil(Math.abs(trip.date_end.getTime() - trip.date_begin.getTime()) / (1000 * 3600 * 24));
  return days;
}

exports.yell = function (msg) {
  return msg.toUpperCase();
};

exports.dashIfEmpty = function(value){
  if(!value || value == ""){
    value = "-";
  }
  return value;
}
