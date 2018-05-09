"use strict";
// global variables
var order;

// Parses the data into the table
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
		document.getElementById("itemnameT").innerHTML = "";
		document.getElementById("itemtypeT").innerHTML = "";
	}
	syncToStorage();
}

function setUpPage(){
	loadFromStorage();
	parseData();
}

if (window.addEventListener) {
	window.addEventListener("load", setUpPage(), false);
} 
