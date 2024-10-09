export async function createMachine(stateMachineDefinition) {
  const machine = {
    value: stateMachineDefinition.initialState,
    transition(currentState, event) {
      const currentStateDefinition = stateMachineDefinition[currentState];
      const destinationTransition = currentStateDefinition.transitions[event];
      if (!destinationTransition) {
        return;
      }
      const destinationState = destinationTransition.target;
      const destinationStateDefinition =
        stateMachineDefinition[destinationState];

      destinationTransition.action();
      currentStateDefinition.actions.onExit();
      destinationStateDefinition.actions.onEnter();

      machine.value = destinationState;

      return machine.value;
    },
  };
  return machine;
}

// let response;

// const machine = createMachine({
//   initialState: "listening",
//   listening: {
//     actions: {
//       onEnter() {
//         console.log("listening: onEnter");
//       },
//       onExit() {
//         console.log("listening: onExit");
//       },
//     },
//     transitions: {
//       leaveConversation: {
//         target: "moving",
//         action() {
//           console.log("ok, bye");
//         },
//       },
//       startTalking: {
//         target: "talking",
//         action() {
//           console.log("I'm listening to you!");
//         },
//       },
//     },
//   },
//   moving: {
//     actions: {
//       onEnter() {
//         console.log("I'm moving now...");
//       },
//       onExit() {
//         console.log("I'm going to stop moving");
//       },
//     },
//     transitions: {
//       enterConversation: {
//         target: "listening",
//         action() {
//           console.log(
//             'transition action for "enterConversation" in "moving" state'
//           );
//         },
//       },
//     },
//   },
//   talking: {
//     actions: {
//       onEnter() {
//         console.log("I'm going to start talking");
//       },
//       onExit() {
//         console.log("I'm going to stop talking");
//       },
//     },
//     transitions: {
//       stopTalking: {
//         target: "listening",
//         action() {
//           console.log(`Here's what you said: ${response}`);
//         },
//       },
//     },
//   },
// });

// let state = machine.value;
// console.log(`current state: ${state}`);
// state = machine.transition(state, "startTalking");
// if (state === "talking") {
//   response = prompt("What do you want to say?");
// }
// console.log(`current state: ${state}`);
// state = machine.transition(state, "stopTalking");
// console.log(`current state: ${state}`);
// state = machine.transition(state, "leaveConversation");
// console.log(`current state: ${state}`);
// state = machine.transition(state, "enterConversation");
// console.log(`current state: ${state}`);
