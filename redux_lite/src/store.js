// Looking at solution to solve Mini-Redux since I'm rusty after a month of
// barely any programming in Ruby only
class Store {
	constructor(rootReducer) {
		this.rootReducer = rootReducer;
		this.state = rootReducer({});
		this.subscriptions = [];
		this.getState = this.getState.bind(this);
		this.dispatch = this.dispatch.bind(this);
		this.subscribe = this.subscribe.bind(this);
	}

	// Sends in a copy of the state, so it can't be mutated through this
	// #assign only makes a shallow copy, not a deep one
	getState() {
		return Object.assign({}, this.state);
	}

	dispatch(action) {
		this.state = this.rootReducer(this.state, action, this.subscriptions);
	}

	subscribe(cb) {
		this.subscriptions.push(cb);
	}
}

const createStore = (...args) => new Store(...args);

// Reducers -> Pure Functions that describe how pieces of data will change in
// response to actions (Will not modify args, 2 args, default value for PrevState),
// action ignored == return unmodified, action response == new or new copy
// Actions -> JS objs that represent a change that should be made to the state obj
const combineReducers = config => {
	return (prevState, action, subscriptions) => {
		const nextState = {};
		let stateChanged = false;
		Object.keys(config).forEach(k => {
			if (!action) {
				const args = [, { type: "__initialize" }];
				nextState[k] = config[k](...args);
				stateChanged = true;
			} else {
				const next = config[k](prevState[k], action);
				if (next !== prevState[k]) {
					stateChanged = true;
				}
				nextState[k] = next;
			}
		});

		// Only run callbacks when state actually changes
		if (stateChanged) {
			if (subscriptions) {
				subscriptions.forEach(cb => cb(nextState));
				return nextState;
			}
		}
		return prevState;
	};
};

// Test
// const myNoiseReducer = (prevState = "peace and quiet", action) => {
// 	switch (action.type) {
// 		case "noisy action":
// 			return action.noise;
// 		default:
// 			return prevState;
// 	}
// };

// const myNoisyAction = {
// 	type: "noisy action",
// 	noise: "Car alarm"
// };

// const myInconsequentialAction = {
// 	type: "a type no one cares about",
// 	data: {
// 		thisThing: "will not get used anyway"
// 	}
// };

// const myInitialState = {
// 	noise: "peace and quiet"
// };

// const myRootReducer = combineReducers({
// 	noise: myNoiseReducer,
// });

// let newState = myRootReducer(myInitialState, myInconsequentialAction);
// // => { noise: "peace and quiet" }
// console.log(newState);

// newState = myRootReducer(newState, myNoisyAction)
// // => { noise: "Car alarm" }
// console.log(newState);

// myRootReducer(newState, myInconsequentialAction)
// // => { noise: "Car alarm" }
// console.log(newState);

// define a reducer for user:
// const userReducer = (oldUser = null, action) => {
// 	if (action.type === "new user") {
// 		return action.user;
// 	}
// 	return oldUser;
// };

// // create a rootReducer:
// const rootReducer = combineReducers({
// 	user: userReducer
// });

// // create a store using the rootReducer:
// const store = new Store(rootReducer);

// // get the state:
// store.getState(); // => {}

// // invoke the dispatch function to update the user key:
// const action = {
// 	type: "new user",
// 	user: "Jeffrey Fiddler"
// };

// store.dispatch(action);
// console.log(store.getState()); // => { user: "Jeffrey Fiddler" }

// const actionCreator1 = value => ({
// 	type: "add",
// 	value
// });

// const actionCreator2 = value => ({
// 	type: "subtract",
// 	value
// });

// const actionCreator3 = value => ({
// 	type: "no change",
// 	value
// });

// const numberReducer = (num = 0, action) => {
// 	switch (action.type) {
// 		case "add":
// 			return num + action.value;
// 		case "subtract":
// 			return num - action.value;
// 		default:
// 			return num;
// 	}
// }

// const rootReducer = combineReducers({
// 	number: numberReducer
// });

// const store = new Store(rootReducer);

// store.getState() // => { number: 0 }

// const announceStateChange = nextState => {
// 	console.log(`That action changed the state! Number is now ${nextState.number}`);
// }

// store.subscribe(announceStateChange);

// store.dispatch(actionCreator1(5)); // => "That action changed the state! Number is now 5"
// store.dispatch(actionCreator1(5)); // => "That action changed the state! Number is now 10"
// store.dispatch(actionCreator2(7)); // => "That action changed the state! Number is now 3"
// store.dispatch(actionCreator3(7)); // => Nothing should happen! The reducer doesn't do anything for type "no change"
// store.dispatch(actionCreator1(0)) // => Nothing should happen here either. Even though the reducer checks for the "add" action type, adding 0 to the number won't result in a state change.

// console.log(store.getState()); // => { number: 3 }

// Middleware: code btwn framework receiving request and framework generating response
// Third-party extension point btwn dispatching action and moment it reaches reducer
// Let's get back to this in the future.
