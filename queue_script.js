/**
 * Internet 2 Final Project
 * The Electric Car Company
 * Authors: Carvalho-Dagenais, Matthew; Massy, sebastien; Patel, Parimal
 * Description: This script will create div tags that contain order information
 *              as well as a confirm and a cancel butoon.
 */

"use strict";

//Writes the queue to the page
function writeQueue()
{
    var order = orders;
    for(var i = orders.length - 1; i > -1; i--)
    {
        writeInfo(i);
    }

}

//Adds a div with all the information about an order
function writeInfo(id)
{
    var newDiv = document.createElement("div");
    var idPlusOne = id + 1;
    newDiv.id = id;
    newDiv.class = "orderDiv";

    //Append info
    newDiv.appendChild(document.createTextNode("ID: " + orders[id].id));
    newDiv.appendChild(document.createElement('br'));
    newDiv.appendChild(document.createTextNode("Date Ordered: " + orders[id].date));
    newDiv.appendChild(document.createElement('br'));
    newDiv.appendChild(document.createTextNode("Price: " + orders[id].price));
    document.getElementById("queueDiv").appendChild(newDiv);
    newDiv.appendChild(document.createElement('br'));
    newDiv.appendChild(document.createTextNode("Items Ordered: "));

    //Create a list of items ordered and append it 
    var itemList = document.createElement("ul")
    newDiv.appendChild(itemList);
    for(var i = 0; i < orders[id].items.length; i++)
    {
        var item = document.createElement('li');
        item.innerHTML = orders[id].items[i].name;

        if(orders[id].items[i].isBase == true)
        {
            item.innerHTML += ", base";
        }
        else
        {
            item.innerHTML += ", optional";
        }

        itemList.appendChild(item)
    }

    //Estimated wait time
    newDiv.appendChild(document.createElement('br'));
    newDiv.appendChild(document.createTextNode("Estimated Wait Time: " + getWaitTime(orders[id].id) + " days"));
    newDiv.appendChild(document.createElement('br'));

    //Create a complete button
    var complete = document.createElement("button");
    complete.innerHTML = "Mark Order As Done";
    complete.class = idPlusOne;
    complete.addEventListener("click", function(){confirmOrder(id, newDiv);}, false);
    newDiv.appendChild(complete);

    //Create a delete button
    var cancel = document.createElement("button");
    cancel.innerHTML = "Cancel Order";
    cancel.class = idPlusOne;
    cancel.addEventListener("click", function(){cancelOrder(id, newDiv)}, false);
    newDiv.appendChild(cancel);

    //Basic styles
    newDiv.style.border = "3px solid black";
    newDiv.style.padding = "3px 3px 3px 3px";
    newDiv.parentElement.appendChild(document.createElement("br"));
}

//Used for the "complete order" button 
//Deletes an order from the order queue
function confirmOrder(id, divElement)
{
    if(window.confirm("Are you sure you want to mark the order as done?"))
    {
        loadFromStorage();
        orders.splice(id, 1);
        $(divElement).fadeOut("slow");
        syncToStorage();
    }
    else
    {
        //Do nothing
    }
}

//Modified version of tecc_main.js cancelOrder() needed for button listeners to work.
//Used for the "cancel order" button
//Deletes an order from the order queue and returns inventory
function cancelOrder(id, divElement)
{
    if(window.confirm("Are you sure you want to cancel the order?"))
    {
        var order = orders.splice(id, 1)[0];
	    for (var i = 0; i < order.items.length; i++) {
		    if (order.items[i].isBase) {
		    	var item = baseItems.get(order.items[i].type, order.items[i].name);
		    } else {
		        var item = optionalItems.get(order.items[i].type, order.items[i].name);
		    }
		    if (item !== undefined) {
		        item.stock++;
            }
        }
        syncToStorage();
        $(divElement).fadeOut("slow");
    }
    else
    {
        //Do nothing
    }
}

//Sets up the page
function setupPage()
{
    loadFromStorage();
    writeQueue();
}

if(window.addEventListener)
{
    window.addEventListener("load", setupPage, false)
}
else if(window.attachEvent)
{
    window.attachEvent("onload", setupPage);
}
