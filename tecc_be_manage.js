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
	var submitBtn = document.getElementById("isubmit");
	if (submitBtn.addEventListener) {
		submitBtn.addEventListener("click", addItem, false);
	}
}

if (window.addEventListener) {
	window.addEventListener("load", setup, false);
}
