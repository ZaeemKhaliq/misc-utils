function preventSignCharactersInNumberInput(
  event: React.KeyboardEvent<HTMLDivElement>
): void {
  if (
    event.code === "NumpadSubtract" ||
    event.code === "Minus" ||
    event.code === "NumpadAdd" ||
    event.code === "Equal"
  ) {
    event.preventDefault();
  }
}