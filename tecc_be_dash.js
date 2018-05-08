/**
 * Internet 2 Final Project
 * The Electric Car Company
 * Authors: Carvalho-Dagenais, Matthew; Massy, sebastien; Patel, Parimal
 * Description: Populate the dashboard with relevant information to assist the
 * manager in knowing which actions need to be taken next and whether anything
 * requires urgent attention.
 */

'use strict';

var nextOrder; // Next order to be fulfilled
var lowInventoryItems = [];
var backorderItems = [];
var today;
var nextOrderRemainingDays;

/**
 * Calls scanItemGroupStock on our two itemGroups.
*/
function scanInventory() {
	scanItemGroupStock(baseItems);
	scanItemGroupStock(optionalItems);
}

/**
 * Iterates through an itemGroup's items and creates list of backorder and low inventory items which can be found in suitably named global variables at the top.
 */
function scanItemGroupStock(itemGroup) {
	for (var i = 0; i < itemGroup.types.length; i++) {
		for (var j = 0; j < itemGroup[itemGroup.types[i]].length; j++) {
			if (itemGroup[itemGroup.types[i]][j].stock === 0) {
				backorderItems.push(itemGroup[itemGroup.types[i]][j]);
			} else if (itemGroup[itemGroup.types[i]][j].stock < LOW_STOCK_THRESHOLD) {

				lowInventoryItems.push(itemGroup[itemGroup.types[i]][j]);
			}
		}
	}
}

/**
 * Resets the message div and displays and prints warning messages if relevant.
 */
function generateWarnings() {
	var div = document.getElementById("urgentMsg");
	var ul = div.getElementsByTagName("ul")[0];
	var urgentMessages = false;
	div.style.display = "none";
	for (var i = 0; i < ul.childNodes.length; i++) {
		ul.removeChild(ul.childNodes[i]);
	}
	if (nextOrderRemainingDays === 0) {
		var orderWarn = document.createElement("li");
		orderWarn.innerHTML = "The next order in the queue has reached or exceeded its due date.";
		ul.appendChild(orderWarn);
		urgentMessages = true;
	}
	if (backorderItems.length > 0) {
		var backorderWarn = document.createElement("li");
		backorderWarn.innerHTML = "Some items are out of stock.";
		ul.appendChild(backorderWarn);
		urgentMessages = true;
	}
	if (urgentMessages) {
		div.style.display = "block";
	}
}

function populateNextOrderInfo() {
	var div = document.getElementById("nextOrder");
	if (orders.length === 0) {
		div.style.display = "none";
	} else {
		var table = div.getElementsByTagName("table")[0];
		document.getElementById("o_id").innerHTML = nextOrder.id;
		document.getElementById("o_date").innerHTML = nextOrder.date.toLocaleString().slice(0, nextOrder.date.toLocaleString().indexOf(","));
		document.getElementById("o_turnaround").innerHTML = nextOrder.turnaround + " days";
		document.getElementById("o_time").innerHTML = nextOrderRemainingDays + " days";
		if (nextOrderRemainingDays < 2) {
			table.style.border = "solid red";
		} else if (nextOrderRemainingDays < 4) {
			table.style.border = "solid yellow";
		} else {
			table.style.border = "solid blue";
		}
		div.style.display = "block";
	}
}

/**
 * Generates a table with crucial info for low stock items.
 */
function populateLowStockTable() {
	if (backorderItems.length === 0 && lowInventoryItems.length === 0) {
		document.getElementById("lowInventory").style.display = "none";
	} else {
		document.getElementById("lowInventory").style.display = "block";
		var tbody = document.querySelector("div#lowInventory table tbody");
		var rows = tbody.getElementsByTagName("tr");
		for (var i = 0; i < rows.length; i++) {
			tbody.removeChild(rows[i]);
		}
		var items = backorderItems.concat(lowInventoryItems);
		for (var i = 0; i < items.length; i++) {
			var row = document.createElement("tr");
			var td = document.createElement("td");
			td.innerHTML = items[i].name;
			row.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = items[i].type;
			row.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = items[i].isBase ? "Base" : "Optional";
			row.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = items[i].reorder + " days";
			row.appendChild(td);
			td = document.createElement("td");
			td.innerHTML = items[i].stock;
			if (items[i].stock === 0) {
				td.className = "backorder";
			} else {
				td.className = "lowstock";
			}
			row.appendChild(td);
			tbody.appendChild(row);
		}
	}
}

/**
 * Refreshes the page content.
*/
function refreshContent() {
	today = new Date();
	document.querySelector("header h1").innerHTML = "At A Glance: " + today.toLocaleString();
	showSystemSummary(document.getElementById("summary"));
	scanInventory();
	generateWarnings();
	nextOrder = (orders.length > 0) ? orders[orders.length - 1] : undefined;
	nextOrderRemainingDays = getWaitTime(nextOrder.id);
	populateNextOrderInfo();
	populateLowStockTable();
}

function setup() {
	refreshContent();
	setInterval(refreshContent, 300000); // Update info every 5 minutes.
}

window.addEventListener("load", setup, false);

