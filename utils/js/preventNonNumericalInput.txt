function preventNonNumericalInput(
  e
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
