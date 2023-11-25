function preventExponentEInNumberInput(event: React.KeyboardEvent<HTMLDivElement>): void {
  if (event.code === "KeyE") {
    event.preventDefault();
  }
}