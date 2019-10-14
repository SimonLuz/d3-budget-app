

// **********************************************************
// CONTROLLER
//***********************************************************
var budgetController = (function() {
    
    // 6. Function constructor for all the instances of inc & exp
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1; // initial value
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if (totalIncome > 0) {
           this.percentage = Math.round((this.value / totalIncome) * 100);
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
        
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    // 7. Data structure
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
        percentage: -1,
                
    }
    
    
    
    // 5.1.1 Calc budget - my idea/my code
    var calcTotal = function(label) {
        data.totals[label] = 0;
        
        data.allItems[label].forEach(el => data.totals[label] += el.value);
    } 
    
    
    return {
        
        // 3.2. return newly created item
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if (data.allItems[type].length === 0) {
                ID = 0;    
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;    
            }
            
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            
            return newItem;
        },
        
        
        // 5.1 Calc budget
        calculateBudget: function() {
          
            // 1. calc total income and expense - private function
            calcTotal("inc");
            calcTotal("exp");
            
            // calc budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calc percentage of expense
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

            
        },
        
        
        // 7.1 Calc percentage for exp
        calculatePercentage: function() {
            if (data.allItems.exp.length > 0) {
                data.allItems.exp.forEach(function(el) {
                    el.calcPercentage(data.totals.inc);
                });
            } else {
                return;
            }
        },
        
        
        // 7.2 Get percentages as an array
        getPercentage: function() {
            
            var percentages = data.allItems.exp.map(function(cur) {
                return cur.percentage;
            })
            
            return percentages;
        },
        
       
        
        
        // 5.2 
        returnBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        
        // 6.2 Delete item from the data structure
        deleteData: function(type, id) {
            
            console.log("DeleteData from data structure")
            data.allItems[type]  = data.allItems[type].filter(el => el.id != id);
        },
        
        
        
        // Reset all data in data structure
        resetAllData: function() {
            data.allItems.exp = [];
            data.allItems.inc = [];
            data.totals.exp = 0;
            data.totals.inc = 0;
            data.budget = 0;
            data.percentage = -1;
        },
        
        
        dbData: function() {
            return data;
        }
        
        
    }
    
})();




// **********************************************************
// UI MODULE
//***********************************************************
var UIController = (function() {
    
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: '.add__btn',
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        itemPercentage: ".item__percentage",
        budgetMonth: ".budget__month--select"
    }
    
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec, sign;
/*            + or - before numbers
            exactly 2 decimal points
            comma separating the thousands*/
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split(".");
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); 
            }
            
            dec = numSplit[1]
            
            return (type === "inc" ? "+" : "-") + " " + int + "." + dec;
        };
    
    
    return {
        
        // 3.1
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // gets VALUE attr: "inc" or "exp"
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
            
        },
        
        // 3.3 Add Item to UI
        addListItem: function(obj, type, dbID) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === "inc") {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%" fireid="%fireID%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';    
            } else if (type === "exp") {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%" fireid="%fireID%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            
            // Replace the placeholder with data
             newHtml = html.replace("%id%", obj.id)
                            .replace("%description%", obj.description)
                            .replace("%value%", formatNumber(obj.value, type))
                            .replace("%fireID%", dbID)
            
            // Put the string into DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
            
        },
        
        
        // 6.2 remove item from UI - 
        deleteListItem: function(selectorID) {
            console.log("Delete List Item", selectorID)
            // node.removeChild(item) method - my Code
            var item = document.querySelector("#" + selectorID + "");
            item.parentNode.removeChild(item);
            

        },
        
        
        // Delete all items at once
        deleteAllItems: function() {
            let itemParents = [document.querySelector(DOMStrings.expenseContainer), document.querySelector(DOMStrings.incomeContainer)]
            
            for (let parent of itemParents) {
                let child = parent.lastElementChild;
                
                while(child) {
                    parent.removeChild(child);
                    child = parent.lastElementChild;
                }
            }
        },
        
        
        // 3.4 Clear input fields 
        clearFields: function() {
            var fields, fieldArr;


            fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue )
            
            // turn NodeList into an array:
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(el => el.value = "")
            
            // focus back to input field
            document.querySelector(DOMStrings.inputType).focus();
        },
        
        
        // 5.3 Display budget
        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = "inc" : type = "exp";
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type)
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, "exp");
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "---";
            }
            
        },
        
        
        // 7.3 Display item percentages (exp)
        displayItemPercentage: function(percentages) {
            var domItems = document.querySelectorAll(DOMStrings.itemPercentage);
            
            // Jonas's Code
            var nodeListForEach = function(list, callback) {
                for (var i=0; i<list.length; i++) {
                    callback(list[i], i)  
                }    
            };
            
            nodeListForEach(domItems, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
            
        },
        
        
        
        
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
    
})();


// **********************************************************
// D3 DB CONTROLLER
//***********************************************************
var donutChartController = (function() {
    let newItem, 
        month = "January",
        data = [];
    
    // chart dimensions
    const chartDims = {width: 300, height: 250, radius: 120};
    // center of the graph setup
    const center = {x: (chartDims.width / 2) + 10, y: (chartDims.height / 2) + 20};
    
    // svg variable
    const svg = d3.select(".canvas-2")
        .append("svg")
        .attr("class", "graph__svg")
        .attr("width", chartDims.width + 50)
        .attr("height", chartDims.height + 50)
    
    // graph 
    const graph = svg.append("g")
        .attr("transform", `translate(${center.x+20}, ${center.y + 20})`)
        .attr("class", "graph__chart")
    
    // pie() generator function - 
    const pie = d3.pie()
        .sort(null)//.sort( (a, b) => d3.descending(b.value, a.value))
        .value(d => d.value) // value on which the angles will be calculated
//    console.log([2,5,1,6,33,22,12].sort(function(a,b) { return a - b}))
    
    // path "d" generator function
    const arcPath = d3.arc()
        .outerRadius(chartDims.radius)
        .innerRadius(chartDims.radius / 2.5)
    
    
    // color definition
    /*const gradient = d3.scaleLinear()
        .domain(0, data.length)
    var interpolate = d3.interpolateRgb("steelblue", "brown")
        console.log(interpolate())
    */
    const colorInc = d3.scaleLinear()
        .range(["#28B9B5", "#b0eeeb"])
        .interpolate(d3.interpolateRgb)
    
    const colorExp = d3.scaleLinear()
        .range(["#FF5049", "#f3cfce"])
        .interpolate(d3.interpolateRgb)
    
    
    // Transitions 
    const arcTweenEnter = (d) => {
//        console.log(d)
        let i = d3.interpolate( d.endAngle, d.startAngle )
        
        return function(t) {
            d.startAngle = i(t);
//            console.log("DUPA", d)
//            console.log(arcPath(d))
             return arcPath(d);
        }
    };
    
    const arcTweenExit = (d) => {
        let i = d3.interpolate( d.startAngle, d.endAngle)
        console.log("arcTweenExit")
        return function(t) {
            d.startAngle = i(t);
            return arcPath(d);
        }
    };
    
    // use function keyword to allow use of this 
    function arcTweenUpdate(d) {
        let i = d3.interpolate( this._current, d)
        
        // update this._current with the new data
        this._current = i(1);
        
        return function(t) {
//            console.log("CURRENT 2", this._current)
//            this._current = i(t); // this line not in the course
            return arcPath(i(t)) // return arcPath(i(t))
        }
    }
    
    
    // Tooltip d3 setup
    const tip = d3.tip()
        .attr("class", "tooltip")
        .html((d) => {
            let type;
            d.data.type === "exp" ? type = "Expense" : type = "Income"
            let content = `<p class="tooltip__type">${type}</p>
                        <p class="tooltip__desc">${d.data.description} - 
                        $${d.data.value}</p>`
            
            return content;
        })
    
    graph.call(tip);
    
    
    // add LEGEND
    const legendColor = d3.scaleOrdinal()
        .domain(["Expenses", "Income"])
        .range(["#FF5049", "#28B9B5"])
    
    // Add legend
    const legendGroup = svg.append("g")
        .attr("class", "legend__donutChart")
        .attr("transform", `translate(${chartDims.width-40}, 10)`)
    
    const legend = d3.legendColor()
        .scale(legendColor)
    
    legendGroup.call(legend)
    
    
    
    
    // Event handler functions for eventListener for tooltip
    const handleMouseOver = function(d, i, n) {
        d3.select(n[i]) // that wraps n[i] in a d3 OBJECT and allows using d3 methods
            .transition().duration(300)
                .attr("fill", "#eee")
    }
    
    const handleMouseOut = function(d, i, n) {
        d3.select(n[i])
            .transition().duration(300)
                .attr("fill", () => d.data.type == "inc" ? colorInc(i) : colorExp(i))
    }
    
    
    
    // *****************************************************************
    // *****************************************************************

    return {
        
        // update with new entry from UI
        updateNewItem: function(item) {
            newItem = item; // {type: "inc", description: "wea", value: 234}
            console.log("1. UpdateNewItem")
        },
        
        
        // update with new month selected from the dropdown month menu
        addMonth: function(item) {
            month = item;
            console.log("1. ADD MONTH", month)
        },
        
        
        // send new entry from UI to the DB to the selected month collection
        pushToDB: function() {
            db.collection(month).add(newItem).then(res => {
                console.log("2. pushToDB")
                console.log(newItem)
                console.log(month)
            })
        },
        
        
        // retrieve current month
        getMonth: function() {
            return month;
        },
        
        
        // reset data[] after selecting the new month
        resetData: function() {
             console.log("2. RESET DATA")
            data = [];    
        },
        
        
        // Delete a single record from the firebase DB
        deleteSingleDBItem: function(month, id) {
            console.log("DELETE SINGLE item in Firebase")
            console.log(month, id)
            
            db.collection(month).doc(id).delete()
        },
        
        
       // DB listener setup
        listenToDB: function() {
            
        // DB update - listener for DB changes 
            db.collection(month).onSnapshot(res => {    
                let dataSorted = [];
            console.log("!!!LISTEN TO DB!!!!!")
        //        console.log(res)
//                console.log(res.docChanges())
                res.docChanges().forEach(elem => {

                    var item = {...elem.doc.data(), dbID: elem.doc.id}
                    switch (elem.type) {
                            
                        case "added": 
                            console.log("ADDED")
                            console.log(item)
                            data.push(item);
                            break;
                        case "modified":
                            console.log("MODIFIED")
                            console.log(item)
                            let index = data.findIndex(d => d.id === item.id);
                            data[index] = item;
                            break;
                        case "removed":
                            console.log("REMOVED")
                            console.log(item)
                            data = data.filter(d => d.dbID != item.dbID);
                            break;
                        default:
                            break;
                    }
                })
                
                console.log("DATA After SWITCH:")
                console.log(data)
                
                // sort data[] to group "exp" and "inc"
                data.forEach(function(el) {
                    if (el.type == "exp") {
                        dataSorted.push(el);
                    } else {
                        dataSorted.unshift(el)
                    }
                    
                })
                
                console.log(dataSorted) 
                data = dataSorted;
                this.graphUpdate(data);
            })
    
        },
        
        
        // retrieve data for the update(data) function (here: graphUpdate(data))
        getDBData: function() { ////////////// NOT NEEDED??????????????????????
            console.log("4. getDBData")
            return data;
        },

        
        // d3 update(data) function (run when new item added or new month selected) 
        graphUpdate: function(data) {
            console.log("!!GRAPH UPDATE ", data)
            
            // Set color
//            console.log(data.length)
            colorExp.domain([0, data.length])
            colorInc.domain([0, data.length])
            
            // call legend
            // legendGroup.call(legend);
            
            // Join enhanced pie(data) to path elements
            const path = graph.selectAll("path")
                .data(pie(data))
//            console.log(path)
            
            // remove exit() selection
            path.exit().remove()
                .transition().duration(750)
                    .attrTween("d", arcTweenExit)
//            console.log("EXIT", path.exit())
            
            // handle the current DOM path updates
            path
                .attr("d", d => arcPath(d))
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
                .attr("fill", (d, i) => {
                    return d.data.type == "exp" ? colorExp(Math.ceil(i * 0.8)) : colorInc(i * 1.5);
                })
                .transition().duration(900)
                    .attrTween("d", arcTweenUpdate)
            
            // handle enter() selection
            path.enter()
                .append("path")
                    .attr("class", "arc")
//                    .attr("d", d => arcPath(d))
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2)
                    .attr("fill", (d, i) => {
//                        console.log(d)
//                        console.log(i)
                        return d.data.type == "exp" ? colorExp(i * 0.7) : colorInc(i*1.5)
                    })
                    .each(function(d){this._current = d})
                    
                    .transition().duration(900)
                        .attrTween("d", (d) => arcTweenEnter(d))
            
            
            // add eventListener
            graph.selectAll("path")
                .on("mouseover", (d, i, n) => {
                handleMouseOver(d, i, n);
                tip.show(d, n[i]) // .show needs 2 arguments: element & this
            })
                
                .on("mouseout", (d,i,n) => {
                handleMouseOut(d,i,n);
                tip.hide(d,n[i])
            })
        }, 
    }
     
})();



// **********************************************************
// CONTROLLER
//***********************************************************
var controller = (function(budgetCtrl, UICtrl, DBCtrl) {
    var d3Data, month;
    
    
    var DOM = UICtrl.getDOMStrings();
        console.log(DOM)
    
    
    // 4. EventListener function 
    var setupEventListeners = function() {
        // 1. Setup EventListener
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem); 
    
    
        // 2. KeyPress event - on GLOBAL document, not a specific element 
        document.addEventListener("keypress", function(event) {
        
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        
        })
        
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        
        // get month of the year
        document.querySelector(DOM.budgetMonth).addEventListener("change", selectMonth);
        
    }
    
    ////////////////////////////////////////////////////////////////////////
    /////////////// Asynchronous section: getting data from DB ////////////////
    // Retrieve & Display initial data from the DB 
    var getAsyncData = function(month) {
        
        let curMonth = month || "January";
//        console.log(curMonth)
        
        // Get the DB data for a current month
        var getDBData = new Promise((resolve, reject) => {
            let dataArr = db.collection(curMonth).get();
            resolve(dataArr);
        })
        
        // convert raw DB data to an object with keys: description, type, value AND id from the database
        var convertDBData = (response) => {
            let dataArr = [];
//            console.log(response)
            response.docs.forEach(el => {
                let itemObj = {}
//                console.log(el.data());
//                console.log(el.id);
                itemObj = {...el.data(), fireID: el.id};
//                console.log(itemObj)
                dataArr.push(itemObj) // id from Firebase added to an item obj.
            })
//            console.log(dataArr)
            return Promise.resolve(dataArr);
        }

        // transform data item to an object used by budgetController module
        var prepareDBData = function(data) {
            var itemArr = [];

            for (let i of data) {
                var UIItem = {};

                UIItem.type = i.type;
                UIItem.des = i.description;
                UIItem.value = i.value;
                UIItem.fireID = i.fireID;

                itemArr.push(UIItem);
            }
            console.log(itemArr)
            return Promise.resolve(itemArr)
        };

    //    Add the item to the budget controller and to the UI
        var addItem = function(arr) {
            for (let i of arr) {
                // add item to the budget
                let newItem = budgetCtrl.addItem(i.type, i.des, i.value)
                // display items in the UI
                UICtrl.addListItem(newItem, i.type, i.fireID)    
                // update & add item to the budget 
                updateBudget();
                // update percentages 
                updatePercentage();
            }
        };

        getDBData
            .then(convertDBData)
            .then(prepareDBData)
            .then(addItem)

    };
//////////////////////////////////////////////////////////////////////////////
    
    
    // 5. Update budget - separate function, will be needed later
    var updateBudget = function() {
        
        // 5.1 Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 5.2 return the budget
        var budget = budgetCtrl.returnBudget();
        
        // 5.3 Display budget in UI
        UICtrl.displayBudget(budget);
    }
    
    
    // 7 Update percentages 
    var updatePercentage = function() {
        
        // 7.1 Calc percentage
        budgetCtrl.calculatePercentage();
        
        // 7.2 get percentage 
        var percentage = budgetCtrl.getPercentage();
        
        // 7.3 update UI
        UICtrl.displayItemPercentage(percentage);
        
    };
    
    
    // 3. function that fires after "save" btn
    var ctrlAddItem = function(event) {
        var newItem, input;
        
        // 1. Get the filled input data
            input = UICtrl.getInput();
            
//        console.log(input)
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
             // 2. Add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new Item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear fields
            UICtrl.clearFields();

            // These need to be put in a separate function - will be needed by other parts of program
            // 5. Calculate the budget - call separate "updateBudget" function here
            updateBudget();

            // 6. Calc percentages for exp
            updatePercentage();
            
            // 7. Run Firebase init function after new item added
            updateDB(input);
//            console.log(input)
            
        }
    };
    
    
    // 6. Delete item from UI
    var ctrlDeleteItem = function(event) {
        var month = DBCtrl.getMonth();
        console.log("ctrlDeleteItem!!!!", month)
        var itemID1 = event.target.parentElement.parentElement.parentElement.parentElement.id;
//////////////////////////////////////////////////////////
        var fireID = event.target.parentElement.parentElement.parentElement.parentElement.getAttribute("fireid");
        console.log("FIRE ID!!!", fireID)
//////////////////////////////////////////////////////////
        var itemID = itemID1.split("-");
        var type = itemID[0];
        var ID = itemID[1]
        
        // 6.1 Delete item from data structure
        budgetCtrl.deleteData(type, ID);
        
        // 6.2 delete item from UI
        UICtrl.deleteListItem(itemID1)
        
        // 6.3 update and display the budget 
        updateBudget();
        
        // 6.4 update percentage for exp
        updatePercentage();
        
        // Delete item from the fireBase DB
        DBCtrl.deleteSingleDBItem(month, fireID);
    }
    
    
    // Delete all exp & inc items listed in the UI
    var deleteItemListUI = function() {
        
        // remove all items from the UI list
        UICtrl.deleteAllItems();
        
        // reset total inc & exp in the UI
        resetBudgetUI();
        
        // reset all data in data structure        
        budgetCtrl.resetAllData();
        
    }
    
     
    // 7. Update data after Month selected from top dropdown menu (from eventListener)
    var selectMonth = function(event) {
        let e = event.target;
        month = e.options[e.selectedIndex].value;
        
        // reset total inc & exp displayed on top
        deleteItemListUI();
        
        // add month to DB module
        DBCtrl.addMonth(month);
        
        // reset var data from previous month
        DBCtrl.resetData();
        
        // set DB listener to data relevant to the selected month
        DBCtrl.listenToDB();
        
        // retrieve items from DB & display in UI
        getAsyncData(month)
    };

    
/////////////////////////////////////////////////////////////////////////////// 
///////////////////////////////////////////////////////////////////////////////    
    // Update Data Base after adding a new item in UI
    var updateDB = function(input) {
        
        // FIREBASE: pass new item values to the DB module
        DBCtrl.updateNewItem(input);
        
        // push data to DB
        DBCtrl.pushToDB();
        
    };
    
    
    // clear UI total inc & exp fields from available budget top section 
    var resetBudgetUI = function() {
        UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
    }
    
    // 5. init function
    return {
        init: function() {
            resetBudgetUI()
            setupEventListeners();
            DBCtrl.listenToDB();
            getAsyncData()
        },
 
    };
    
    
})(budgetController, UIController, donutChartController);


controller.init(); 





// **********************************************************
// D3 Modules
//***********************************************************

/////////////////// BAR CHART ///////////////////////
var d3BarChart = (function(budgetCtrl, UICtrl) {
    
         var dataPast = [
            
                { "month": "January",
                "exp": 369,
                "inc": 456 },
                { "month": "February",
                "exp": 169,
                "inc": 256 },
                { "month": "March",
                "exp": 209,
                "inc": 656 },
                { "month": "April",
                "exp": 38,
                "inc": 456 },
                { "month": "May",
                "exp": 460,
                "inc": 556 },
                { "month": "June",
                "exp": 569,
                "inc": 856 },
                { "month": "July",
                "exp": 19,
                "inc": 56 },
                { "month": "August",
                "exp": 869,
                "inc": 956 },
                { "month": "September",
                "exp": 269,
                "inc": 556 },
                { "month": "October",
                "exp": 469,
                "inc": 756 },
                { "month": "November",
                "exp": 390,
                "inc": 560 },
                { "month": "December",
                "exp": 261,
                "inc": 356 },
        
        ]

        
    // SVG container
    var canvas = d3.select(".canvas-1")
    var svg = canvas.append("svg")
        .attr("width", 600)
        .attr("height", 400)

    // Graph area
    var graphMargin = {top: 30, right: 50, bottom: 50, left: 40};
    var graphWidth = 600 - graphMargin.right - graphMargin.left;
    var graphHeight = 400 - graphMargin.top - graphMargin.bottom;
    
    // Create graph group
    var graph = svg.append("g")
        .attr("class", "graph")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("transform", `translate(${graphMargin.left}, ${graphMargin.top})`)
    
    
    // SCALE Setup
    var y = d3.scaleLinear()
        .domain([0, d3.max(dataPast, d => d.exp > d.inc ? d.exp : d.inc)])
        .range([ graphHeight, 0]);
    
    var x1 = d3.scaleBand()
        .domain(dataPast.map(d => d.month))
        .range([0, graphWidth])
        .padding(.2);
    
    var x2 = d3.scaleBand()
        .domain(["exp", "inc"])
        .range([0, x1.bandwidth()])
        
    
    // Add Axes
    var xAxisGroup = graph.append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        
    var yAxisGroup = graph.append("g")
        
    var xAxis = d3.axisBottom(x1)
    var yAxis = d3.axisLeft(y)
    
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis)
    
    xAxisGroup
      .selectAll("text")
        .attr("transform", "rotate(-30)")
        .attr("text-anchor", "end")
        .attr("color", "#ccc")
    yAxisGroup
      .selectAll("text")
        .attr("color", "#ccc")
  
    yAxisGroup.selectAll("path")
        .attr("stroke", "#ccc")
    xAxisGroup.selectAll("path")
        .attr("stroke", "#ccc")
  
    yAxisGroup.selectAll("line")
        .attr("stroke", "#ccc")
    xAxisGroup.selectAll("line")
        .attr("stroke", "#ccc")
    
    // add LEGEND
    const legendColor = d3.scaleOrdinal()
        .domain(["Expenses", "Income"])
        .range(["#FF5049", "#28B9B5"])
    
    // Add legend
    const legendGroup = svg.append("g")
        .attr("class", "legend__barChart")
        .attr("transform", `translate(${graphWidth}, 20)`)
    
    const legend = d3.legendColor()
        .scale(legendColor)
    
    legendGroup.call(legend)
    
    
    
    var monthGroup = graph.selectAll(".month")
        .data(dataPast)
    
        .enter()
        .append("g")
        .attr("class", "month")
        .attr("transform", d => `translate(${x1(d.month)}, 0)`)
//        .attr("x", d => x1(d.month)) // WORKS with "rect", but doesn't move "g" 
    
        monthGroup.selectAll("exp")
            .data(d => [d])
            .enter()
            .append("rect")
            .attr("class", "exp")
        .style("fill", "#FF5049")
        .style("opacity", "0.4")
            .attr("width", x2.bandwidth())
            .attr("height", 0)
            .attr("x", x1("exp"))
            .attr("y", graphHeight)   
    
            .transition().duration(1000)
                .attr("height", d => graphHeight - y(d.exp))
                .attr("y", d => y(d.exp))
        
        monthGroup.selectAll("inc")
            .data(d => [d])
            .enter()
            .append("rect")
            .attr("class", "inc")
        .style("fill", "#28B9B5")
        .style("opacity", "0.4")
            .attr("width", x2.bandwidth())
            .attr("height", 0)
            .attr("x", x2("inc"))
            .attr("y", graphHeight)
            
            .transition().duration(1000)
                .attr("height", d => graphHeight - y(d.inc))
                .attr("y", d => y(d.inc))
        
        
        // graph tooltip
        const tip = d3.tip()
            .attr("class", "tooltip")
            .html((d, i) => {
//                console.log(d)
                let content = `<p>${d.month} 2018<br>
                                Expenses: $${d.exp}<br>
                                Income: $${d.inc}</p>`
                return content
            })
        
        graph.call(tip)
    
    
    
    // EventListener Functions
        const barMouseOver = (d, i, n) => {
            d3.select(n[i])
            .transition("barOpacity").duration(200)
                .style("opacity", "1")
        }
        
        const barMouseOut = (d, i, n) => {
            d3.select(n[i])
                .transition("barOpacity").duration(200)
                    .style("opacity", "0.4")
        }
        
    
        graph.selectAll("rect")
            .on("mouseover", function(d,i,n) {
                barMouseOver(d,i,n);
                tip.show(d, n[i])
            })
            .on("mouseout", function(d,i,n) {
                barMouseOut(d,i,n)
                tip.hide()
            })
    
//        var sdf = graph.selectAll("rect");
//  console.log(sdf)
    
})(budgetController, UIController);


////////////////////////////////////////////////////////////
// LINE CHART 
///////////////////////////////////////////////////////////
var d3LineChart = (function(budgetCtrl, UICtrl) {
  const btns = document.querySelectorAll("[class^='btn_']")
  var type = "car";
  var data = [];
  var attrArr = [];
  var lineBool = false;
  
  
  // Callback fn for top btns 
  var toggleClass = function(e) {
    type = e.target.dataset.expense;
    console.log(e.target)
    
    // set css class for btn background color change
    e.target.classList.toggle("active");
    
    // set class to all line elements for particular "type"
    let arr = document.querySelectorAll(`.${type}`)
    arr.forEach(el => el.classList.toggle("active-line"))
  }
  
  // get data-type attr from DOM btns, define var data, setup eventListeners for btns
  btns.forEach(el => {
    attrArr.push(el.getAttribute("data-expense"))
    el.addEventListener("click", toggleClass) 
  })
      

  // D3 graph setup 
  const margin = { top: 30, right: 30, bottom: 50, left: 50 };
  const graphWidth = 600 - margin.left - margin.right;
  const graphHeight = 450 - margin.top - margin.bottom;
  
  const svg = d3.select(".canvas-3")
    .append("svg")
    .attr("width", 520 + margin.right + margin.left)
    .attr("height", 380 + margin.top + margin.bottom)
    
  const graph = svg.append("g")
    .attr("class", "graph-line")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
  
  
  const xScale = d3.scaleLinear()
    .range([0, graphWidth])
  const yScale = d3.scaleLinear()
    .range([graphHeight, 0])

  
  const xAxisGroup = graph.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${graphHeight})`)
  const yAxisGroup = graph.append("g")
    .attr("class", "y-axis")
    
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => `$${d}`)
  
  // Color scheme for graph lines
  const color = d3.scaleOrdinal(d3["schemeSet2"]);
  
  // Line generator scale
  const lineFood = d3.line()
    .curve(d3.curveCardinal)
    .x((d, i) => xScale(i))
    .y(d => yScale(d[type]))
  
  
  
  // UPDATE function
  const update = function(data) {
    
//  Extract number values from data arr (for y-axis range)
    let getValue = (function() {
      var arr = [];
      data.forEach(d => {
        for (let key in d) {
          if (typeof d[key] == "number") {
            arr.push(d[key])
          }
        }
      })
      return arr;
    })();
    
    // set Domains for x, yScale
    xScale.domain([0, data.length - 1]);
    yScale.domain([0, d3.max(getValue, d => d)])
    
    // x axis labels - KOMBINACJA ALPEJSKA!!!!!!!!!!!!
    let tickLabel = data.map(d => d.date + "Qtr");
    xAxis
      .tickFormat((d) => tickLabel[d])
    
    // call xAxis
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);
    
    xAxisGroup.selectAll("text")
      .attr("transform", "rotate(-30)")
      .attr("text-anchor", "end")
      .attr("color", "#ccc")
    yAxisGroup.selectAll("text")
      .attr("color", "#ccc")
    
    
    // Append circles 
    const circles = graph.selectAll("circle")
      .data(data)
    
  // Line generator for each line (each type of expenditure)
  let displayLineGraph = function() {
    circles 
      .enter()
        .append("circle") 
        .attr("class", `circle-${type} line-el ${type}`)
        .attr("type", `${type}`)
        .attr("cx", (d, i) => xScale(i))
        .attr("cy", (d) => yScale(d[type]))
        .attr("r", 4)
        .attr("fill", d => color(type))
        .style("z-index", 20);
      
      graph.append("path")
        .data([data])
        .attr("class", `path-${type} line-el ${type}`)
        .attr("type", `${type}`)
        .attr("fill", "none")
        .attr("stroke", d => color(type))
        .attr("stroke-width", 2)
        .attr("d", d => lineFood(d))
        .style("z-index", 10)
    }
    
    // set var type & run line generator for each type
    for (let i of attrArr) {
      type = i;
      displayLineGraph();
    }
    

    const DOMgraph = document.querySelector(".graph-line");
    var DOMel = [];
    
    const dottedOn = function(d, i, n) {
      let costType = n[i].getAttribute("type")
      DOMel = DOMgraph.querySelectorAll(`circle.${costType}`);

      graph.append("line")
          .attr("class", "dottedLine")
          .attr("x1", 0)
          .attr("y1", yScale(d[`${costType}`]))
          .attr("x2", xScale(i%12))
          .attr("y2", yScale(d[`${costType}`]))
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", ("3, 3"))
          .style("opacity", 1)

        graph.append("line")
          .attr("class", "dottedLine")
          .attr("x1", xScale(i%12))
          .attr("y1", yScale(d[`${costType}`]))
          .attr("x2", xScale(i%12))
          .attr("y2", graphHeight)
          .attr("stroke", "#999")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", ("3, 3"))
          .style("opacity", 1)
    }
    
    const dottedOut = function(d, i, n) {
      graph.selectAll("line.dottedLine")
        .style("opacity", 0)
    }
    
    const circleOn = (d, i, n) => {
      d3.select(n[i])
        .transition().duration(300)
          .attr("r", 6)
    }
    
    const circleOut = (d, i, n) => {
      d3.select(n[i])
        .transition().duration(300)
          .attr("r", 4)
    }

  // EventListener for hover over circles
    graph.selectAll("circle")
      .on("mouseover", (d,i,n) => {
//      console.log(d,i,n)
//      console.log(n[i])
      
      dottedOn(d, i, n);
      circleOn(d, i, n)
      })
      .on("mouseout", (d, i,n) => {
        dottedOut(d,i,n);
        circleOut(d, i, n);
      })
  }
  
  
  const dataCSV = d3.csv("pastData.csv", (d) => {
    d.car = +d.car; 
    d.home = +d.home;
    d.food = +d.food;
    d.entetainment = +d.entertainment;
    d.health = +d.health;
    return d;
  });
  dataCSV.then(data => {
    data = data;
    update(data);
  })
  
  
  
  
})(budgetController, UIController);


