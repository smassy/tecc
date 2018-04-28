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
var orders;
var heldOrders;
var baseItems;
var optionalItems;
var lastOrderId;

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
			var typeIndex = this.types.indexOf(type);
			if (typeIndex === -1) {
				return false;
			}
			if (name === undefined || this[type].length === 1) {
				delete this[type];
				delete this.types[typeIndex];
				return true;
			}
			var found = false;
			for (var i = 0; i < this[type].length; i++) {
				if (this[type][i]["name"] === name) {
					found = true;
					delete this[type][i];
				}
			}
			return found;
		},
		get: function (type, name) {
			if (this.types.indexOf(type) === -1 || name === undefined) {
				return undefined;
			}
			var item = undefined;
			for (var i = 0; i < this[type].length; i++) {
				if (this[type][i]["name"] === name) {
					item = this[type][i];
				}
			}
			return item;
		},
		load: function (that) {
			this["types"] = that["types"].slice(0);
			delete that.types;
			delete that.count;
			for (var type in that) {
				this[type] = [];
				for (var item in that[type]) {
					var newItem = itemFactory();
					newItem.load(item);
					this[type].push(newItem);
				}
			}
			return item;
		}
	}
	return itemGroup;
}

/**
 * Returns an order object with its id set to the next available order id and date set to the time of creation; includes a method to validate the order.
 * - A load method exists to facilitate restoring information from JSON.
 */
function orderFactory() {
	var order = {
		id: -1,
		date: new Date(),
		customer: undefined,
		payment: undefined,
		items: [],
		setId: function () {
			this.id = ++lastOrderId;
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
		for (var order in storageSpace.orders) {
			var newOrder = orderFactory();
			newOrder.load(order);
			orders.push(newOrder);
		}
		heldOrders = [];
		for (var order in storageSpace.heldOrders) {
			var newOrder = orderFactory();
			newOrder.load(order);
			heldOrders.push(newOrder);
		}
		baseItems = itemGroupFactory();
		baseItems.load(storageSpace.baseItems);
		optionalItems = itemGroupFactory();
		optionalItems.load(storageSpace.optionalItems);
		lastOrderId = storageSpace.lastOrderId;
	} else {
		orders = [];
		heldOrders = [];
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
	storageSpace.heldOrders = heldOrders;
	storageSpace.baseItems = baseItems;
	storageSpace.optionalItems = optionalItems;
	storageSpace.lastOrderId = lastOrderId;
	localStorage.setItem(STOR_NAME, JSON.stringify(storageSpace));
}

/*  House keeping */
function setup() {
	loadFromStorage();
}

if (window.addEventListener && storage) {
	window.addEventListener("load", setup, false);
}
