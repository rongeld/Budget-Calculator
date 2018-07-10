// Storage Controller
const StorageController = (function () {

	return {
		storeItems: function (item) {
			let items = {
				allItems: {
					exp: [],
					inc: []
				},
				totals: {
					exp: 0,
					inc: 0
				},
				budget: 0,
				percentage: -1
			};

			if (localStorage.getItem('items-budgety') === null) {
				if (item.type === 'exp') {
					items.allItems.exp.push(item);
				} else if (item.type === 'inc') {
					items.allItems.inc.push(item);
				}
				localStorage.setItem('items-budgety', JSON.stringify(items));
			} else {
				items = JSON.parse(localStorage.getItem('items-budgety'));
				if (item.type === 'exp') {
					items.allItems.exp.push(item);
				} else if (item.type === 'inc') {
					items.allItems.inc.push(item);
				}
				localStorage.setItem('items-budgety', JSON.stringify(items));
			}
		},
		getItemsFromStorage: function () {
			let items
			if (localStorage.getItem('items-budgety') === null) {
				items = {
					allItems: {
						exp: [],
						inc: []
					},
					totals: {
						exp: 0,
						inc: 0
					},
					budget: 0,
					percentage: -1
				};
			} else {
				items = JSON.parse(localStorage.getItem('items-budgety'));
			}
			return items;
		},
		deleteFromLocalStorage: function(type, id) {
			let items = JSON.parse(localStorage.getItem('items-budgety'));

			const ids = items.allItems[type].map(item => {
				return item.id
			});

			const index = ids.indexOf(id);

			if (index !== -1) {
				items.allItems[type].splice(index, 1);
			}

			localStorage.setItem('items-budgety', JSON.stringify(items));
		}
	}

})();



// Budget controller
const budgetController = (function () {

	const Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	const Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	const calculateTotal = function (type) {
		let sum = 0;

		data.allItems[type].forEach(item => {
			sum += item.value;
		})

		data.totals[type] = sum;
	};

	const data = StorageController.getItemsFromStorage();

	return {
		addItem: function (type, description, value) {
			let newItem, ID;

			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			if (type === "exp") {
				newItem = new Expense(ID, description, value);
			} else if (type === "inc") {
				newItem = new Income(ID, description, value);
			}

			data.allItems[type].push(newItem);

			console.log(data);

			return newItem;
		},
		getItems: function () {
			return data.items;
		},
		calculateBudget: function () {
			// Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// Calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			if (data.totals.inc > 0) {
				// Calculate the percentage ofincome that we spent
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		deteleItem: function (type, id) {
			const ids = data.allItems[type].map(item => {
				return item.id
			});

			const index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		}
	};
})();

// UI controller
const UIController = (function () {
	const UISelectors = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgeLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	return {
		getUISelectors: function () {
			return UISelectors;
		},
		getItemInput: function () {
			return {
				type: document.querySelector(UISelectors.inputType).value,
				description: document.querySelector(UISelectors.inputDescription).value,
				value: parseFloat(document.querySelector(UISelectors.inputValue).value)
			};
		},
		addListItem: function (obj, type) {
			let html, element;

			if (type === "inc") {
				element = UISelectors.incomeContainer;
				html =
					`<div class="item clearfix" id="inc-${obj.id}">
						<div class="item__description">${obj.description}</div>
						<div class="right clearfix">
				 			<div class="item__value">+ ${obj.value} PLN</div>
				 			<div class="item__delete">
					  			<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
				 			</div>
						</div>
	  				</div>`;
			} else if (type === "exp") {
				element = UISelectors.expensesContainer;
				html =
					`<div class="item clearfix" id="exp-${obj.id}">
			<div class="item__description">${obj.description}</div>
			<div class="right clearfix">
				 <div class="item__value">- ${obj.value} PLN</div>
			
				 <div class="item__delete">
					  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
				 </div>
			</div>
	  </div>`
			}

			document.querySelector(element).insertAdjacentHTML('beforeend', html);


		},
		populateItems: function (arr) {
			let income = '', expenses = '';

			if(!arr) {
				return false;
			}

			arr.allItems.inc.forEach(obj => {
				if (obj.type === 'inc') {
					income += `<div class="item clearfix" id="inc-${obj.id}">
          <div class="item__description">${obj.description}</div>
          <div class="right clearfix">
             <div class="item__value">+ ${obj.value} PLN</div>
             <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
             </div>
          </div>
          </div>`
				}
			})

			arr.allItems.exp.forEach(obj => {
				if (obj.type === 'exp') {
					expenses += `<div class="item clearfix" id="exp-${obj.id}">
				 <div class="item__description">${obj.description}</div>
				 <div class="right clearfix">
					 <div class="item__value">- ${obj.value} PLN</div>
					
					 <div class="item__delete">
						 <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
					 </div>
				 </div>
			  </div>`
				}
			})

			document.querySelector(UISelectors.incomeContainer).insertAdjacentHTML('beforeend', income);
			document.querySelector(UISelectors.expensesContainer).insertAdjacentHTML('beforeend', expenses);

			console.log(arr);
			

		},
		clearInputs: function () {
			document.querySelector(UISelectors.inputDescription).value = '';
			document.querySelector(UISelectors.inputValue).value = '';
		},

		deleteListItem: function (id) {
			const el = document.getElementById(id);
			el.parentElement.removeChild(el);
		},

		displayBudget: function (obj) {

			document.querySelector(UISelectors.budgeLabel).textContent = obj.budget + 'PLN';
			document.querySelector(UISelectors.incomeLabel).textContent = '+ ' + obj.totalInc + 'PLN';
			document.querySelector(UISelectors.expensesLabel).textContent = '- ' + obj.totalExp + 'PLN';


			if (obj.percentage > 0) {
				document.querySelector(UISelectors.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(UISelectors.percentageLabel).textContent = '---';
			}

		},
		displayPercentages: function (percentages) {

			let fields = document.querySelectorAll(UISelectors.expensesPercLabel);

			const nodeListForEach = function (list, callback) {
				for (let i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			}

			nodeListForEach(fields, function (current, index) {

				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			})
		},
		displayMonth: function () {
			const date = new Date();

			const monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];

			const year = date.getFullYear();
			const month = date.getMonth()
			document.querySelector(UISelectors.dateLabel).textContent = monthNames[month] + ' ' + year;
		}
	};
})();

//  Controller
const controller = (function (UICtrl, StorageController, budgetCtrl) {


	const setupEventListeners = function () {
		const DOM = UICtrl.getUISelectors();
		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

		document.addEventListener("keypress", function (e) {
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	};


	const updateBudget = function () {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		// 2. Return the budget
		const budget = budgetCtrl.getBudget();
		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	const ctrlAddItem = function () {


		// 1. Get the filed input data
		const ItemInputs = UICtrl.getItemInput();

		if (!ItemInputs.description || !ItemInputs.value || ItemInputs.value == 0) {
			return false;
		}

		// 2. Add the item to the budget ctrl
		const input = budgetCtrl.addItem(
			ItemInputs.type,
			ItemInputs.description,
			ItemInputs.value
		);

		// 3. Add the item to the UI
		UICtrl.addListItem(input, ItemInputs.type);

		const newObj = {
			...input,
			type: ItemInputs.type
		}

		// Store in localStorage
		StorageController.storeItems(newObj);
		StorageController.getItemsFromStorage();



		//  4. Clear the fields
		UICtrl.clearInputs();

		//  5. Calculate and update budget
		updateBudget();


		console.log(budgetController.getItems());


	};

	const ctrlDeleteItem = function (e) {
		let itemID, splitID, type, ID;

		itemID = e.target.parentElement.parentElement.parentElement.parentElement.id;

		if (itemID) {

			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			budgetCtrl.deteleItem(type, ID);

		}

		StorageController.deleteFromLocalStorage(type, ID);

		UICtrl.deleteListItem(itemID);

		updateBudget();

	};

	return {
		init: function () {
			setupEventListeners();
			UICtrl.displayMonth();
			UICtrl.populateItems(StorageController.getItemsFromStorage());
			updateBudget();
		}
	};
})(UIController, StorageController, budgetController);

controller.init();


particlesJS("particles-js", {
	"particles": {
		"number": {
			"value": 77,
			"density": {
				"enable": true,
				"value_area": 962.0472365193136
			}
		},
		"color": {
			"value": "#ffffff"
		},
		"shape": {
			"type": "circle",
			"stroke": {
				"width": 0,
				"color": "#000000"
			},
			"polygon": {
				"nb_sides": 4
			},
			"image": {
				"src": "img/github.svg",
				"width": 100,
				"height": 100
			}
		},
		"opacity": {
			"value": 0.15232414578222467,
			"random": false,
			"anim": {
				"enable": false,
				"speed": 1,
				"opacity_min": 0.1,
				"sync": false
			}
		},
		"size": {
			"value": 4.008530152163807,
			"random": true,
			"anim": {
				"enable": false,
				"speed": 40,
				"size_min": 0.1,
				"sync": false
			}
		},
		"line_linked": {
			"enable": true,
			"distance": 160.3412060865523,
			"color": "#ffffff",
			"opacity": 0.4,
			"width": 0.8017060304327615
		},
		"move": {
			"enable": true,
			"speed": 3,
			"direction": "none",
			"random": false,
			"straight": false,
			"out_mode": "out",
			"bounce": false,
			"attract": {
				"enable": false,
				"rotateX": 641.3648243462092,
				"rotateY": 1200
			}
		}
	},
	"interactivity": {
		"detect_on": "canvas",
		"events": {
			"onhover": {
				"enable": true,
				"mode": "grab"
			},
			"onclick": {
				"enable": true,
				"mode": "repulse"
			},
			"resize": true
		},
		"modes": {
			"grab": {
				"distance": 155.84415584415586,
				"line_linked": {
					"opacity": 1
				}
			},
			"bubble": {
				"distance": 923.0769230769231,
				"size": 40,
				"duration": 2,
				"opacity": 8,
				"speed": 3
			},
			"repulse": {
				"distance": 200,
				"duration": 0.4
			},
			"push": {
				"particles_nb": 4
			},
			"remove": {
				"particles_nb": 2
			}
		}
	},
	"retina_detect": true
});
var count_particles, stats, update;

count_particles = document.querySelector('.js-count-particles');
update = function () {
	
	requestAnimationFrame(update);
};
requestAnimationFrame(update);;
