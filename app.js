//---------------------------------Storage controller-----------------------------------------------

const StorageCtrl = (function(){
    //This controller is responsible for storing, getting, updating and deleting the items in local storage 
    return{
        storeItem: function(item){
            //This method handles storing the items
            let items;
            //Initially it's verified if there is something in LS
            if(localStorage.getItem('items') === null){
                //if not, the items array is set to empty
                items = [];
                //Then the item itself is pushed in the array
                items.push(item);
                //Finally the array items is stored in LS
                localStorage.setItem('items', JSON.stringify(items));
            }else{
                //Otherwise, all the elements in ls is stored in items array
                items = JSON.parse(localStorage.getItem('items'));
                //Then the new item is added
                items.push(item);
                //Finally the array with the new item and the others elements are again stored in LS
                localStorage.setItem('items', JSON.stringify(items));
            }
        },
        getStoredItems: function(){
            //This method handles getting all the items from the LS
            let items;
            //Initially it is verufied if there is something in LS
            if(localStorage.getItem('items') === null){
                //If not, items array is set to empty
                items = [];
            }else{
                //Otherwise, items array is set to what is in LS
                items = JSON.parse(localStorage.getItem('items'));

            }
            return items;
        },
        updateItemInLs: function(updateItem){
            let items = [];
            //Initially all the items are stored in items
            items = JSON.parse(localStorage.getItem('items'));
            items.forEach(function(item, index){
                //Then, when the id of the item to be updated is equal to the id of the new item
                if(item.id === updateItem.id){
                    //The old item is removed and replaced by the new
                    items.splice(index, 1, updateItem);
                }
            });
            //All the items are stored in LS again
            localStorage.setItem('items', JSON.stringify(items));
        },
        deleteItemFromLs: function(id){
            //This method works the exact same way as the above method,
            //the difference is that the item is deleted and not updated
            let items = [];
            items = JSON.parse(localStorage.getItem('items'));
            items.forEach(function(item, index){
                if(item.id === id){
                    items.splice(index, 1); //The diference is here, the item is only removed from the array
                }
            });
            localStorage.setItem('items', JSON.stringify(items));
        },
        clearAllItemsFromLs: function(){
            localStorage.removeItem('items');
        }
    }
})();

//--------------------------------------------Item controller------------------------------------------

const ItemCtrl = (function(){
    //THis controller will handle the functionalities such as creating a new item and control the total calories
    //Constructor
    const ItemConstructor = function(id, meal, calories){
        this.id = id;
        this.meal = meal;
        this.calories = calories;
    }
    const data = {
        //This object contains all the infos about the meal and calories. 
        //Including the total calories and also the "currentItem" in case of deleting or editing an item.
        // items: [
        //     // {id: 0, meal: "Steak", calories: 1200},
        //     // {id: 1, meal: "Eggs", calories: 300},
        //     // {id: 2, meal: "Cookies", calories: 400}
            
        // ],
        items: StorageCtrl.getStoredItems(), //Get all the items from LS
        currentItem: null,
        totalCalories: 0
    }
    return{
        callData: function(){
            return data;
        },
        addItem: function(meal, calories){
            //This method creates a new item
            let id = 0;
            if(data.items.length > 0){
                //The newly item's id will be the array length
                id = data.items.length; 
            }
            calories = parseInt(calories); // The calories must be integer, so that it can be used to add the total calories
            const newData = new ItemConstructor(id, meal, calories); // A new item is created
            data.items.push(newData); //The newly created item is pushed to the items array
            return newData;
        },
        updateItem: function(meal, calories){
            //This method will just update the item

            let found = null;
            calories = parseInt(calories);
            data.items.forEach(function(item){
                //Looping through data.items and comparing the id of each element to the currentItem id
                //When they match, the old meal and calories will be updated to the new meal and calories
                if(item.id === data.currentItem.id){
                    item.meal = meal;
                    item.calories = calories;
                    found = item;
                }
            });
            //This found item is returned so that it can be used by other controllers and methods
            return found;
        },
        deleteItem: function(id){
            //This method will delete the item from the data structure
            //All the item's id are stored in "ids"
            const ids = data.items.map(function(item){
                return item.id;
            });
            //Then only the id passed as an argument will be stored in index
            const index = ids.indexOf(id);
            //Finally the item with the id stored in "index" is removed
            data.items.splice(index, 1);
        },
        clearAllItems: function(){
            //This method cleans the data structure
            data.items = [];
        },
        getItemToEdit: function(itemId){
            //This method will find the item with the id in "itemId"
            let foundItem;
            itemId = parseInt(itemId); //It's necessary to convert calories into an int, because it will be compared to an int
            data.items.forEach(function(item){
                if(item.id === itemId){
                    //When this item is found, the "found" variable will contain this item
                    foundItem = item;
                }
               
            });
            //this item is returned to be used in another methods
            return foundItem;
        },
        addTotalCalories: function(){
            //This method get the total calories.
            //It loops through the array items and add all the calories to "total"
            //then data.totalCalories will be this total
            let total = 0;
            data.items.forEach(function(item){
                total += item.calories;
                
            });
            data.totalCalories = total;
            return data.totalCalories;
        },
        setCurrentItem: function(currentItem){
            //It just set the current item 
            data.currentItem = currentItem;
        },
        getCurrentItem: function(){
            //Returns the current item to be used in another methods
            return data.currentItem;
        }

    }

})();

//------------------------------------UI controller-------------------------------------------------

const UICtrl = (function(){
    //This controller will controll everything releated to the UI.


    const UiSelectors = {
        //THis object contains all the ui selectors
        listItems: "#list-items",
        lis: "#list-items li",
        addBtn: ".add-btn",
        editBtn: ".update-btn",
        deleteBtn: ".delete-btn",
        backBtn: ".back-btn",
        clearAll: ".clear-btn",
        meal: "#meal",
        calories: "#calories",
        caloriesCounter: ".calories-counter"
    };
    
    //Public methods
    return{
        //PopulateItems will build the list with the meals and calories. The "items" argument is passed in the Init function
        PopulateItems: function(items){
            let html = "";

            items.forEach(function(item){
                html += 
                `   
                    <li class="collection-item" id="item-${item.id}"><strong>${item.meal}: </strong><em>${item.calories} calories</em>
                    <a class="secondary-content" href="#"><i class="edit-item fas fa-pencil-alt"></i></a></li>    

                `;
                
            });
            
            document.querySelector(UiSelectors.listItems).innerHTML = html;
        },
        callUISelectors: function(){
            //Make all the UI selectors public so that it can be accessible through another methods
            return UiSelectors;
        },
        fetchItems: function(){
            //Grab the values from the form and returns them to be public
            return{
                meal: document.querySelector(UiSelectors.meal).value,
                calories: document.querySelector(UiSelectors.calories).value
            };
        
        },
        createNewItem: function(item){
            //Create a new element
            const li = document.createElement('li');
            //Add the class cllection-item to this element
            li.classList = "collection-item";
            //Set the id of the li
            li.id = `item-${item.id}`;
            //Add the other propreties to the li
            li.innerHTML = `<strong>${item.meal}: </strong><em>${item.calories} calories</em>
            <a class="secondary-content" href="#"><i class="edit-item fas fa-pencil-alt"></i></a>`;
            //Append the li to the ul
            document.querySelector(UiSelectors.listItems).appendChild(li);
        },
        displayTotalCalories: function(calories){
            //Display the total calories
            document.querySelector(UiSelectors.caloriesCounter).textContent = calories;
        },
        updateItem: function(item){
            let li = document.querySelector(`#item-${item.id}`); 
            li.innerHTML = `<strong>${item.meal}: </strong><em>${item.calories} calories</em>
                            <a class="secondary-content" href="#"><i class="edit-item fas fa-pencil-alt"></i></a>`;
            
            // The code bellow was an old version to find the li. It's bigger but also works!                

            // lis = Array.from(lis); //Since it's a node list it's needed to convert lis into an array
            // lis.forEach(function(li){
            //     //the id of each li is grabbed to be compared to the id of the "item"
            //     const liId = li.getAttribute('id');
            //     if(liId === `item-${item.id}`){
            //         //If they are the same it means that the item to be updated was found
            //         //Then its innerHTMl will be now updated to the new meal and new calories
            //         //that "item" contains
            //         document.querySelector(`#${liId}`).innerHTML = 
            //         `
            //             <strong>${item.meal}: </strong><em>${item.calories} calories</em>
            //             <a class="secondary-content" href="#"><i class="edit-item fas fa-pencil-alt"></i></a>
            //         `;
            //     }
            // });
            
        },
        deleteItem: function(id){
            //This variable contains the element to be removed
            const li = document.querySelector(`#item-${id}`);
            //Then it's removed from the ul
            li.remove();
        },
        clearAllItems: function(){
            //All the lis are stored in the variable lis
            let lis = document.querySelectorAll(UiSelectors.lis);
            //Then it's is converted to an array, because it's is a node list 
            lis = Array.from(lis);
            //Finally each element is removed from the ul
            lis.forEach(function(li){
                li.remove();
            });
        },
        clearInput: function(){
            //this public method will jus clear the inputs
            document.querySelector(UiSelectors.meal).value = ''
            document.querySelector(UiSelectors.calories).value = ''
        },
        addItemToForm: function(){
            //Fill the inputs with the value of "currentItem", which will be edit by the user
            document.querySelector(UiSelectors.meal).value = ItemCtrl.getCurrentItem().meal;
            document.querySelector(UiSelectors.calories).value = ItemCtrl.getCurrentItem().calories;
        },
        initialState: function(){
            //The initial state will show only the "add button" and hide all the others
            document.querySelector(UiSelectors.addBtn).style.display = "inline";
            document.querySelector(UiSelectors.editBtn).style.display = "none";
            document.querySelector(UiSelectors.deleteBtn).style.display = "none";
            document.querySelector(UiSelectors.backBtn).style.display = "none";
            this.clearInput();
        },
        editState: function(){
            //THe edit state makes the opposite of the "initialState"
            document.querySelector(UiSelectors.addBtn).style.display = "none";
            document.querySelector(UiSelectors.editBtn).style.display = "inline";
            document.querySelector(UiSelectors.deleteBtn).style.display = "inline";
            document.querySelector(UiSelectors.backBtn).style.display = "inline";
        }
        
    }
    
})();

//------------------------------------------App------------------------------------------------------

const App = (function(ItemCtrl, UICtrl, StorageCtrl){
    //This controller starts the whole app. From here the other controllers will be called
    const eventListeners = function(){
        //This variable contains all the UIselectors
        const uiSelect = UICtrl.callUISelectors();
        //Create an event listener to the button 
        document.querySelector(uiSelect.addBtn).addEventListener('click', addItem);
        //Disable submit on enter key
        document.addEventListener('keypress', function(e){
            if(e.keyCode === 13 || e.which === 13){
                e.preventDefault();
                return false;
            }
        });
        //Call get item when the ul is clicked 
        document.querySelector(uiSelect.listItems).addEventListener('click', getItem);
        //Call updateItem when the update button is clicked
        document.querySelector(uiSelect.editBtn).addEventListener('click', updateItem);
        //Call the "backToInitial" function when the back button is pressed 
        document.querySelector(uiSelect.backBtn).addEventListener('click', backToInitial);
        //Call the deleteItem function when the delete button is pressed
        document.querySelector(uiSelect.deleteBtn).addEventListener('click', deleteItem);
        //Call the clearAllItems function when the button clearAll is clicked
        document.querySelector(uiSelect.clearAll).addEventListener('click', clearAllItems);
    }
    function addItem(e){
        //When the event is fired, this method is called.
        //It basically verifies if the fields are filled, if it's, a new item will be created
        const item = UICtrl.fetchItems();
        if(item.meal !== '' && item.calories !== ''){
           
            const newItem = ItemCtrl.addItem(item.meal, item.calories);
            UICtrl.createNewItem(newItem); //Pass the newItem to the UIctrl
            const totalCalories = ItemCtrl.addTotalCalories(); //Get the total calories
            UICtrl.displayTotalCalories(totalCalories); //display total calories
            StorageCtrl.storeItem(newItem); //Store the new item in LS
            
        }
        UICtrl.clearInput();
        e.preventDefault();
    }
    function getItem(e){
        //This method will detect a click on the ul element
        //and then check if the element clicked has a class called "edit-item"
        //which only the icons contain this class
        if(e.target.classList.contains('edit-item')){
            //When the icon is clicked, the variable "liId" will have its id
            const liId = e.target.parentElement.parentElement.id;
            //Since the li id is a string and only the number itself is needed, 
            //THe string will be splited into 2 parts, one with the string itself and the other with the number
            const arrLiId = liId.split('-');
            //Only the number is passed as an argunment to "getItemToEdit"
            const itemToEdit = ItemCtrl.getItemToEdit(arrLiId[1]);
            //When the item with the passed id is found, this item is set as the current item
            ItemCtrl.setCurrentItem(itemToEdit);
            //Then the meal and calories of this item will be used to fill the inputs
            UICtrl.addItemToForm();
            //And finally the other buttons will be shown
            UICtrl.editState();
            
        }
    }
    function updateItem(e){
        //Fetch the new input values
        const item = UICtrl.fetchItems();
        //Pass as an argument these new values to "updateItem"
        const itemToUpdate = ItemCtrl.updateItem(item.meal, item.calories);
        //Update the UI
        UICtrl.updateItem(itemToUpdate);
        //Update the total calories
        UICtrl.displayTotalCalories(ItemCtrl.addTotalCalories());
        StorageCtrl.updateItemInLs(itemToUpdate);
        //Call the initial state to hide the edit, delete and back buttons
        UICtrl.initialState();
        e.preventDefault();
    }
    function deleteItem(e){
        //This method is fired when the delete button is clicked
        //It's needed to get the id, so it can be passed as an argument to be removed from the
        //data structure and the ui
        const id = ItemCtrl.getCurrentItem().id;
        ItemCtrl.deleteItem(id);
        UICtrl.deleteItem(id);
        //Total calories are updated
        UICtrl.displayTotalCalories(ItemCtrl.addTotalCalories());
        StorageCtrl.deleteItemFromLs(id); //Delete the item form LS
        //The add button is shown and the other is hidden
        UICtrl.initialState();
        e.preventDefault();
    }
    function clearAllItems(e){
        //Call the methods to clear everything and then update the total calories
        ItemCtrl.clearAllItems();
        UICtrl.clearAllItems();
        UICtrl.displayTotalCalories(ItemCtrl.addTotalCalories());
        StorageCtrl.clearAllItemsFromLs(); //Remove all items from ls
        e.preventDefault();
    }
    function backToInitial(){
        UICtrl.initialState();
    }
    
    //Public methods
    return{
        //The Init method will call all the other public methods in the other controllers
        //The first method to be executed when the application loads
        Init: function(){
            UICtrl.initialState();
            const items = ItemCtrl.callData().items;
            UICtrl.PopulateItems(items);
            UICtrl.displayTotalCalories(ItemCtrl.addTotalCalories());
            eventListeners();
        }
    }
})(ItemCtrl, UICtrl, StorageCtrl);


App.Init();