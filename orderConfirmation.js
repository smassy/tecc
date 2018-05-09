"use strict";
// global variables
var orderId = (location.search.slice(location.search.indexOf("=") + 1));
var order;

function parseData(){
	var locationData = decodeURIComponent(location.search);
	var locationArray = [];
	locationData = locationData.substring(1, locationData.length);
	while (locationData.indexOf("+") !== -1) {
		locationData = locationData.replace("+", " ");
	}
	locationData = decodeURIComponent(locationData);
	locationArray = locationData.split("&");
	for (var i = 0; i < locationArray.length; i++) {
		document.getElementById("orderidT").innerHTML = locationArray[i];
		document.getElementById("nameT").innerHTML = locationArray[i + 1] + " " + locationArray[i + 2] ;
		document.getElementById("emailT").innerHTML = locationArray[i + 3];
		document.getElementById("phoneT").innerHTML = locationArray[i + 4];
		document.getElementById("addressT").innerHTML = locationArray[i + 5];
		document.getElementById("cardT").innerHTML = locationArray[i + 10];
		document.getElementById("planT").innerHTML = locationArray[i + 15];
		document.getElementById("totalT").innerHTML = getCurrency(localStorage.priceStorage);
		document.getElementById("itemnameT").innerHTML = orders.item[name];
		document.getElementById("typeT").innerHTML = orders.item[type];
	}
	syncToStorage();
}

function getEstimatedDeliveryDate(){
	var delivDate = new Date();
	//setDate(delivDate.getDate() + getWaitTime() + order.turnaround);
	document.getElementById("eddT").innerHTML = delivDate.toLocaleString();
}


function createEventListeners(){
	var dateField = document.getElementById("eddT");
	if (dateField.addEventListener) {
		dateField.addEventListener("load", getEstimatedDeliveryDate(), false);
	}
}


function setUpPage(){
	loadFromStorage();
	order = orders[getOrderIdxById(Number(orderId))];
	createEventListeners();
	parseData();
}

if (window.addEventListener) {
	window.addEventListener("load", setUpPage(), false);
} 
