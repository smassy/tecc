/*
	  Internet-II Project

      Author : Patel, Parimal. 
	  Student-ID : 1586498
	  Course : Internet-II
	  Section : 2
	  Date : 02/05/2018
	  Electric Car Company

      Filename: landingPage.js
*/

"use strict";

function validateStock() {
   var stock = document.getElementById("stock");
   var errorDiv = document.getElementById("stockError");
   try {
	
	//if out of stock {
	if (stock.value === 0) {	
		throw "Currently out of stock";
		stock.style.background = "rgb(255,233,233)";
	}
	
	// if running low on stock
	else if(stock.value <= 4){
		throw "Running low on stock";
		stock.style.background = "rgb(255,255,0)";
	}
	
	// in stock
	else
	{
		throw "In stock";
		stock.style.background = "rgb(0,128,0)";	
	}
	
    catch(msg) {
      // display error message
      errorDiv.style.display = "block";
      errorDiv.innerHTML = msg;
   }
}

function addedOrDeleted(){
	var stockAdded = document.getElementById("stockAdd");
	var stockDeleted = document.getElementById("stockDelete");
	var errorDiv = document.getElementById("stockError");
	
	try{
		
		//if item is successfully added
		if(stockAdded === true)
		{
			throw "Item was successfully added";
		}
		//if item is not successfully added
		else if(stockAdded === false)
		{
			throw "Item was not successfully added, please try again";
		}
		
		//if item is successfully deleted
		if(stockDeleted === true)
		{
			throw "Item was successfully deleted";
		}
		
		//if item is not deleted
		else if(stockDeleted === false)
		{
			throw "There was an error deleting your item, please try again";
		}
	}
	
	catch(msg){
		//display error message
		errorDiv.style.display = "block";
		errorDiv.innerHTML = msg;
	}
}