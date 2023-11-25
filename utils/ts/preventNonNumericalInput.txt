function preventNonNumericalInput(
  e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>
) {
  e = e || window.event;

  const keyValue = e.key;

  if (
    !keyValue.match(/^[0-9]*\.?[0-9]*$/) &&
    ![
      "Backspace",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
    ].includes(keyValue) &&
    !e.ctrlKey
  )
    e.preventDefault();
}
