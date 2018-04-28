/**
 * Internet 2 Final Project
 * The Electric Car Company
 * Authors: Carvalho-Dagenais, Matthew; Massy, sebastien; Patel, Parimal
 * Description: This scripts manages the functionalities associated with the
 * HTML file of the same name; primarily adding/removing/reordering items and
 * uddating their information.
 */

'use strict';

/**
 * Validates the new item form and, if successful, adds the item. Prints useful feedback messages along the way.
 */
function addItem() {
	var msg = document.querySelector("div#msg ul");
	msg.style.display = "none";
	var msgItems = msg.getElementsByTagName("li");
	for (var i = 0; i < msgItems.length; i++) {
		msg.removeChild(msgItems[i]);
	}
	var newItem = itemFactory();
	var valid = true;
	var name = document.getElementById("iname").value;
	if (name.length < 1) {
		var nMsg = document.createElement("li");
		nMsg.innerHTML = "Please specify a name for the item.";
		msg.appendChild(nMsg);
		valid = false;
	} else {
		newItem.name = name;
	}
	var type = document.getElementById("itype").value;
	if (type.length < 1) {
		var tMsg = document.createElement("li");
		tMsg.innerHTML = "Please specify a type for the item";
		valid = false;
	} else if (/ /.test(type)) {
		var tMsg = document.createElement("li"); tMsg = "Please specify a type for the item";
		tMsg.innerHTML = "The value for type must not contain any white spaces.";
	} else if (type === "types") {
		var tMsg = document.createElement("li"); 
		tMsg.innerHTML = "The keyword \"types\" is reserved and may not be used for as type.";
		valid = false;
	} else {
		newItem.type = type;
	}
	if (tMsg) {
		msg.appendChild(tMsg);
	}
	if (baseItems.get(type, name) !== undefined || optionalItems.get(type, name) !== undefined) {
		var stMsg = document.createElement("li");
		stMsg.innerHTML = "An item of the same type and name already exists.";
		msg.appendChild(stMsg);
		valid = false;
	} 
	if (document.getElementById("ibase").checked) {
		newItem.isBase = true;
	} else {
		newItem.isBase = false;
	}
	var numberFields = document.querySelectorAll('form#newitem input[type="number"]');
	for (var i = 0; i < numberFields.length; i++) {
		if (numberFields[i].value.length < 1 || isNaN(numberFields[i].value) || numberFields[i].value < 0) {
			var numMsg = document.createElement("li");
			numMsg.innerHTML = "Value in the field for " + numberFields[i].name + " Must be a positive number.";
			msg.appendChild(numMsg);
			valid = false;
		} else {
			newItem[numberFields[i].name] = numberFields[i].value;
		}
	}
	var created;
	if (valid && newItem.isValidInventory()) {
		if (newItem.isBase) {
			created = baseItems.add(newItem);
		} else {
			created = optionalItems.add(newItem)
		}
	}
	if (created) {
		var successMsg = document.createElement("li");
		successMsg.innerHTML = "Item successfully added!";
		msg.append(successMsg);
		syncToStorage();
		document.getElementById("newitem").reset();
	}
	msg.style.display = "block";
}

function setup() {
	populateInventory();
	var submitBtn = document.getElementById("isubmit");
	if (submitBtn.addEventListener) {
		submitBtn.addEventListener("click", addItem, false);
	}
}

/**
 * Generates a table row from an inventory item. Requires and item and its index in its type category as argument.
*/
function getRowFromItem(item, nthOfType) {
	var row = document.createElement("tr");
	row.id = item.type + "-" + item.name.replace(/ /g, "_");
	var td;
	td = document.createElement("td");
	// Action buttons
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = item.name;
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = item.type;
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = "$" + item.price.toLocaleString();
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = item.turnaround;
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = item.reorder;
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = item.stock;
	row.appendChild(td);
	td = document.createElement("td");
	// action button
	row.appendChild(td);
	return row;
}

/**
 * Generates an inventory table from an itemGroup object. Requires said group as parameter.
*/
function getTableFromGroup(group) {
	var table = document.createElement("table");
	table.appendChild(document.createElement("caption"));
	var thead = document.createElement("thead");
	var th = document.createElement("th");
	thead.appendChild(th);
	th = document.createElement("th");
	th.innerHTML = "Name";
	thead.appendChild(th);
	th = document.createElement("th");
	th.innerHTML = "Type";
	thead.appendChild(th);
	th = document.createElement("th");
	th.innerHTML = "Price";
	thead.appendChild(th);
	th = document.createElement("th");
	th.innerHTML = "Turnaround time<br />in days";
	thead.appendChild(th);
	th = document.createElement("th");
	th.innerHTML = "Reorder time<br />in days";
	thead.appendChild(th);
	th = document.createElement("th");
	th.innerHTML = "Stock";
	thead.appendChild(th);
	th = document.createElement("th");
	thead.appendChild(th);
	table.appendChild(thead);
	var tbody = document.createElement("tbody");
	for (var i = 0; i < group.count; i++) {
		var typeArray = group[group.types[i]];
		for (var j = 0; j < typeArray.length; j++) {
			var row = getRowFromItem(typeArray[j], j);
			tbody.appendChild(row);
		}
	}
	table.appendChild(tbody);
	return table;
}

function populateInventory() {
	// Remove tables if already present
	var tables = document.getElementsByTagName("table");
	for (var i = 0; i < tables.length; i++) {
		tables[i].parentNode.removeChild(tables[i]);
	}
	var baseDiv = document.getElementById("baseItems");
	var p = document.createElement("p");
	p.innerHTML = "There are currently no  items defined; please add some if you wish your customers to be able to place an order. here are a few things to remember:<ul><li>Each combination of name and type must be unique.</li><li>types may not contain blank spaces.</li><li>Types are used to group items together so that the customer may choose one of them, which means:</li><ul><li>Types holding multiple items will be presented to the customer as an option group.</li><li>Types containing a single item will be presented to the customer as an optional (checkbox) item.</li><li>Since all base items are required, it only makes sense to have types with single item in the optional group</li></ul></ul>";
	if (baseItems.count === 0) {
		baseDiv.appendChild(p);
	} else {
		var table  = getTableFromGroup(baseItems);
		table.getElementsByTagName("caption")[0].innerHTML = "Inventory: Base Items";
		baseDiv.appendChild(table);
	}
	var optionalDiv = document.getElementById("optionalItems");
	if (optionalItems.count === 0 && baseItems.count > 0) {
		p.innerHTML = p.innerHTML.replace("items", "optional items");
		optionalDiv.appendChild(p);
	} else {
		var table = getTableFromgroup(optionalItems);
		table.getElementsByTagName("caption")[0].innerHTML = "Inventory: Optional Items";
		optionalDiv.appendChild(table);
	}
}
		
if (window.addEventListener) {
	window.addEventListener("load", setup, false);
}
