
"use strict";

var orderId = Number(location.search.slice(location.search.lastIndexOf("=") + 1)); // Fetch orderId from query string.
var order;
var formValidity = true;
var multipleFee = 1.04;
var currency = "CAD";

//Corrects the state/province select option depending
//on which country is selected
function correctCountry()
{
    resetStateOptions();
    var select = document.getElementById("statebox");
    var option = document.createElement("option");
    option.text = "---------";
    option.value = "default";
    formValidity = false;
    select.add(option);

    var country = document.getElementById('countrybox').value;
    if(country === "canada")
    {
        statelabel.innerHTML = "Province: ";
        ziplabel.innerHTML = "Postal Code: "

        addOptions(can_province, select);
        currency = "CAD";
    }
    else
    {
        statelabel.innerHTML = "State: ";
        ziplabel.innerHTML = "ZIP Code: ";

        if(country === "usa")
        {
            addOptions(usa_state, select);
            currency = "USD";
        }
        else
        {
            addOptions(mex_state, select);
            currency = "MXN";
        }
    } 
    
    localStorage.setItem("countryStorage", country);
    displayCosts();
}

//Selects and validates credit cards based on credit card numbers
function validateCardType()
{
    //Use these values to test this method:
    //4012888888881881 = VISA
    //371449635398431 = AMEX
    //5105105105105100 = MC
    //6011000990139424 = DISCOVER

    var cardNumberInput = document.getElementById("cardbox");
    var cardNmberError = document.getElementById("cardNmberError");

    //Resets the syle
    cardNumberError.style.display = "none";
    cardNumberInput.style.border = ""; 
    cardNumberInput.style.backgroundColor = "white"; 

	var cardNumValue = document.getElementById("cardbox").value;
	var visa = /^4[0-9]{12}(?:[0-9]{3})?$/;
	var mc = /^5[1-5][0-9]{14}$/;
	var discover = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
	var amex = /^3[47][0-9]{13}$/;
	
	if (visa.test(cardNumValue)) 
	{
        document.getElementById("visa").checked = "checked";
        localStorage.setItem("cardStorage", cardNumValue);
        syncToStorage();
	} 
	else if (mc.test(cardNumValue)) 
	{
        document.getElementById("mc").checked = "checked";
        localStorage.setItem("cardStorage", cardNumValue);
        syncToStorage();
	} 
	else if (discover.test(cardNumValue)) 
	{
        document.getElementById("discover").checked = "checked";
        localStorage.setItem("cardStorage", cardNumValue);
        syncToStorage();
	}
	else if (amex.test(cardNumValue)) 
	{
        document.getElementById("amex").checked = "checked";
        localStorage.setItem("cardStorage", cardNumValue);
        syncToStorage();
    }
    else
    {
        cardNumberInput.style.border = "1px solid red";
        cardNumberInput.style.backgroundColor = "pink";
        cardNumberError.style.display = "block";
        cardNumberError.innerHTML = "Please enter a valid credit card number";
        formValidity = false;
    }
}

//Checks to see if user has entered a first name
function validateFirstName()
{
    var validity = true;
    var fname = document.getElementById("fnamebox").value;
    fname = fname.trim();
    var fnameError = document.getElementById("firstNameError");
 
    if(fname === "")
    {
        document.getElementById("fnamebox").style.border = "1px solid red";
        document.getElementById("fnamebox").style.backgroundColor = "pink";
        fnameError.style.display = "block";
        fnameError.innerHTML = "Enter your first name";
        formValidity = false;
    }
    else
    {
        document.getElementById("fnamebox").style.border = "";
        document.getElementById("fnamebox").style.backgroundColor = "white";
        fnameError.style.display = "none";
        fnameError.innerHTML = "";
        localStorage.setItem("fnameStorage", fname);
        syncToStorage();
    }
}

//Checks to see if user has entered a last name
function validateLastName()
{        
    var validity = true;
    var lname = document.getElementById("lnamebox").value;
    lname = lname.trim();
    var lnameError = document.getElementById("lastNameError");

    if(lname === "")
    {
        document.getElementById("lnamebox").style.border = "1px solid red";
        document.getElementById("lnamebox").style.backgroundColor = "pink";
        lnameError.style.display = "block";
        lnameError.innerHTML = "Enter your last name";
        formValidity = false;
    }
    else
    {
        document.getElementById("lnamebox").style.border = "";
        document.getElementById("lnamebox").style.backgroundColor = "white";
        lnameError.style.display = "none";
        lnameError.innerHTML = "";
        localStorage.setItem("lnameStorage", lname);
        syncToStorage();
    }

}

//Validates an email in format "name@email.com"
function validateEmail()
{
    var emailInput = document.getElementById("emailbox");
    var emailValue = emailInput.value;
    emailValue = emailValue.trim();
    var error = document.getElementById("emailError");
    var emailRegex = /^[_\w\-]+(\.[_\w\-]+)*@[\w\-]+(\.[\w\-]+)*(\.[\D]{2,6})$/;

    try
    {

        if (emailRegex.test(emailValue) === false)
        {
            throw "Enter a valid email address";
        }

        emailInput.style.background = "";
        emailInput.style.border = "";
        error.innerHTML = "";
        error.style.display = "none";
        emailInput.value = emailInput.value.toLowerCase();
        localStorage.setItem("emailStorage", emailValue);
        syncToStorage();
    }
    catch(msg)
    {
        error.innerHTML = msg;
        error.style.display = "block";
        emailInput.style.background = "pink";
        emailInput.style.border = "1px solid red";
        formValidity = false;
    }
}

//validates a phone number
function validatePhone()
{
    var phoneInput = document.getElementById("phonebox");
    var phoneValue = phoneInput.value;
    phoneValue = phoneValue.trim();
    var error = document.getElementById("phoneError");
    var phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    try
    {
        if(phoneRegex.test(phoneValue) === false)
        {
            throw "Enter a valid phone number"
        }

        phoneInput.style.background = "";
        phoneInput.style.border = "";
        error.innerHTML = "";
        error.style.display = "none";
        localStorage.setItem("phoneStorage", phoneValue);
        syncToStorage();
    }
    catch(msg)
    {
        error.innerHTML = msg;
        error.style.display = "block";
        phoneInput.style.background = "pink";
        phoneInput.style.border = "1px solid red";
        formValidity = false;
    }
}

//Validates an address
function validateAddress()
{
    var addrInput = document.getElementById("addressbox");
    var addrValue = addrInput.value;
    addrValue = addrValue.trim();
    var error = document.getElementById("addressError");

    try
    {
        if(addrValue === "")
        {
            throw "Enter your address"
        }

        addrInput.style.background = "";
        addrInput.style.border = "";
        error.innerHTML = "";
        error.style.display = "none";
        localStorage.setItem("addressStorage", addrValue);
        syncToStorage();
    }
    catch(msg)
    {
        error.innerHTML = msg;
        error.style.display = "block";
        addrInput.style.background = "pink";
        addrInput.style.border = "1px solid red";
        formValidity = false;
    }
}

//Checks if user selected a state/province
function validateState()
{
    var country = document.getElementById("countrybox").value;
    var stateInput = document.getElementById("statebox");
    var state = document.getElementById("statebox").value;
    var error = document.getElementById("stateError"); 

    try
    {
        if(state === "default")
        {
            if(country === "canada")
            {
                throw "Select a province";
            }
            else
            {
                throw "Select a state";
            }
        }

        error.style.display = "none";
        stateInput.style.background = "white";
        stateInput.style.border = "";
        localStorage.setItem("stateStorage", state);
        syncToStorage();
    }
    catch(msg)
    {
        error.innerHTML = msg;
        error.style.display = "block";
        stateInput.style.background = "pink";
        stateInput.style.border = "1px solid red";
        formValidity = false;
    }
}

//Checks to see if user entered a city
function validateCity()
{
    var cityInput = document.getElementById("citybox");
    var cityValue = cityInput.value;
    cityValue = cityValue.trim();
    var error = document.getElementById("cityError");

    try
    {
        if(cityValue === "")
        {
            throw "Enter your city"
        }

        cityInput.style.background = "white";
        cityInput.style.border = "";
        error.innerHTML = "";
        error.style.display = "none";
        localStorage.setItem("cityStorage", cityValue);
        syncToStorage();
    }
    catch(msg)
    {
        error.innerHTML = msg;
        error.style.display = "block";
        cityInput.style.background = "pink";
        cityInput.style.border = "1px solid red";
        formValidity = false;
    }
}

//Checks to see if user entered a valid ZIP/Postal code
function validateZip()
{
    var country = document.getElementById("countrybox").value;
    var zipInput = document.getElementById("zipbox");
    var error = document.getElementById("zipError");
    var usaZipRegex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    var mexZipRegex = /(^\d{5}$)/;
    var postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

    try
    {
        if(country === "canada")
        {
            if(postalRegex.test(zipInput.value) === false)
            {
                throw "Enter a valid postal code"
            }
        }
        else if(country === "mexico")
        {
            if(mexZipRegex.test(zipInput.value) === false)
            {
                throw "Enter a valid zip code"
            }
        }
        else if(country === "usa")
        {
            if(usaZipRegex.test(zipInput.value) === false)
            {
                throw "Enter a valid zip code"
            }
        }

        zipInput.style.background = "white";
        zipInput.style.border = "";
        error.innerHTML = "";
        error.style.display = "none";
        localStorage.setItem("zipStorage", zipInput.value);
        syncToStorage();
    }
    catch(msg)
    {
        error.innerHTML = msg;
        error.style.display = "block";
        zipInput.style.background = "pink";
        zipInput.style.border = "1px solid red";
        formValidity = false;
    }
}

//Validates a cvv
function validateCvv()
{
    var cvvRegex = /^[0-9]{3,4}$/;
    var cvvInput = document.getElementById("cvvbox");
    var cvv = cvvInput.value.trim();
    var error = document.getElementById("cvvError");

    try
    {
        if(cvvRegex.test(cvv) === false)
        {
            throw "Enter a valid cvv"
        }

        cvvInput.style.background = "white";
        cvvInput.style.border = "";
        error.innerHTML = "";
        error.style.display = "none";
        localStorage.setItem("cvvStorage", cvv);
        syncToStorage();
    }
    catch(msg)
    {
        error.innerHTML = msg;
        error.style.display = "block";
        cvvInput.style.background = "pink";
        cvvInput.style.border = "1px solid red";
        formValidity = false;
    }
}

//Checks to see if all elements are valid. Form will not submit if
//a single element is invalid
function validateForm(evt)
{
    if (evt.preventDefault)
	{
		evt.preventDefault(); //prevent form from submitting
	}
	else
	{
		evt.returnValue = false; //prevent form from submitting in IE8
	}

    formValidity = true;
    validateFirstName();
    validateLastName();
    validateEmail();
    validatePhone();
    validateAddress();
    validateState();
    validateCity();
    validateZip();
    validateCardType();
    validateCvv();
    calculatePrice();

    if (formValidity === true)
	{
		document.getElementById("formError").innerHTML = "";
        document.getElementById("formError").style.display = "none";
//        localStorage.setItem("orderId", orderId);
        //var order = orders[getOrderIdxById(orderId)];
		document.getElementsByTagName("form")[0].submit();
	}
	else
	{
		document.getElementById("formError");
		document.getElementById("formError").style.display = "block";
		scroll(0,0);
	}
}

//Displays the total cost for the purchase
function displayCosts()
{
    var beforeTaxElement = document.getElementById("totalBeforeTax");
    var taxElement = document.getElementById("tax");
    var totalElement = document.getElementById("totalWithTax");

    loadFromStorage();
//    var order = orders[getOrderIdxById(orderId)];
    var totalCost = order.price;
    setSelectedCurrency(currency);
    var temp = calculatePrice(totalCost, multipleFee);

    beforeTaxElement.innerHTML = temp.toFixed(2);
    taxElement.innerHTML = (getTax() * temp).toFixed(2);
    var total = (temp + (getTax() * temp)).toFixed(2);
    totalElement.innerHTML = getCurrency(total);

    localStorage.setItem("priceStorage", total);
    syncToStorage();
}

//Calculates total price depending if user selects "multiple payments"
function calculatePrice(cost, fee)
{
    var single = document.getElementById("single");
    var multiple = document.getElementById("multiple");

    if(multiple.checked)
    {
        cost = cost * fee;
        document.getElementById("multipleLabel").innerHTML = "Multiple Payments (pay over 24 months with a 4% fee)";
        localStorage.setItem("planStorage", "Multiple Payments");
    }
    else
    {
        document.getElementById("multipleLabel").innerHTML = "Multiple Payments";
        localStorage.setItem("planStorage", "Single Payment");
    }

    return cost;
}

//Empties out the options for the state select box
function resetStateOptions()
{
    var select = document.getElementById("statebox");

    for(var i = select.options.length - 1; i > -1; i--)
    {
        select.remove(i);
    }
}

//Adds options to the state select box
function addOptions(array, select)
{
    for(var i = 0; i < array.length; i++)
    {
        var option = document.createElement("option");
        option.text = array[i];
        option.value = array[i];
        select.add(option);
    }
}

//Gets the tax depending on which country the user selects
function getTax()
{
    var country = document.getElementById("countrybox").value;

    if (country === "canada")
    {
        return 0.15;
    }
    else if (country === "mexico" || country === "usa")
    {
        return 0.1;
    }
    else
    {
        return 0;
    }
}

function cancelCurrentOrder()
{
    cancelOrder(orderId);
    syncToStorage();
    window.history.back();
}

//Creates the event listeners
function createEventListeners()
{
    var locationSelect = document.getElementById("countrybox");
    if(locationSelect.addEventListener)
    {
        locationSelect.addEventListener("change", correctCountry, false);
    }
    else if(locationSelect.attachEvent)
    {
        locationSelect.attachEvent("onchange", correctCountry);
    }

    var cardNum = document.getElementById("cardbox");
    if (cardNum.addEventListener) 
	{
		cardNum.addEventListener("change", validateCardType, false); 
	}
	else if (cardNum.attachEvent) 
	{
		cardNum.attachEvent("onchange", validateCardType);
    }
    
    var fname = document.getElementById("fnamebox");
    if (fname.addEventListener)
    {
        fname.addEventListener("change", validateFirstName, false);
    }
    else if (fname.attachEvent)
    {
        fname.attachEvent("onchange", validateFirstName);
    }

    var lname = document.getElementById("lnamebox");
    if (lname.addEventListener)
    {
        lname.addEventListener("change", validateLastName, false);
    }
    else if (lname.attachEvent)
    {
        lname.attachEvent("onchange", validateLastName);
    }

    var email = document.getElementById("emailbox");
    if (email.addEventListener)
    {
        email.addEventListener("change", validateEmail, false);
    }
    else if (email.attachEvent)
    {
        email.attachEvent("onchange", validateEmail);
    }

    var phone = document.getElementById("phonebox");
    if (phone.addEventListener)
    {
        phone.addEventListener("change", validatePhone, false);
    }
    else if (phone.attachEvent)
    {
        phone.attachEvent("onchange", validatePhone);
    }

    var addr = document.getElementById("addressbox");
    if (addr.addEventListener)
    {
        addr.addEventListener("change", validateAddress, false);
    }
    else if (addr.attachEvent)
    {
        addr.attachEvent("onchange", validateAddress);
    }

    var state = document.getElementById("statebox");
    if (state.addEventListener)
    {
        state.addEventListener("change", validateState, false);
    }
    else if (state.attachEvent)
    {
        state.attachEvent("onchange", validateState);
    }

    var city = document.getElementById("citybox");
    if (city.addEventListener)
    {
        city.addEventListener("change", validateCity, false);
    }
    else if (city.attachEvent)
    {
        city.attachEvent("onchange", validateCity);
    }

    var zip = document.getElementById("zipbox");
    if (zip.addEventListener)
    {
        zip.addEventListener("change", validateZip, false);
    }
    else if (zip.attachEvent)
    {
        zip.attachEvent("onchange", validateZip);
    }

    var radios = document.getElementsByName("plan");
    for(var i = 0; i < radios.length; i++) 
    {
        radios[i].addEventListener("change", displayCosts, false);
    }

    var cvv = document.getElementById("cvvbox");
    if(cvv.addEventListener)
    {
        cvv.addEventListener("change", validateCvv, false);
    }
    else if (cvv.attachEvent)
    {
        cvv.attachEvent("onchange", false);
    }

    var form = document.getElementsByTagName("form")[0];
	if (form.addEventListener)
	{
		form.addEventListener("submit", validateForm, false);
	}
	else if (form.attachEvent)
	{
		form.attachEvent("onsubmit", validateForm);
    }
    
    var cancel = document.getElementById("cancelButton");
    if(cancel.addEventListener)
    {
        cancel.addEventListener("click", cancelCurrentOrder, false);
    }
}

//Used to set up the script
function setUpPage()
{
	order = orders[getOrderIdxById(orderId)];
	document.getElementById("o_id").value = orderId;
    localStorage.setItem("orderId", getOrderIdxById(orderId));
//    fetchCurrencyRates();
//    setCurrencyRates();
    displayCosts();
    correctCountry();
    createEventListeners();
}

if(window.addEventListener)
{
	window.addEventListener("load", setUpPage, false)
}
else if(window.attachEvent)
{
	window.attachEvent("onload", setUpPage);
}