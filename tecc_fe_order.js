/**
 * Internet 2 Final Project
 * The Electric Car Company
 * Authors: Carvalho-Dagenais, Matthew; Massy, sebastien; Patel, Parimal
 * Description: This scripts manages the functionalities associated with the
 * HTML file of the same name; it handles form generation and saving so that
 * clients may build a car.
 * uddating their information.
 */

var order; //  Order in process

/**
 * Fills up the order overview
 */
function populateWaitTimeInfo() {
	var div = document.getElementById("waitTimeInfo");
	var p = div.getElementsByTagName("p");
	if (p.length > 0) {
		div.removeChild(p[0]);
	}
	p = document.createElement("p");
	p.innerHTML = "There are currently " + orders.length + " orders in the queue with a total combined fulfillment time of " + getWaitTime() + " days for an average of " + getAverageWaitTime() + " days per order.";
	div.appendChild(p);
}

/**
 * Updates the information in the orderSummary div.
 */
function refreshOrderSummary() {
	var div = document.getElementById("orderSummary");
	var ul = div.getElementsByTagName("ul");
	if (ul.length) {
		div.removeChild(ul[0]);
	}
	ul = document.createElement("ul");
	var li = document.createElement("li");
	li.innerHTML = "Order total: " + getCurrency(order.price);
	ul.appendChild(li);
	li = document.createElement("li");
	li.innerHTML = "Total time to assemble: " + order.turnaround + " days";
	ul.appendChild(li);
	li = document.createElement("li");
	var delivDate = new Date();
	delivDate.setDate(delivDate.getDate() + getWaitTime() + order.turnaround);
	li.innerHTML = "Expected delivery date: " + delivDate.toLocaleString().slice(0, delivDate.toLocaleString().indexOf(","));
	ul.appendChild(li);
	div.appendChild(ul);
}

/**
 * Populates the order form according to information set in the back_end.
 */
function generateOrderForm() {
	var div = document.getElementById("buildForm");
	var form = div.getElementsByTagName("form")[0];
	if (form) {
		div.removeChild(form);
	}
	form = document.createElement("form");
	var baseFieldset = document.createElement("fieldset");
	baseFieldset.id = "baseItems";
	var legend = document.createElement("legend");
	legend.innerHTML = "Base Items";
	baseFieldset.appendChild(legend);
	for (var i = 0; i < baseItems.types.length; i++) {
		var subFieldset = document.createElement("fieldset");
		subFieldset.id = "base-" + baseItems.types[i];
		legend = document.createElement("legend");
		legend.innerHTML = baseItems.types[i].replace(/(_|-)/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase() });
		subFieldset.appendChild(legend);
		var optionsDiv = document.createElement("div");
		var input;
		var label;
		for (var j = 0; j < baseItems[baseItems.types[i]].length; j++) {
			var id = baseItems.types[i] + "-" + j;
			input = document.createElement("input");
			label = document.createElement("label");
			label.htmlFor = id;
			label.innerHTML = baseItems[baseItems.types[i]][j].toString();
			input.type = "radio";
			input.name = baseItems.types[i];
			input.id = id;
			input.value = j;
			if (baseItems[baseItems.types[i]][j].stock < 1) {
				input.disabled = true;
				input.className = "backorder"
			}
			if (j === 0 && !input.disabled) {
				input.checked = true;
			}
			optionsDiv.appendChild(input);
			optionsDiv.appendChild(label);
		}
		subFieldset.append(optionsDiv);
		baseFieldset.appendChild(subFieldset);
	}
	form.appendChild(baseFieldset);
	var opFieldset = document.createElement("fieldset");
	opFieldset.id = "optionalItems";
	legend = document.createElement("legend");
	legend.innerHTML = "Optional Items";
	opFieldset.appendChild(legend);
	for (var i = 0; i < optionalItems.types.length; i++) {
		if (optionalItems[optionalItems.types[i]].length === 1) {
			var id = optionalItems.types[i] + "-0";
			input = document.createElement("input");
			label = document.createElement("label");
			label.htmlFor = id;
			label.innerHTML = optionalItems[optionalItems.types[i]][0].toString();
			input.type = "checkbox";
			input.id = id;
			input.name = optionalItems.types[i];
			input.value = 0;
			if (optionalItems[optionalItems.types[i]][0].stock < 1) {
				input.disabled = true;
				input.className = "backorder";
			}
			opFieldset.appendChild(input);
			opFieldset.appendChild(label);
		} else {
			var subFieldset = document.createElement("fieldset");
			subFieldset.id = "optional-" + optionalItems.types[i] + "-" + i;
			legend = document.createElement("legend");
			legend.innerHTML = optionalItems.types[i].replace(/(_|-)/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase() });
			subFieldset.appendChild(legend);
			var optionsDiv = document.createElement("div");
			var id = optionalItems.types[i] + "-none";
			input = document.createElement("input");
			input.type = "radio";
			input.name = optionalItems.types[i];
			input.value = "None";
			input.id = id;
			input.checked = true;
			label = document.createElement("label");
			label.htmlFor = id;
			label.innerHTML = "None";
			optionsDiv.appendChild(input);
			optionsDiv.appendChild(label);
			for (var j = 0; j < optionalItems[optionalItems.types[i]].length; j++) {
				input = document.createElement("input");
				label = document.createElement("label");
				id = optionalItems.types[i] + "-" + j;
				label.htmlFor = id;
				label.innerHTML = optionalItems[optionalItems.types[i]][j].toString();
				input.type = "radio";
				input.name = optionalItems.types[i];
				input.value = j;
				input.id = id;
				if (optionalItems[optionalItems.types[i]][j].stock < 1) {
					input.disabled = true;
					input.className = "backorder";
				}
				optionsDiv.appendChild(input);
				optionsDiv.appendChild(label);
			}
			subFieldset.appendChild(optionsDiv);
			opFieldset.appendChild(subFieldset);
		}
	}
	form.appendChild(opFieldset);
	var inputs = form.getElementsByTagName("input");
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].className = "choice";
		inputs[i].addEventListener("change", compileOrder, false);
	}
	var button = document.createElement("button");
	button.id = "checkoutBtn";
	button.innerHTML = "Proceed To Checkout";
	button.addEventListener("click", handleSubmission, false);
	form.appendChild(button);
	div.appendChild(form);
}

/**
 * Harvests the information in the form to populate the order information.
 */
function compileOrder() {
	order.items = [];
	var baseInputs = document.querySelectorAll("fieldset#baseItems input.choice");
	for (var i = 0; i < baseInputs.length; i++) {
		if (baseInputs[i].checked) {
			order.items.push(baseItems[baseInputs[i].name][baseInputs[i].value].toOrderItem());
		}
	}
	var optionalInputs = document.querySelectorAll("fieldset#optionalItems input.choice");
	for (var i = 0; i < optionalInputs.length; i++) {
		if (optionalInputs[i].checked && optionalInputs[i].value !== "None") {
			order.items.push(optionalItems[optionalInputs[i].name][optionalInputs[i].value].toOrderItem());
		}
	}
	refreshOrderSummary();
}
			
/**
 * Event handler for the "Proceed to checkout" button. Calls on order fulfillment and moves on to the checkout info page.
 */
function handleSubmission(evt) {
	evt.preventDefault();
	var oId;
	try {
		oId = fulfillOrder(order);
	} catch (e) {
		alert(e);
		return false;
	}
	var loc = String(window.location);
	loc = loc.slice(0, loc.lastIndexOf("/") + 1) + "payment.html?o_id=" + oId;
	window.location = loc;
}

/**
 * Calls a group of functions to carry out page refresh.
*/
function refresh() {
	populateWaitTimeInfo();
	generateOrderForm();
	compileOrder();
	refreshOrderSummary();
}

/**
 * Janitorial function to carry out necessary house-keeping on load.
 */
function setup() {
	getCurrencyWidget(document.getElementById("currencyWidget"));
	document.getElementById("currencyWidget").addEventListener("change", refresh, false);	
	order = orderFactory();
	refresh();
}

window.addEventListener("load", setup, false);
