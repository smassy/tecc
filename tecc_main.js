/**
 * Internet 2 Final Project
 * The Electric Car Company
 * Authors: Carvalho-Dagenais, Matthew; Massy, sebastien; Patel, Parimal
 * Description: This script defines and run a number of janitorial functions
 * which will be used on all pages of the site. It also defines factory functions to ease creation of objects.
 */

'use strict';

var storage = checkStorage(); // If the browser does not support webstorage then we bail as nothing will work.
const STOR_NAME = "TECC";
const BASE_TURNAROUND = 3; // Minimum # of days to put car together sans additional assembly.
var orders;
var baseItems;
var optionalItems;
var lastOrderId;

function getCurrency(currency) {return "$" + currency;} // Passthrough function for now.

/* Factories */

/**
 * Returns an inventory item object; includes a method to validate it and a method to convert it to an order item (stripped of inventory related information).
 * - A load method exists to facilitate restoring information from JSON.
 */
function itemFactory() {
	var item = {
		name: "",
		type: "",
		isBase: undefined,
		price: -1,
		turnaround: -1,
		reorder: -1,
		stock: undefined,
		isValidInventory: function () {
			if (this.name.length > 0 && this.type.length > 0 &&
					this.isBase !== undefined && this.price > -1 &&
					this.turnaround > -1 && this.reorder > 0 &&
					this.stock !== undefined) {
				return true;
			} else {
				return false;
			}
		},
		toOrderItem: function () {
			var newItem = itemFactory();
			newItem.load(this);
			delete newItem.reorder;
			delete newItem.stock;
			return newItem;
		},
		toString: function () {
			var string = this.name;
			if (this.stock > 0) {
				string += " (" + getCurrency(this.price) + " - " + this.turnaround + " days installation)";
			} else {
				string += " (Currently out of stock but expected in the next " + this.reorder + "days)";
			}
			return string;
		},
		load: function (that) {
			for (var prop in that) {
				this[prop] = that[prop];
			}
		}
	}
	return item;
}

/**
 * Returns an object describing a group of items:
 * Description:
 * - An array containing the types describint the item (item.type)
 * - For each type, the group has a property of that type which is an array containing one or more items of said type.
 * - A count property indicating the number of types present in the group.
 * - Add method (item): adds a new item to the group; returns false if item isn't valid or already exists, true if successful.
 * - Delete method (type, name): Removes an item from the group: returns true is successful, false if not (not found)
 * - get method (type, name): Returns a reference to the item if it is present, undefined otherwise.
 * - A load method exists to facilitate restoring information from JSON.
 */
function itemGroupFactory() {
	var itemGroup = {
		types: [],
		get count() {
			return this.types.length;
		},
		add: function (item) {
			item.type = item.type.toLowerCase();
			if (!item.isValidInventory() || this.get(item.type, item.name) !== undefined || item.type === "types") {
				return false;
			}
			if (this.types.indexOf(item.type) === -1) {
				this[item.type] = [item];
				this.types.push(item.type);
			} else {
				this[item.type].push(item);
			}
			return true;
		},
		delete:  function (type, name) {
			type = type.toLowerCase();
			var typeIndex = this.types.indexOf(type);
			if (typeIndex === -1) {
				return false;
			}
			if (name === undefined || this[type].length === 1) {
				delete this[type];
				this.types.splice(typeIndex, 1);
				return true;
			}
			var found = false;
			for (var i = 0; i < this[type].length; i++) {
				if (this[type][i]["name"].toLowerCase() === name.toLowerCase()) {
					found = true;
					this[type].splice(i, 1);
				}
			}
			return found;
		},
		get: function (type, name) {
			if (typeof(type) !== "string") {
				throw "Did not get a string as type; remember to use innerHTML!";
			}
			type = type.toLowerCase()
			if (this.types.indexOf(type) === -1) {
				return undefined;
			}
			if (name === undefined) {
				return this[type];
			}
			var item = undefined;
			for (var i = 0; i < this[type].length; i++) {
				if (this[type][i]["name"].toLowerCase() === name.toLowerCase()) {
					item = this[type][i];
				}
			}
			return item;
		},
		load: function (that) {
			for (var i = 0; i < that.types.length; i++) {
				for (var j = 0; j < that[that.types[i]].length; j++) {
					var newItem = itemFactory();
					newItem.load(that[that.types[i]][j]);
					this.add(newItem);
				}
			}
		}
	}
	return itemGroup;
}

/**
 * Returns an order object with its id set to the next available order id and date set to the time of creation; includes a method to validate the order.
 * - A setId() method which officially initialises the order id and order date.
 * - A load method exists to facilitate restoring information from JSON.
 */
function orderFactory() {
	var order = {
		id: -1,
		date: undefined,
		customer: undefined,
		payment: undefined,
		items: [],
		setId: function () {
			if (this.id < 1) {
				this.id = ++lastOrderId;
				this.date = new Date();
				return this.id;
			}
			return this.id;
		},
		get turnaround() {
			var totalTurnaround = BASE_TURNAROUND;
			for (var i = 0; i < this.items.length; i++) {
				totalTurnaround += this.items[i].turnaround;
			}
			return totalTurnaround;
		},
		get price() {
			var totalPrice = 0;
			for (var i = 0; i < this.items.length; i++) {
				totalPrice += this.items[i].price;
			}
			return totalPrice;
		},
		isValid: function () {
			var valid = false;
			if (this.id > 0 && this.items.length > 0 && customer !== undefined && payment !== undefined) {
				valid = true;
			}
			return valid;
		},
		load: function (that) {
			this.date = new Date(that.date);
			delete that.date;
			delete that.turnaround;
			delete that.price;
			for (var prop in that) {
				this[prop] = that[prop];
			}
		}
	}
	return order;
}

/**
 * Returns a customer object; includes a method to ensure the information is complete.
 */
function customerFactory() {
	var customer = {
		fName: "",
		lName: "",
		email: "",
		address: "",
		city: "",
		province: "",
		country: ""
	}
	return customer;
}

/**
 * Returns a payment object.
 */
function paymentFactory() {
	var payment = {
		cNumber: "",
		cType: "",
		CName: "",
		cExp: "",
		cCvv: ""
	}
	return payment;
}

/* Storage related functions */

/**
 * Ascertains whether storage API is supported
 */
function checkStorage() {
	if (!localStorage) {
		alert("Your browser does not appear to support the storage API on which this site depends for information management. Please use a modern browser such as Chrome, Edge, Firefox or Safari.");
		return false;
	}
	return true;
}

/**
 * Retrieves information from storage if it is present; initialises to sane values if not.
 */
function loadFromStorage() {
	if (localStorage[STOR_NAME] !== undefined) {
		var storageSpace = JSON.parse(localStorage.getItem(STOR_NAME));
		orders = [];
		for (var i = 0; i < storageSpace.orders.length; i++) {
			var newOrder = orderFactory();
			newOrder.load(storageSpace.orders[i]);
			orders.push(newOrder);
		}
		baseItems = itemGroupFactory();
		baseItems.load(storageSpace.baseItems);
		optionalItems = itemGroupFactory();
		optionalItems.load(storageSpace.optionalItems);
		lastOrderId = storageSpace.lastOrderId;
	} else {
		orders = [];
		baseItems = itemGroupFactory();
		optionalItems = itemGroupFactory();
		lastOrderId = 0;
		syncToStorage();
	}
}

/**
 * Synchronises object state to localStorage.
 */
function syncToStorage() {
	var storageSpace = {};
	storageSpace.orders = orders;
	storageSpace.baseItems = baseItems;
	storageSpace.optionalItems = optionalItems;
	storageSpace.lastOrderId = lastOrderId;
	localStorage.setItem(STOR_NAME, JSON.stringify(storageSpace));
}

/* Helper functions */

/**
 * Returns the index of an order in the array, given its id; returns undefined if id is not found.
*/
function getOrderIdxById(id) {
	var idx = undefined;
	for (var i = 0; i < orders.length; i++) {
		if (orders[i].id === id) {
			idx = i;
		}
	}
	return idx;
}

/**
 * Get the total expected wait time for anm order given its position in the queue. If no order id is specified, returns the total time for orders to be complete.
 */
function getWaitTime(id) {
	var idx;
	if (id) {
		idx  = getOrderIdxById(id);
		if (idx === undefined) {
			return undefined;
		}
	} else {
		idx = 0;
	}
	var totalWait = 0;
	for (var i = orders.length - 1; i > idx - 1; i--) {
		totalWait += orders[i].turnaround;
	}
	var now = new Date();
	var daysRemaining = (orders.length > 0) ? Math.round((now - orders[orders.length - 1].date) / (24 * 3600 * 1000), 0) : 0;
	daysRemaining = (daysRemaining > 0) ? daysRemaining : 0; // If days remaining is negative then order time is exceeded and we don't want to count it.
	totalWait += daysRemaining;
	return totalWait;
}

/**
 * Returns the average wait time for an order.
 */
function getAverageWaitTime() {
	return (orders.length > 0) ? getWaitTime() / orders.length : BASE_TURNAROUND;
}

/*  House keeping */
function setup() {
	loadFromStorage();
}

if (window.addEventListener && storage) {
	window.addEventListener("load", setup, false);
}
