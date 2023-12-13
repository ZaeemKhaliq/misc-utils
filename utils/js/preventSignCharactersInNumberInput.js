function preventSignCharactersInNumberInput(
  event
) {
  if (
    event.code === "NumpadSubtract" ||
    event.code === "Minus" ||
    event.code === "NumpadAdd" ||
    event.code === "Equal"
  ) {
    event.preventDefault();
  }
}