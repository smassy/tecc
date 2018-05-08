/**
 * Internet 2 Final Project
 * The Electric Car Company
 * Authors: Carvalho-Dagenais, Matthew; Massy, sebastien; Patel, Parimal
 * Description: This scripts manages the functionalities associated with the
 * HTML file of the same name; primarily adding/removing/reordering items and
 * uddating their information.
 */

'use strict';

var sampleData; // String to hold the JSON for sample data.

/**
 * Validates the new item form and, if successful, adds the item. Prints useful feedback messages along the way.
 */
function addItem() {
	var msgFrame = document.querySelector("div#msg");
	var msg = msgFrame.getElementsByTagName("ul");
	if (msg.length > 0) {
		msgFrame.removeChild(msg[0]);
	}
	msg = document.createElement("ul");
	msgFrame.appendChild(msg);
	msg.style.display = "none";
	var msgItems = msg.childNodes;
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
			newItem[numberFields[i].name] = Number(numberFields[i].value);
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
		document.querySelector("form#newitem input").focus();
		populateInventory();
	}
	msg.style.display = "block";
}

/**
 * Generates a table row from an inventory item. Requires and item and its index in its type category as argument.
*/
function getRowFromItem(item, nthOfType) {
	var row = document.createElement("tr");
	row.id = ((item.isBase) ? "base-" : "optionsl-") + item.type + "-" + item.name.replace(/ /g, "_");
	var td;
	// Action buttons
	var delButton = document.createElement("button");
	delButton.innerHTML = "Delete";
	delButton.addEventListener("click", deleteItem, false);
	var upButton = document.createElement("button");
	upButton.innerHTML = "&uarr;";
	upButton.addEventListener("click", moveItemUp, false);
	var downButton = document.createElement("button");
	downButton.innerHTML = "&darr;";
	downButton.addEventListener("click", moveItemDown, false);
	td = document.createElement("td");
	// Action buttons insert
	if (nthOfType === 0) {
		td.appendChild(upButton);
	}
	td.appendChild(delButton);
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = item.name;
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = item.type;
	row.appendChild(td);
	td = document.createElement("td");
	td.innerHTML = "$";
	var input = document.createElement("input");
	input.type = "number";
	input.min = "0";
	input.name = "price";
	input.value = item.price;
	input.addEventListener("change", manageUpdateBtn, false);
	td.appendChild(input);
	row.appendChild(td);
	td = document.createElement("td");
	input = document.createElement("input");
	input.type = "number";
	input.min = "0";
	input.name = "turnaround";
	input.value = item.turnaround;
	input.addEventListener("change", manageUpdateBtn, false);
	td.appendChild(input);
	row.appendChild(td);
	td = document.createElement("td");
	input = document.createElement("input");
	input.type = "number";
	input.min = "0";
	input.name = "reorder";
	input.value = item.reorder;
	input.addEventListener("change", manageUpdateBtn, false);
	td.appendChild(input);
	row.appendChild(td);
	td = document.createElement("td");
	input = document.createElement("input");
	input.type = "number";
	input.min = "0";
	input.name = "stock";
	input.value = item.stock;
	input.addEventListener("change", manageUpdateBtn, false);
	if (item.stock === 0) {
		td.className = "backorder";
	} else if (item.stock < LOW_STOCK_THRESHOLD) {
		td.className = "lowstock";
	}
	td.appendChild(input);
	row.appendChild(td);
	td = document.createElement("td");
	if (nthOfType === 0) {
		td.appendChild(downButton);
	}
	row.appendChild(td);
	return row;
}

/**
 * Ascertains whether the editable content of a row differs from the information stored in the item object.
 */
function rowHasChanged(row) {
	var inputs = row.getElementsByTagName("input");
	var cells = row.getElementsByTagName("td");
	var item;
	if (row.id.slice(0, row.id.indexOf("-")) == "base") {
		item = baseItems.get(cells[2].innerHTML, cells[1].innerHTML);
	} else {
		item = optionalItems.get(cells[2].innerHTML, cells[1].innerHTML);
	} 
	if (inputs[0].value !== item.price) {
		return true;
	} else if (inputs[1].value !== item.turnaround) {
		return true;
	} else if (inputs[2].value !== item.reorder) {
		return true;
	} else if (inputs[3].value !== item.stock) {
		return true;
	} else {
		return false;
	}
}

/**
 * Event handler for the input fields in the table; logic determines whether the button appears (content has changed), should be disabled (new content not suitable) or disappear (no change).
 */
function manageUpdateBtn(evt) {
	var changedInput = evt.target;
	var row = changedInput.parentNode.parentNode;
	var oldButton = document.getElementById(row.id + "-update");
	if (oldButton) {
		oldButton.parentNode.removeChild(oldButton);
	}
	var inputs = row.getElementsByTagName("input");
	if (rowHasChanged(row)) {
		var updateButton = document.createElement("button");
		updateButton.id = row.id + "-update";
		updateButton.innerHTML = "Update";
		updateButton.addEventListener("click", updateFromRow, false);
		for (var i = 0; i < inputs.length; i++) {
			if (isNaN(inputs[i].value) || inputs[i].value < 0 || inputs[i].value === "") {
				console.log("Came here.");
				updateButton.disabled = true;
			}
		}
		row.getElementsByTagName("td")[7].appendChild(updateButton);
	}
}

/**
 * Event handler for the update button; syncs the new information to the item object.
 */
function updateFromRow(evt) {
	var button = evt.target;
	var row = button.parentNode.parentNode;
	var cells = row.getElementsByTagName("td");
	var inputs = row.getElementsByTagName("input");
	var item;
	if (row.id.slice(0, row.id.indexOf("-")) === "base") {
		item = baseItems.get(cells[2].innerHTML, cells[1].innerHTML);
	} else {
		item = optionalItems.get(cells[2].innerHTML, cells[1].innerHTML);
	}
	if (Number(inputs[0].value) !== item.price) {
		item.price = Number(inputs[0].value);
	}
	if (Number(inputs[1].value) !== item.turnaround) {
		item.turnaround = Number(inputs[1].value);
	}
	if (Number(inputs[2].value) !== item.reorder) {
		item.reorder = Number(inputs[3].value);
	}
	if (Number(inputs[3].value) !== item.stock) {
		item.stock = Number(inputs[3].value);
	}
	var oldButton = document.getElementById(row.id + "-update");
	oldButton.parentNode.removeChild(oldButton);
	syncToStorage();
}

/**
 * Handles events generated by the delete buttons.
 */
function deleteItem(evt) {
	var button = evt.target;
	var row = button.parentNode.parentNode;
	var cells = row.getElementsByTagName("td");
	var name = cells[1].innerHTML;
	var type = cells[2].innerHTML;
	var group = row.id.slice(0, row.id.indexOf("-"));
	if (group === "base") {
		baseItems.delete(type, name);
	} else {
		optionalItems.delete(type, name);
	}
	row.parentNode.removeChild(row);
	syncToStorage();
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

/**
 * Loads relevant information into the tables.
 */
function populateInventory() {
	var baseDiv = document.getElementById("baseItems");
	var baseChildren = baseDiv.childNodes;
	for (var i = 0; i < baseChildren.length; i++) {
		baseDiv.removeChild(baseChildren[i]);
	}
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
	var optionalChildren = optionalDiv.childNodes;
	for (var i = 0; i < optionalChildren.length; i++) {
		optionalDiv.removeChild(optionalChildren[i]);
	}
	if (optionalItems.count === 0 && baseItems.count > 0) {
		p.innerHTML = p.innerHTML.replace("items", "optional items");
		optionalDiv.appendChild(p);
	} else {
		var table = getTableFromGroup(optionalItems);
		table.getElementsByTagName("caption")[0].innerHTML = "Inventory: Optional Items";
		optionalDiv.appendChild(table);
	}
}

/**
 * Helper function for moving items.
*/
function moveType(types, type, direction) {
	var index = types.indexOf(type);
	if (direction === "+") {
		types.splice((index - 1 === -1) ? types.length - 1 : index - 1, 0, types.splice(index, 1)[0]);
	} else if (direction === "-") {
		types.splice((index + 1) % types.length , 0, types.splice(index, 1)[0]);
	} else {
		throw "Unexpected argument.";
	}
}

/**
 * Event handler for up button.
 */
function moveItemUp(evt) {
	var button = evt.target;
	var row = button.parentNode.parentNode;
	var cells = row.getElementsByTagName("td");
	if (row.id.slice(0, row.id.indexOf("-")) === "base") {
		moveType(baseItems.types, cells[2].innerHTML, "+");
	} else {
		moveType(optionalItems.types, cells[2].innerHTML, "+");
	}
	populateInventory();
	syncToStorage();
}

/**
 * Event handler for down button.
 */
function moveItemDown(evt) {
	var button = evt.target;
	var row = button.parentNode.parentNode;
	var cells = row.getElementsByTagName("td");
	if (row.id.slice(0, row.id.indexOf("-")) === "base") {
		moveType(baseItems.types, cells[2].innerHTML, "-");
	} else {
		moveType(optionalItems.types, cells[2].innerHTML, "-");
	}
	populateInventory();
	syncToStorage();
}

/**
 * Crate buttons to facilitate downloading/loading/reseting data.
*/
function createMaintenanceLinks() {
	var dlLink = document.getElementById("download");
	var target = "data:text/json;charset=utf-8," + localStorage[STOR_NAME];
	dlLink.href = target;
	dlLink.setAttribute("download", "tecc_data.json");
	dlLink.innerHTML = "Download data";
	var loadBtn = document.getElementById("load");
	loadBtn.innerHTML = "Load Sample Data";
	loadBtn.addEventListener("click", loadSampleData, false);
	var resetBtn = document.getElementById("reset");
	resetBtn.innerHTML = "RESET SYSTEM";
	resetBtn.addEventListener("click", resetSystem, false);
}

/**
 * Load the data in the frame into a string which can be used to set sample data.
 */
function loadSampleData() {
	alert("This loads the sample data to the system but doesn't sync it to storage to avoid accidental overwrites; click sync or perform any action in the interface to make this permanent.");
	var dataFrame = document.getElementById("dataFrame");
	sampleData = dataFrame.contentWindow.document.body.childNodes[0].innerHTML;
	loadData(sampleData);
	populateInventory();
}

/**
 * Return system to fresh/empty state.
 */
function resetSystem() {
	alert("This resets the system to a fresh state but doesn't erase the data from localStorage; click Sync or performing any action in the interface to overwrite the data.");
	delete localStorage[STOR_NAME];
	loadData();
	populateInventory();
}

/**
 * Runs janitorial functions on load.
*/
function setup() {
	populateInventory();
	var submitBtn = document.getElementById("isubmit");
	if (submitBtn.addEventListener) {
		submitBtn.addEventListener("click", addItem, false);
	}
	createMaintenanceLinks();
}

if (window.addEventListener) {
	window.addEventListener("load", setup, false);
}
