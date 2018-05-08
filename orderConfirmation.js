"use strict";
// global variables
var order;

function parseData(){
	loadFromStorage();
	/*document.getElementById("orderidT").value = order;
    document.getElementById("nameT").innerHTML = localStorage.lnameStorage + ", " + localStorage.fnameStorage;
    document.getElementById("emailT").innerHTML = localStorage.emailStorage;
    document.getElementById("phoneT").innerHTML = localStorage.phoneStorage;
    document.getElementById("addressT").innerHTML = localStorage.addressStorage;
    document.getElementById("cardT").innerHTML = localStorage.cardStorage;
    document.getElementById("planT").innerHTML = localStorage.planStorage;
    document.getElementById("totalT").innerHTML = getCurrency(localStorage.priceStorage);
	document.getElementById("itemnameT").innerHTML = localStorage.itemNameStorage;
	document.getElementById("typeT").innerHTML = localStorage.itemTypeStorage;
	*/
	syncToStorage();
}

function getEstimatedDeliveryDate(){
	var delivDate = new Date();
	//.setDate(delivDate.getDate() + getWaitTime() + order.turnaround);
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
	order = orders[getOrderIdxById(Number(o_id))];
	createEventListeners();
	parseData();
}

if (window.addEventListener) {
	window.addEventListener("load", setUpPage(), false);
} 
