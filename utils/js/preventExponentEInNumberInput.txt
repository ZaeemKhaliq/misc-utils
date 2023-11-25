function preventExponentEInNumberInput(event) {
  if (event.code === "KeyE") {
    event.preventDefault();
  }
}