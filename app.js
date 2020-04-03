//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getIndPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;

    };
/*
    var allExpenses = [];
    var allIncomes = [];
    var totalExpanses = 0;
    var totalIncomes = 0;
*/

/*
    var data = {
        allExpenses: [];
        allIncomes: [];
        totalExpanses: 0;
        totalIncomes:0;
    }
*/


    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentageTotalExpense: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //[1,2,3,4,5], next ID = 6
            //[1,2,4,6,8], next ID = 9
            // ID = lastID + 1

            //Create new id
            if( data.allItems[type].length > 0){    
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            //create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;

        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index,1);
            }

        },

        calculateBudget: function() {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //caluclate the percentage of income spent
            if(data.totals.inc > 0){ 
                data.percentageTotalExpense = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentageTotalExpense = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems['exp'].forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })

        },

        getPercentages: function() {

            var allPerc =  data.allItems['exp'].map(function(cur) {
                return cur.getIndPercentage();
            });

            return allPerc;
        },


        getBudget: function() {

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentageTotalExpense
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();



// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {

        //+ or - before the number
        //exactly two decimal points
        //comma seperating the thousands

        var numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        type === 'exp'? sign = '-' : sign = '+';

        return sign + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i=0; i<list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getinput: function() {
            
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Create a HTML string with placeholder text

            if  (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">%percentage%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }


            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            //querySelectorAll returns lists...this helps us to convert list to array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value='';
            });

            fieldsArr[0].focus();
                
        },

        displayBudget: function(obj) {

            var type;

            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentArr) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields, function(current, index) { 

                if(percentArr[index] > 0) {
                    current.textContent = percentArr[index] + '%';
                } else {
                    current.textContent = '---';
                    
                }

            });

        }, 

        displayMonth: function() {

            var now = new Date();

            var year = now.getFullYear();

            months = ['January', 'February', 'March','April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function() {

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },


        getDOMstrings: function() {
            return DOMstrings;
        }


    };

})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        //Keypress event doesnt happen on any particular element but on the global webpage so we add the event listener to the entire document
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        

        //3. Display the Budget on the UI
        UICtrl.displayBudget(budget);

    };


    var updatePercentages = function() {

        //1.Calculate the percentages
        budgetCtrl.calculatePercentages();


        //2.Read then form the budget controller
        var percentages = budgetCtrl.getPercentages();


        //3. Update the UI with the new interfaces
        UICtrl.displayPercentages(percentages);
        //console.log(percentages);


    };

    

    var ctrlAddItem = function() {

        var input, newItem;

        //1. Get the field input data
        input = UICtrl.getinput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);


            //3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            

            //4. Clear the input fields
            UICtrl.clearFields();
            
            //5.Calculate the budget
            //6.Display the Budget
            //Steps 5 and 6 happen in the updateBudget() function
            updateBudget();

            //7.Calculate and update percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            //inc-id
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

             //1. delete the item from the data structure
             budgetCtrl.deleteItem(type, ID);

             //2. delete the item from the UI
             UICtrl.deleteListItem(itemID);

             //3.Update and show the new budget
             updateBudget();

             //4. calcuulate and update percentages
             updatePercentages();


        }

    };

    return {
        init: function() {
            console.log('Application has started!!!');
            UICtrl.displayMonth();
            UICtrl.displayBudget( {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();

        }
    }

    

})(budgetController, UIController);



controller.init();