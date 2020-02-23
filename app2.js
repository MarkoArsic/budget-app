/*************************************BudgetController & Data Structure**************************/
var budgetController = (function(){
    //function constructor - class
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentageProto = function(totalIncome) {
        //racuna procenat od svakog objekta Expense
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    Expense.prototype.returnPercentageProto = function() {
        return this.percentage;
    };
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calcTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(currVal) {
            sum += currVal.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        //instance Expenses i Incomes
        allItems: {
            exp: [],
            inc: []
        },
        // suma svih prihoda i rashoda
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1 //not exist -1
    };

    //returning public methods

    return {
        //prima tip (inc || exp), opis, vrednost i pravi instance
       insertItem: function(type, descr, val) {
           var newItem, ID;
           if(data.allItems[type].length > 0){
                //create new id, id = last el +1
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // !!!!!????
                //primer > data.allItems.inc[4].id + 1;
           }else {
                ID = 0;
           }
           
           //create new object based on inc or exp
           if(type === 'exp') {
                newItem = new Expense(ID, descr, val);
           }else if (type === 'inc') {
                newItem = new Income(ID, descr, val);
           }
           //add new object to ([inc] OR [exp]) array
           data.allItems[type].push(newItem);
           //return current object
           return newItem;
           
        },
        deleteItem: function(type, id) {
            //ids [1 2 4 6 8] example
            var ids, index;
            //  Map creates new array with all objects id's
            ids = data.allItems[type].map(function(curObj) {
                return curObj.id;
            });
            //retreive index of the curent object id in the array
            index = ids.indexOf(id);

            if(index !== -1) {
                //splice method deletes the (start index, nuber of elements)
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function() {
            //1 calc total income and expensnes
            calcTotal('inc');
            calcTotal('exp');
            //2 calc budget inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            //3 calc percentage, of spent income
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        caclulatePercentage: function() {
            // total income / single expense * 100
            //calls the calcPercentageProto with current object and passing totalIncome
            data.allItems.exp.forEach(function(i) {
                i.calcPercentageProto(data.totals.inc);
            });
        },
        getPercentage: function() {
            //returnPercentage() prototype return this.percentage, 
            //then stores in new allPercetntages arr
            var allPercentages = data.allItems.exp.map(function(i) {
                return i.returnPercentageProto();
            });
            return allPercentages;

        },
        //return budget to appController, then passed to UI
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        printData: function() {
            console.log('------------------------------------');
            console.log(data);
            console.log('------------------------------------');
        }   
    } 
})();

/***************************************UIController*********************************************/
var UIController = (function() {

    var DOMstrings = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputBtn: '.add__btn',
            incomeList: '.income__list',
            expensesList: '.expenses__list',
            budgetValue: '.budget__value',
            incomeTotal: '.budget__income--value',
            expensesTotal: '.budget__expenses--value',
            percentage: '.budget__expenses--percentage',
            bubbleContainer: '.container',
            expensesPercentage: '.item__percentage',
            dateLabel: '.budget__title--month'
    };

    var fоrmatNumber = function(num, type) {
        var numSplited, int, dec;
        // + OR - before number
        //exacly 2 decimal points 
        //comma separated the thousands
        num = Math.abs(num);
        num = num.toFixed(2); //2 decimals rounding

        numSplited = num.split('.');
        int = numSplited[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); //2310 > 2,310
        }
        dec = numSplited[1];            

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +dec

   };
   var nodeListForEach = function(nodeList, callBackF) {
    //for each nodeList > call nodeListForEach()
        for (var i = 0; i < nodeList.length; i++) {
            callBackF(nodeList[i], i);
        }   
    };

    //returning public methods
    return {
        getInput: function() {
            //return object with properties
            return {
                type: document.querySelector(DOMstrings.inputType).value, //inc OR exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },
        //prosledjuje se objekat returned from insertItem(), sacuvan u newItem var-u 
        addListItem: function(obj, type) {
            var html, newHTML, element;

            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace the placeholder text with some actual data, overriding newhtml var
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', fоrmatNumber(obj.value, type));

            //Insert the HTML into DOM
            //insert insertAdjacentHTML
            //document.querySelector(startni element).insertAdjacentHTML('where', what);
            //'beforeend', appenduje na postojecu listu, before closing tag of the selected element
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },
        deleteListItem: function(nodeID) {
            //remove child element -> 
            //select element to delete, 
            var el = document.getElementById(nodeID);
            //then one step up, and then delete child
            el.parentNode.removeChild(el);
        },
        clearFields: function() {
            var fields, fildsArr;
            //querySelectorAll returns list 
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);  
            //convert list to array, 
            fildsArr = Array.prototype.slice.call(fields);
            //iterate trough array and set current val to empty string   
            fildsArr.forEach(function(currVal, index, arr) {
                currVal.value = "";
            });
            //focus on first field (description)
            fildsArr[0].focus();
        },
        displayBudget: function(budgetObj) {
            var type;
            budgetObj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetValue).textContent = fоrmatNumber(budgetObj.budget, type);
            document.querySelector(DOMstrings.incomeTotal).textContent = fоrmatNumber(budgetObj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesTotal).textContent = fоrmatNumber(budgetObj.totalExpenses, 'exp');
            if (budgetObj.percentage > 0) {
                document.querySelector(DOMstrings.percentage).textContent = budgetObj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentage).textContent = '---';
            }
        },
        displayPercentages: function(percentages) {
            //querySelectorAll vraca nodeList
            var percentageFields = document.querySelectorAll(DOMstrings.expensesPercentage);

            nodeListForEach(percentageFields, function(current, index) {
                if ( percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now = new Date();
            month = now.getMonth();
            var year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = month +1 + '/' + year;
        },
        changeColor: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        //exposingDOMstrings object to public via publishDomstrings method
        publishDOMstrings: function() {
            return DOMstrings;
        }
    }
})();

/************************************APPCONTROLLER****************************************/
//appController se uvek samopoziva sa (budgetController, UIController) argumentma, ovde govorimo ostalim modulima sta da rade!
var appController = (function(bCtrl, UICtrl) {
    //event listeners gatherd for init() call
    var setUpEventListeners = function() {
        //catching the DOMstrings object, returned by publishDOMstrings()
        var getDOMstrings = UICtrl.publishDOMstrings();

        document.querySelector(getDOMstrings.inputBtn).addEventListener('click', cAddItem);

        //Global listener for enter key,funkcija prima event objekat generisan od strane Eventlistener-a
        document.addEventListener('keypress', function(eventObj) {
        // IF enter is pressed
            if(eventObj.keyCode === 13 || eventObj === 13) {
                cAddItem();
            }
        });
        //event bubble listener
        document.querySelector(getDOMstrings.bubbleContainer).addEventListener('click', ctrlDeleteItem);
        //changing field colors based on + OR - selection
        document.querySelector(getDOMstrings.inputType).addEventListener('change', UICtrl.changeColor);
    };

    var updateBudget = function() {
        //1 calculate budget
        bCtrl.calculateBudget();
        //2 return budget
        var budget = bCtrl.getBudget();
        //3 display budget
        UICtrl.displayBudget(budget);
    };
    var updatePercentage = function () {
        
        // 1 Calc percentage
        bCtrl.caclulatePercentage();
        // 2 read it from budget controlled
        var percentages = bCtrl.getPercentage();
        // 3 update UI 
        UICtrl.displayPercentages(percentages);

    };
    //pozivaju EventListener-i
    var cAddItem = function() {
        var input, newItem;
        //1 getInput()  from UICTRL
        input = UICtrl.getInput();
        //prevencija unosa praznog polja ili 0 
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2 add item to budget data structure
            newItem = bCtrl.insertItem(input.type, input.description, input.value);
            //3 add to UI list
            UICtrl.addListItem(newItem, input.type);
            //4 clear fields
            UICtrl.clearFields();
            //5 calculate and update budget
            updateBudget();
            // 6 calc and update percentage
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(eventObj) {
        var nodeID, splitID, type, ID;
        //DOMtraversing-EventBubbleing, iz eventObjecta.target vidimo gde je event okinut i 
        //penjemo se 4 koraka uz node tree da bi uhvatili id noda
        //ex: inc-id || exp-id
        nodeID = eventObj.target.parentNode.parentNode.parentNode.parentNode.id;

        if(nodeID) {
            //exampe inc-1 -> nodeID.split('-') = ["inc", "1"]
            splitID = nodeID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1 delete item from data structure
            bCtrl.deleteItem(type, ID);
            // 2 delete item from UI
            UICtrl.deleteListItem(nodeID);
            // 3 update and show new budget
            updateBudget();
            // 4 calc and update percentage
             updatePercentage();
        }

    };

    //returning public methods
    return {
        init: function() {
            setUpEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            })
            
            console.log('------------------------------------');
            console.log('App started');
            console.log('------------------------------------');
        }
    }

})(budgetController, UIController);

// init call> setUpEventListeners();
appController.init();





















































































































































/*
//closure - Module
var budgetController = (function(){
    //private
    var x = 23;
    var add = function(a) {
        return x + a; 
    }

    //public 
    return {
        publicTest: function(b) {
            return add(b);
        }
    } 
})();
//budgetController.publicTest(3);

var UIController = (function() {
})();

//appController se uvek poziva sa 
//(budgetController, UIController)
var appController = (function(bCtrl, UICtrl) {
    
    var z = bCtrl.publicTest(5);
    //return object
    return {
        printPublic: function(){
            console.log(z);
        }
    }
})(budgetController, UIController);*/