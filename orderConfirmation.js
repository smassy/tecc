
'use strict';


var order;
var locationArray;

// Parses the data into the table
function parseData(){
	var locationData = decodeURIComponent(location.search);
	locationArray = [];
	locationData = locationData.substring(1, locationData.length);
	while (locationData.indexOf("+") !== -1) {
		locationData = locationData.replace("+", " ");
	}
	locationData = decodeURIComponent(locationData);
	locationArray = locationData.split("&");
	for (var i = 0; i < locationArray.length; i++) {
		if (/o_id/.test(locationArray[i])) {
			document.getElementById("orderidT").innerHTML = locationArray[i];
			order = orders[getOrderIdxById(locationArray[i].slice(locationArray[i].indexOf("=") + 1))];
		} else if (/firstName/.test(locationArray[i])) {
			document.getElementById("nameT").innerHTML = locationArray[i + 1] + " " + locationArray[i] ;
		} else if (/lastName/.test(locationArray[i])) {
			document.getElementById("nameT").innerHTML += "<br />" + locationArray[i + 1] + " " + locationArray[i] ;
		} else if (/email/.test(locationArray[i])) {
			document.getElementById("emailT").innerHTML = locationArray[i];
		} else if (/phone/.test(locationArray[i])) {
			document.getElementById("phoneT").innerHTML = locationArray[i];
		} else if (/address/.test(locationArray[i])) {
			document.getElementById("addressT").innerHTML = locationArray[i];
		} else if (/country/.test(locationArray[i])) {
			document.getElementById("addressT").innerHTML += "<br />" + locationArray[i];
		} else if (/state/.test(locationArray[i])) {
			document.getElementById("addressT").innerHTML += "<br />" + locationArray[i];
		} else if (/city/.test(locationArray[i])) {
			document.getElementById("addressT").innerHTML += "<br />" + locationArray[i];
		} else if (/zipcode/.test(locationArray[i])) {
			document.getElementById("addressT").innerHTML += "<br />" + locationArray[i];
		} else if (/cardNumber/.test(locationArray[i])) {
				document.getElementById("cardT").innerHTML = locationArray[i];
		} else if (/plan/.test(locationArray[i])) {
			document.getElementById("planT").innerHTML = locationArray[i];
		}
		document.getElementById("totalT").innerHTML = getCurrency(localStorage.priceStorage);
	}
}

function getEstimatedDeliveryDate(){
	var delivDate = new Date();
	delivDate.setDate(delivDate.getDate() + getWaitTime(order.id)).toLocaleString();
	var ddate = delivDate.toLocaleString();
	document.getElementById("eddT").innerHTML = "Estimated delivery date: " + ddate.slice(0, ddate.indexOf(","));
}

function createEventListeners(){
	var dateField = document.getElementById("eddT");
	if (dateField.addEventListener) {
		dateField.addEventListener("load", getEstimatedDeliveryDate, false);
	} 
}
	
function setUpPage(){
	parseData();
	getEstimatedDeliveryDate();
	createEventListeners();
}

if (window.addEventListener) {
	window.addEventListener("load", setUpPage, false);
} 
