import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ClickAwayListener, Popper } from "@mui/base";
import {
  Close,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
} from "@mui/icons-material";
import {
  Box,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  Typography,
  styled,
} from "@mui/joy";

import { CalendarIcon } from "~/global/icons";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const monthsWith31 = [1, 3, 5, 7, 8, 10, 12];
const monthsWith30 = [4, 6, 9, 11];
const datesFlagsMatrixInitState = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];
const datesValuesMatrixInitState = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];
const yearsSelectionMatrixInitState = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

function leapYear(yearToCheck: number) {
  return (
    (yearToCheck % 4 == 0 && yearToCheck % 100 != 0) || yearToCheck % 400 == 0
  );
}

type CDatePickerProps = {
  value?: Date;
  minValue?: Date;
  onChange?: (newDate: Date, isSameDate?: boolean) => void;
};
export default function CDatePicker(props: CDatePickerProps) {
  const { value, minValue, onChange } = props;

  const tempDayValue = useRef<string | null>(null);
  const tempMonthValue = useRef<string | null>(null);
  const tempYearValue = useRef<string | null>(null);
  const pickerContainerRef = useRef<null | HTMLDivElement>(null);
  const dateInputRef = useRef<null | HTMLInputElement>(null);

  const [initValue, setInitValue] = useState<Date>(
    value || minValue || new Date()
  );

  const initYear = initValue.getFullYear();
  const initMonth = initValue.getMonth() + 1;
  const minValueYear = minValue?.getFullYear?.();
  const minValueMonth = minValue ? minValue?.getMonth() + 1 : undefined;
  const minValueDay = minValue?.getDate?.();

  const [year, setYear] = useState<number>(initYear);
  const [month, setMonth] = useState<number>(initMonth);
  const startDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInCurrentMonth = new Date(year, month, 0).getDate();
  const currentDate = initValue.getDate();
  console.log("%cc-date-picker:", "background-color:crimson;color:white;", {
    props,
    value,
    minValue,
    startDayOfMonth,
    daysInCurrentMonth,
    year,
    month,
    currentDate,
  });

  useEffect(() => {
    setYear(initValue.getFullYear());
    setMonth(initValue.getMonth() + 1);
  }, [initValue]);
  useEffect(() => {
    if (value) {
      setYear(value.getFullYear());
      setMonth(value.getMonth() + 1);
    }
  }, [value]);
  useEffect(() => {
    if (minValue) {
      if (initValue.getTime() < minValue?.getTime()) {
        setInitValue(minValue);

        onChange?.(minValue);

        if (dateInputRef.current) {
          dateInputRef.current.value = `${minValueMonth?.toLocaleString(
            undefined,
            {
              minimumIntegerDigits: 2,
            }
          )}/${minValueDay?.toLocaleString(undefined, {
            minimumIntegerDigits: 2,
          })}/${minValueYear?.toLocaleString(undefined, {
            minimumIntegerDigits: 4,
            useGrouping: false,
          })}`;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initValue, minValue, minValueDay, minValueMonth, minValueYear]);

  const [yearsSelectionMatrix, setYearsSelectionMatrix] = useState<number[][]>(
    yearsSelectionMatrixInitState
  );
  const [currentYearVector, setCurrentYearVector] = useState<number[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState<boolean>(false);

  const datesFlagsMatrix: number[][] = (() => {
    // Flags lexicon
    // 0 -> Date disabled for selection
    // 1 -> Date enabled for selection
    // 2 -> Selected Date

    let daysAdded = 0;
    const prev = structuredClone(datesFlagsMatrixInitState);

    for (let i = 0; i < prev.length; i += 1) {
      const row = prev[i];

      for (let j = 0; j < row.length; j += 1) {
        const sum = i + j + 1;
        if (sum === startDayOfMonth && i === 0) {
          for (let k = sum - 2; k >= 0; k--) {
            prev[i][k] = 0;
          }
        }

        if (
          (sum >= startDayOfMonth || i > 0) &&
          daysAdded <= daysInCurrentMonth
        ) {
          const isYearLessThanMin = minValueYear ? year < minValueYear : false;
          const isMonthLessThanMin = minValueMonth
            ? month < minValueMonth
            : false;
          const isDayLessThanMin =
            (minValueYear ? year <= minValueYear : false) &&
            (minValueMonth ? month <= minValueMonth : false) &&
            minValueDay
              ? daysAdded < minValueDay - 1
              : false;

          // console.log("%clogs:", "background-color:deeppink;color:white;", {
          //   minValueYear,
          //   minValueMonth,
          //   minValueDay,
          //   isYearLessThanMin,
          //   isMonthLessThanMin,
          //   isDayLessThanMin,
          //   month,
          //   year,
          // });

          daysAdded += 1;

          if (!isYearLessThanMin && !isMonthLessThanMin && !isDayLessThanMin) {
            prev[i][j] = 1;
            if (daysAdded === currentDate && month === initMonth) {
              prev[i][j] = 2;
            }
          }
        }

        if (daysAdded > daysInCurrentMonth) {
          prev[i][j] = 0;
        }
      }
    }

    return prev;
  })();
  const dateValuesMatrix: number[][] = (() => {
    let daysAdded = 0;
    let datesAfterLastDateOfCurrentMonth = 1;
    const dateValuesMatrixLocal = structuredClone(datesValuesMatrixInitState);

    for (let i = 0; i < dateValuesMatrixLocal.length; i += 1) {
      const row = dateValuesMatrixLocal[i];

      for (let j = 0; j < row.length; j += 1) {
        const sum = i + j + 1;

        if (sum === startDayOfMonth && i === 0) {
          const previousMonth = month - 1;
          let previousMonthLastDate = new Date(
            year,
            previousMonth,
            0
          ).getDate();
          for (let k = sum - 2; k >= 0; k--) {
            dateValuesMatrixLocal[i][k] = previousMonthLastDate;
            previousMonthLastDate -= 1;
          }
        }

        if (
          (sum >= startDayOfMonth || i > 0) &&
          daysAdded <= daysInCurrentMonth
        ) {
          daysAdded += 1;
          dateValuesMatrixLocal[i][j] = daysAdded;
        }

        if (daysAdded > daysInCurrentMonth) {
          dateValuesMatrixLocal[i][j] = datesAfterLastDateOfCurrentMonth;
          datesAfterLastDateOfCurrentMonth += 1;
        }
      }
    }
    return dateValuesMatrixLocal;
  })();
  console.log({
    datesFlagsMatrix,
    dateValuesMatrix,
    yearsSelectionMatrix,
    currentYearVector,
  });

  const computeYearsSelectionMatrixFromVector = (yearsArr: number[]) => {
    const yearsGrid = [yearsArr];

    for (let i = 0; i <= 1; i++) {
      const newYearsArr = [];
      for (let j = 1; j <= yearsArr.length; j++) {
        if (i === 0) {
          newYearsArr.push(yearsArr[0] - j);
        }
        if (i === 1) {
          newYearsArr.push(yearsArr[yearsArr.length - 1] + j);
        }
      }

      if (i === 0) {
        newYearsArr.reverse();
        yearsGrid.unshift(newYearsArr);
      }
      if (i === 1) {
        yearsGrid.push(newYearsArr);
      }
    }

    setYearsSelectionMatrix(yearsGrid);
  };

  const yearsSelectionMatrixRowLength = yearsSelectionMatrix[0].length;
  useEffect(() => {
    const yearsArr = [];
    yearsArr.push(year);

    if (leapYear(year)) {
      const yearsArrLength = yearsArr.length;
      for (
        let i = 1;
        i <= yearsSelectionMatrixRowLength - yearsArrLength;
        i += 1
      ) {
        yearsArr.unshift(year + i);
      }
    } else {
      let previousYear = year - 1;
      yearsArr.push(previousYear);
      if (leapYear(previousYear)) {
        const yearsArrLength = yearsArr.length;

        for (
          let i = 1;
          i <= yearsSelectionMatrixRowLength - yearsArrLength;
          i += 1
        ) {
          yearsArr.unshift(year + i);
        }
      } else {
        previousYear = year - 2;
        yearsArr.push(previousYear);

        if (leapYear(previousYear)) {
          const yearsArrLength = yearsArr.length;

          for (
            let i = 1;
            i <= yearsSelectionMatrixRowLength - yearsArrLength;
            i += 1
          ) {
            yearsArr.unshift(year + i);
          }
        } else {
          previousYear = year - 3;
          yearsArr.push(previousYear);
        }
      }
    }
    yearsArr.reverse();

    setCurrentYearVector(yearsArr);
    computeYearsSelectionMatrixFromVector(yearsArr);
  }, [year, yearsSelectionMatrixRowLength]);

  const yearsSelectionMatrixAllElemsLength = yearsSelectionMatrix.flat().length;
  const computeNextYearsSelectionMatrix = (type: "inc" | "dec") => {
    const cloned = structuredClone(yearsSelectionMatrix);

    for (let rowIndex = 0; rowIndex < cloned.length; rowIndex += 1) {
      const row = cloned[rowIndex];

      for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
        if (type === "inc") {
          cloned[rowIndex][colIndex] += yearsSelectionMatrixAllElemsLength;
        } else {
          cloned[rowIndex][colIndex] -= yearsSelectionMatrixAllElemsLength;
        }
      }
    }

    setYearsSelectionMatrix(cloned);
  };

  //   useEffect(() => {
  // setDatesFlagsMatrix(prev => {
  //   let daysAdded = 0;
  //   let datesAfterLastDateOfCurrentMonth = 1;
  //   const dateValuesMatrixLocal = structuredClone(dateValuesMatrix);
  //   for (let i = 0; i < prev.length; i += 1) {
  //     const row = prev[i];
  //     for (let j = 0; j < row.length; j += 1) {
  //       const sum = i + j + 1;
  //       if (sum === startDayOfMonth && i === 0) {
  //         const previousMonth = month - 1;
  //         let previousMonthLastDate = new Date(
  //           year,
  //           previousMonth,
  //           0
  //         ).getDate();
  //         for (let k = sum - 2; k >= 0; k--) {
  //           dateValuesMatrixLocal[i][k] = previousMonthLastDate;
  //           prev[i][k] = 0;
  //           previousMonthLastDate -= 1;
  //         }
  //       }
  //       if (
  //         (sum >= startDayOfMonth || i > 0) &&
  //         daysAdded <= daysInCurrentMonth
  //       ) {
  //         prev[i][j] = 1;
  //         daysAdded += 1;
  //         if (daysAdded === currentDate) {
  //           prev[i][j] = 2;
  //         }
  //         dateValuesMatrixLocal[i][j] = daysAdded;
  //       }
  //       if (daysAdded > daysInCurrentMonth) {
  //         dateValuesMatrixLocal[i][j] = datesAfterLastDateOfCurrentMonth;
  //         datesAfterLastDateOfCurrentMonth += 1;
  //         prev[i][j] = 0;
  //       }
  //     }
  //   }
  //   setDateValuesMatrix(dateValuesMatrixLocal);
  //   return prev;
  // });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [currentDate, daysInCurrentMonth, month, startDayOfMonth, year]);

  const onYearMonthClick = () => {
    setIsYearSelectorOpen(true);

    computeYearsSelectionMatrixFromVector(currentYearVector);
  };

  const onPreviousClick = () => {
    const newMonthValue = month - 1;
    if (newMonthValue === 0) {
      setMonth(12);
      setYear((prev) => prev - 1);
      return;
    }

    setMonth(newMonthValue);
  };
  const onNextClick = () => {
    const newMonthValue = month + 1;
    if (newMonthValue === 13) {
      setMonth(1);
      setYear((prev) => prev + 1);
      return;
    }

    setMonth(newMonthValue);
  };

  // const dropDownRef = useRef(null);

  // const closeDialog = (event: MouseEvent) => {
  //   if (!event.target.contains(dropdownRef.current)) return;

  //   dropdown.close;
  // };

  // document.addEventListener("click", closeDialog());

  // Close on outside click logic
  // const dropDownRef = useRef<HTMLElement | null>(null);
  // const isInitialLoad = useRef(true);
  // useEffect(() => {
  //   function onClick(e: MouseEvent) {
  //     if (isInitialLoad.current) {
  //       isInitialLoad.current = false;
  //       return;
  //     }

  //     const target = e?.target as HTMLElement;
  //     console.log("onClick called:", e);
  //     if (
  //       !dropDownRef?.current?.contains(target) &&
  //       //@ts-ignore
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  //       !target?.classList?.contains("year-selector-year")
  //     ) {
  //       setIsCalendarOpen(false);
  //       isInitialLoad.current = true;
  //     }
  //   }

  //   if (isCalendarOpen) {
  //     window.addEventListener("click", onClick);
  //   }

  //   return () => {
  //     if (isCalendarOpen) {
  //       window.removeEventListener("click", onClick);
  //     }
  //   };
  // }, [isCalendarOpen]);

  const onDateInputClick = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    // console.log("%conClick e:", "background-color:blue;color:white", {
    //   e,
    // });

    const targetNode = e.target as HTMLInputElement;
    if (!targetNode.value) {
      targetNode.value = "MM/DD/YYYY";
    }
    tempDayValue.current = null;
    tempMonthValue.current = null;
    tempYearValue.current = null;

    const startIndex = targetNode.selectionStart || 0;
    if (startIndex <= 2) {
      targetNode.setSelectionRange(0, 0);
      targetNode.setSelectionRange(0, 2);
    } else if (startIndex > 2 && startIndex <= 5) {
      targetNode.setSelectionRange(0, 0);
      targetNode.setSelectionRange(3, 5);
    } else {
      targetNode.setSelectionRange(0, 0);
      targetNode.setSelectionRange(6, 10);
    }
  };

  const onDateInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
      e.preventDefault();
    }

    const targetNode = e.target as HTMLInputElement;
    const selectionStart = targetNode.selectionStart;
    if (e.key === "ArrowLeft") {
      if (selectionStart === 6) {
        targetNode.setSelectionRange(3, 5);
      } else {
        targetNode.setSelectionRange(0, 2);
      }
    }
    if (e.key === "ArrowRight") {
      if (selectionStart === 0) {
        targetNode.setSelectionRange(3, 5);
      } else {
        targetNode.setSelectionRange(6, 10);
      }
    }
  };

  const onDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log("%conChange e:", "background-color:purple;color:white", e);

    const targetNode = e.target as HTMLInputElement;
    const inputValue = targetNode?.value;

    const splitted = inputValue?.split("/");

    const startIndex = targetNode.selectionStart || 0;
    if (startIndex <= 2) {
      const monthPart = splitted[0];
      let inNumber = Number(monthPart).toLocaleString(undefined, {
        minimumIntegerDigits: 2,
      });

      const checkIfDayIsOutOfRange = (monthPartInNumber: number) => {
        const dayPart = splitted[1];

        if (!dayPart.includes("D")) {
          const yearPart = splitted[2];
          const yearPartInNumber = Number(yearPart);
          const isLeapYear = leapYear(yearPartInNumber);
          const upperBound = !Number.isInteger(monthPartInNumber)
            ? 31
            : monthsWith31.includes(monthPartInNumber)
            ? 31
            : monthsWith30.includes(monthPartInNumber)
            ? 30
            : isLeapYear
            ? 29
            : 28;

          const dayInNumber = Number(dayPart);

          if (dayInNumber > upperBound) {
            splitted[1] = `${upperBound}`;
          }
        }
      };

      if (tempDayValue.current != null) {
        const monthPartOfTempDate = tempDayValue.current;
        const parsed = Number(`${inNumber}`);
        let newValue: string | number = monthPartOfTempDate + `${parsed}`;
        newValue = Number(newValue);
        if (newValue > 12) {
          newValue = 12;
        }
        splitted[0] = `${newValue}`;

        checkIfDayIsOutOfRange(newValue);

        const finalValue = splitted.join("/");
        targetNode.value = finalValue;

        tempDayValue.current = null;

        inNumber = finalValue;
      } else {
        if (Number(inNumber) > 12) {
          inNumber = "12";
        } else if (Number(inNumber) <= 0) {
          inNumber = "01";
        }
        splitted[0] = inNumber;

        checkIfDayIsOutOfRange(Number(inNumber));

        const finalValue = splitted.join("/");
        targetNode.value = finalValue;

        tempDayValue.current = inNumber;
      }

      if (Number(inNumber) === 1) {
        targetNode.setSelectionRange(0, 0);
        targetNode.setSelectionRange(0, 2);
      } else {
        tempDayValue.current = null;
        targetNode.setSelectionRange(3, 5);
      }
    }
    // Second
    else if (startIndex > 2 && startIndex <= 5) {
      const dayPart = splitted[1];
      let inNumber = Number(dayPart).toLocaleString(undefined, {
        minimumIntegerDigits: 2,
      });

      if (tempMonthValue.current != null) {
        const dayPartOfTempDate = tempMonthValue.current;

        if (Number.isInteger(Number(dayPartOfTempDate))) {
          const parsed = Number(`${inNumber}`);
          let newValue: string | number = dayPartOfTempDate + `${parsed}`;
          newValue = Number(newValue);

          const monthPart = splitted[0];
          const yearPart = splitted[2];
          const monthPartInNumber = Number(monthPart);
          const yearPartInNumber = Number(yearPart);
          const isLeapYear = leapYear(yearPartInNumber);
          const upperBound = !Number.isInteger(monthPartInNumber)
            ? 31
            : monthsWith31.includes(monthPartInNumber)
            ? 31
            : monthsWith30.includes(monthPartInNumber)
            ? 30
            : isLeapYear
            ? 29
            : 28;
          if (newValue > upperBound) {
            newValue = upperBound;
          } else if (newValue <= 0) {
            newValue = 1;
          }
          splitted[1] = `${newValue}`;

          const finalValue = splitted.join("/");
          targetNode.value = finalValue;
          tempMonthValue.current = null;

          targetNode.setSelectionRange(0, 0);
          targetNode.setSelectionRange(6, 10);

          return;
        }
      }

      if (Number(inNumber) <= 0) {
        inNumber = "01";
      }
      splitted[1] = inNumber;
      const finalValue = splitted.join("/");

      targetNode.value = finalValue;
      tempMonthValue.current = inNumber;

      targetNode.setSelectionRange(3, 5);
    }
    // Third
    else {
      const yearPart = splitted[2];
      let inNumber = Number(yearPart).toLocaleString(undefined, {
        minimumIntegerDigits: 4,
        useGrouping: false,
      });

      const checkIfDayIsOutOfRange = () => {
        const dayPart = splitted[1];
        const monthPart = splitted[2];

        if (
          !dayPart.includes("D") &&
          !monthPart.includes("M") &&
          Number(monthPart) === 2 &&
          Number(dayPart) === 29
        ) {
          const yearPartInNumber = Number(yearPart);
          const isLeapYear = leapYear(yearPartInNumber);
          const upperBound = isLeapYear ? 29 : 28;

          const dayInNumber = Number(dayPart);

          if (dayInNumber > upperBound) {
            splitted[1] = `${upperBound}`;
          }
        }
      };

      if (tempYearValue.current != null) {
        const yearPartOfTempDate = tempYearValue.current;

        if (Number.isInteger(Number(yearPartOfTempDate))) {
          const parsed = Number(`${inNumber}`);
          let newValue: string | number = yearPartOfTempDate + `${parsed}`;
          newValue = Number(newValue).toLocaleString(undefined, {
            minimumIntegerDigits: 4,
            useGrouping: false,
          });
          if (Number(newValue) > 9999) {
            newValue = 9999;
          }

          splitted[2] = `${newValue}`;

          checkIfDayIsOutOfRange();

          const finalValue = splitted.join("/");
          targetNode.value = finalValue;

          if (Number(newValue) > 999) {
            tempYearValue.current = null;
          } else {
            tempYearValue.current = String(newValue);
          }

          targetNode.setSelectionRange(0, 0);
          targetNode.setSelectionRange(6, 10);

          return;
        }
      }

      if (Number(inNumber) <= 0) {
        inNumber = "0001";
      }
      splitted[2] = inNumber;

      checkIfDayIsOutOfRange();

      const finalValue = splitted.join("/");

      targetNode.value = finalValue;
      tempYearValue.current = inNumber;

      targetNode.setSelectionRange(6, 10);
    }
  };

  const onDateInputBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    // console.log("%conBlur e", "background-color:pink;", {
    //   e,
    // });

    const targetNode = e.target as HTMLInputElement;
    const inputValue = targetNode?.value;

    if (
      inputValue?.includes("D") ||
      inputValue?.includes("M") ||
      inputValue?.includes("Y")
    ) {
      if (inputValue === "MM/DD/YYYY") {
        e.target.value = "";
      }
      return;
    }

    // console.log("%ci should be called", "background-color:pink;", {
    //   initValue,
    //   inputValue: new Date(inputValue),
    // });
    if (initValue.toISOString() === new Date(inputValue).toISOString()) return;

    setInitValue(new Date(inputValue));
    onChange?.(new Date(inputValue));
  };

  const onCalendarIconClick = () => {
    setIsCalendarOpen((prev) => {
      const newValue = !prev;
      if (newValue === false) {
        setYear(initYear);
        setMonth(initMonth);
      }
      console.log(newValue);
      return newValue;
    });

    // setTimeout(() => {
    //   const bounds =
    //     pickerContainerRef.current?.getBoundingClientRect();
    //   console.log({ bounds });
    //   if (dropDownRef.current) {
    //     dropDownRef.current.style.left = `${bounds.left}px`;
    //     dropDownRef.current.style.top = `${bounds.top}px`;
    //   }
    // }, 0);
  };

  return (
    <CDatePickerStyled className="c-date-picker">
      <div
        style={{ position: "relative" }}
        className="date-input-container"
        ref={pickerContainerRef}
      >
        <input
          type="text"
          placeholder="MM/DD/YYYY"
          ref={dateInputRef}
          className="date-input"
          defaultValue={
            value
              ? `${month.toLocaleString(undefined, {
                  minimumIntegerDigits: 2,
                })}/${currentDate.toLocaleString(undefined, {
                  minimumIntegerDigits: 2,
                })}/${year.toLocaleString(undefined, {
                  minimumIntegerDigits: 4,
                  useGrouping: false,
                })}`
              : ""
          }
          onClick={onDateInputClick}
          onKeyDown={onDateInputKeyDown}
          onChange={onDateInputChange}
          onBlur={onDateInputBlur}
        />

        <CalendarIcon className="calendar-icon" onClick={onCalendarIconClick} />

        <PopperStyled
          open={isCalendarOpen}
          anchorEl={pickerContainerRef.current}
        >
          <ClickAwayListener
            onClickAway={(event) => {
              if (event.target !== pickerContainerRef.current) {
                setIsCalendarOpen(false);
              }
            }}
          >
            <Box>
              {isYearSelectorOpen && (
                <Box className="year-selector">
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton onClick={() => setIsYearSelectorOpen(false)}>
                      <Close sx={{ cursor: "pointer", fontSize: "1.5rem" }} />
                    </IconButton>
                  </Box>
                  <Box className="year-selector-grid-container">
                    <IconButton>
                      <KeyboardArrowUp
                        sx={{ fontSize: "2.5rem", cursor: "pointer" }}
                        onClick={() => {
                          computeNextYearsSelectionMatrix("dec");
                        }}
                      />
                    </IconButton>
                    <Box className="year-selector-grid">
                      {yearsSelectionMatrix.map((row) => {
                        return row.map((yr) => {
                          return (
                            <Typography
                              key={yr}
                              className={`year-selector-year ${
                                yr === year
                                  ? "year-selector-year--selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setYear(yr);
                                setIsYearSelectorOpen(false);
                              }}
                            >
                              {yr}
                            </Typography>
                          );
                        });
                      })}
                    </Box>
                    <IconButton>
                      <KeyboardArrowDown
                        sx={{ fontSize: "2.5rem", cursor: "pointer" }}
                        onClick={() => {
                          computeNextYearsSelectionMatrix("inc");
                        }}
                      />
                    </IconButton>
                  </Box>
                </Box>
              )}

              <Box className="picker-header">
                <Typography
                  className="selected-date"
                  onClick={onYearMonthClick}
                >
                  {months[month - 1]} {year}
                  <KeyboardArrowRight sx={{ fontSize: "2rem" }} />
                </Typography>

                <Box className="move-actions-container">
                  <Typography
                    className="action-previous"
                    onClick={onPreviousClick}
                  >
                    <IconButton>
                      <KeyboardArrowLeft sx={{ fontSize: "1.5rem" }} />
                    </IconButton>
                  </Typography>
                  <Typography className="action-next" onClick={onNextClick}>
                    <IconButton>
                      <KeyboardArrowRight sx={{ fontSize: "1.5rem" }} />
                    </IconButton>
                  </Typography>
                </Box>
              </Box>

              <Box className="calendar-grid">
                <Box className="row">
                  <Box className="column column--row-1">Mon</Box>
                  <Box className="column column--row-1">Tue</Box>
                  <Box className="column column--row-1">Wed</Box>
                  <Box className="column column--row-1">Thu</Box>
                  <Box className="column column--row-1">Fri</Box>
                  <Box className="column column--row-1">Sat</Box>
                  <Box className="column column--row-1">Sun</Box>
                </Box>

                {dateValuesMatrix.map((row, rowIndex) => (
                  <Box className="row" key={rowIndex}>
                    {row.map((_, columnIndex) => {
                      const dayNumber = dateValuesMatrix[rowIndex][columnIndex];
                      const classNameByFlag =
                        datesFlagsMatrix[rowIndex][columnIndex] === 0
                          ? "disabled"
                          : datesFlagsMatrix[rowIndex][columnIndex] === 2 &&
                            month === initValue.getMonth() + 1 &&
                            year === initValue.getFullYear() &&
                            value
                          ? "selected"
                          : "enabled";

                      const dateNow = new Date();
                      const isDayCurrent =
                        dayNumber === dateNow.getDate() &&
                        year === dateNow.getFullYear() &&
                        month === dateNow.getMonth() + 1;
                      const outlinedClassName = isDayCurrent
                        ? "column--outlined"
                        : "";

                      return (
                        <Box
                          className={`column column--${classNameByFlag} ${outlinedClassName}`}
                          key={columnIndex}
                          onClick={() => {
                            const newDate = new Date(
                              year,
                              month - 1,
                              dayNumber
                            );

                            if (typeof onChange === "function") {
                              const isSameDate =
                                datesFlagsMatrix[rowIndex][columnIndex] === 2;
                              onChange(newDate, isSameDate);
                              setIsCalendarOpen(false);
                            }
                          }}
                        >
                          {dayNumber}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </ClickAwayListener>
        </PopperStyled>

        {/* {isCalendarOpen &&
          createPortal(
            <MuiMenuStyled
              ref={(node: HTMLElement) => {
                const bounds =
                  pickerContainerRef.current?.getBoundingClientRect();
                if (node) {
                  node.style.left = `${bounds.left}px`;
                  node.style.top = `${bounds.top}px`;
                }

                dropDownRef.current = node;
              }}
              className="date-picker"
              sx={{
                position: "absolute",
                top: "2rem",
                zIndex: 10,
                backgroundColor: "#ffffff",
              }}
            >
              {isYearSelectorOpen && (
                <Box className="year-selector">
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <IconButton onClick={() => setIsYearSelectorOpen(false)}>
                      <Close sx={{ cursor: "pointer", fontSize: "1.5rem" }} />
                    </IconButton>
                  </Box>
                  <Box className="year-selector-grid-container">
                    <IconButton>
                      <KeyboardArrowUp
                        sx={{ fontSize: "2.5rem", cursor: "pointer" }}
                        onClick={() => {
                          computeNextYearsSelectionMatrix("dec");
                        }}
                      />
                    </IconButton>
                    <Box className="year-selector-grid">
                      {yearsSelectionMatrix.map(row => {
                        return row.map(yr => {
                          return (
                            <Typography
                              key={yr}
                              className={`year-selector-year ${
                                yr === year
                                  ? "year-selector-year--selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setYear(yr);
                                setIsYearSelectorOpen(false);
                              }}
                            >
                              {yr}
                            </Typography>
                          );
                        });
                      })}
                    </Box>
                    <IconButton>
                      <KeyboardArrowDown
                        sx={{ fontSize: "2.5rem", cursor: "pointer" }}
                        onClick={() => {
                          computeNextYearsSelectionMatrix("inc");
                        }}
                      />
                    </IconButton>
                  </Box>
                </Box>
              )}

              <Box className="picker-header">
                <Typography
                  className="selected-date"
                  onClick={onYearMonthClick}
                >
                  {months[month - 1]} {year}
                  <KeyboardArrowRight sx={{ fontSize: "2rem" }} />
                </Typography>

                <Box className="move-actions-container">
                  <Typography
                    className="action-previous"
                    onClick={onPreviousClick}
                  >
                    <IconButton>
                      <KeyboardArrowLeft sx={{ fontSize: "1.5rem" }} />
                    </IconButton>
                  </Typography>
                  <Typography className="action-next" onClick={onNextClick}>
                    <IconButton>
                      <KeyboardArrowRight sx={{ fontSize: "1.5rem" }} />
                    </IconButton>
                  </Typography>
                </Box>
              </Box>

              <Box className="calendar-grid">
                <Box className="row">
                  <Box className="column column--row-1">Mon</Box>
                  <Box className="column column--row-1">Tue</Box>
                  <Box className="column column--row-1">Wed</Box>
                  <Box className="column column--row-1">Thu</Box>
                  <Box className="column column--row-1">Fri</Box>
                  <Box className="column column--row-1">Sat</Box>
                  <Box className="column column--row-1">Sun</Box>
                </Box>

                {dateValuesMatrix.map((row, rowIndex) => (
                  <Box className="row" key={rowIndex}>
                    {row.map((_, columnIndex) => {
                      const dayNumber = dateValuesMatrix[rowIndex][columnIndex];
                      const classNameByFlag =
                        datesFlagsMatrix[rowIndex][columnIndex] === 0
                          ? "disabled"
                          : datesFlagsMatrix[rowIndex][columnIndex] === 2 &&
                            month === value.getMonth() + 1 &&
                            year === value.getFullYear()
                          ? "selected"
                          : "enabled";

                      return (
                        <Box
                          className={`column column--${classNameByFlag}`}
                          key={columnIndex}
                          onClick={() => {
                            const newDate = new Date(
                              year,
                              month - 1,
                              dayNumber,
                            );

                            if (typeof onChange === "function") {
                              const isSameDate =
                                datesFlagsMatrix[rowIndex][columnIndex] === 2;
                              onChange(newDate, isSameDate);
                              setIsCalendarOpen(false);
                            }
                          }}
                        >
                          {dayNumber}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </MuiMenuStyled>,
            document.body,
          )} */}
      </div>

      {/* <Dropdown
        // onOpenChange={handleOpenChange}
        id="c-date-picker-dropdown"
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      >
        <MenuButton
          sx={{ gap: "0.25rem", background: "#fff" }}
          onClick={() => {
            setIsCalendarOpen(prev => {
              const newValue = !prev;
              if (newValue === false) {
                setYear(initYear);
                setMonth(initMonth);
              }
              console.log(newValue);
              return newValue;
            });
          }}
        >
          <CalendarTodayOutlined
            sx={{
              fontSize: "1.25rem",
            }}
          />
          <Typography sx={{ fontSize: "0.875rem", alignItems: "center" }}>
            {currentDate}-{months[value.getMonth()]}-{value.getFullYear()}
          </Typography>
        </MenuButton>

        <MuiMenuStyled ref={dropDownRef} className="date-picker">
          {isYearSelectorOpen && (
            <Box className="year-selector">
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton onClick={() => setIsYearSelectorOpen(false)}>
                  <Close sx={{ cursor: "pointer", fontSize: "1.5rem" }} />
                </IconButton>
              </Box>
              <Box className="year-selector-grid-container">
                <IconButton>
                  <KeyboardArrowUp
                    sx={{ fontSize: "2.5rem", cursor: "pointer" }}
                    onClick={() => {
                      computeNextYearsSelectionMatrix("dec");
                    }}
                  />
                </IconButton>
                <Box className="year-selector-grid">
                  {yearsSelectionMatrix.map(row => {
                    return row.map(yr => {
                      return (
                        <Typography
                          key={yr}
                          className={`year-selector-year ${
                            yr === year ? "year-selector-year--selected" : ""
                          }`}
                          onClick={() => {
                            setYear(yr);
                            setIsYearSelectorOpen(false);
                          }}
                        >
                          {yr}
                        </Typography>
                      );
                    });
                  })}
                </Box>
                <IconButton>
                  <KeyboardArrowDown
                    sx={{ fontSize: "2.5rem", cursor: "pointer" }}
                    onClick={() => {
                      computeNextYearsSelectionMatrix("inc");
                    }}
                  />
                </IconButton>
              </Box>
            </Box>
          )}

          <Box className="picker-header">
            <Typography className="selected-date" onClick={onYearMonthClick}>
              {months[month - 1]} {year}
              <KeyboardArrowRight sx={{ fontSize: "2rem" }} />
            </Typography>

            <Box className="move-actions-container">
              <Typography className="action-previous" onClick={onPreviousClick}>
                <IconButton>
                  <KeyboardArrowLeft sx={{ fontSize: "1.5rem" }} />
                </IconButton>
              </Typography>
              <Typography className="action-next" onClick={onNextClick}>
                <IconButton>
                  <KeyboardArrowRight sx={{ fontSize: "1.5rem" }} />
                </IconButton>
              </Typography>
            </Box>
          </Box>

          <Box className="calendar-grid">
            <Box className="row">
              <Box className="column column--row-1">Mon</Box>
              <Box className="column column--row-1">Tue</Box>
              <Box className="column column--row-1">Wed</Box>
              <Box className="column column--row-1">Thu</Box>
              <Box className="column column--row-1">Fri</Box>
              <Box className="column column--row-1">Sat</Box>
              <Box className="column column--row-1">Sun</Box>
            </Box>

            {dateValuesMatrix.map((row, rowIndex) => (
              <Box className="row" key={rowIndex}>
                {row.map((_, columnIndex) => {
                  const dayNumber = dateValuesMatrix[rowIndex][columnIndex];
                  const classNameByFlag =
                    datesFlagsMatrix[rowIndex][columnIndex] === 0
                      ? "disabled"
                      : datesFlagsMatrix[rowIndex][columnIndex] === 2 &&
                        month === value.getMonth() + 1 &&
                        year === value.getFullYear()
                      ? "selected"
                      : "enabled";

                  return (
                    <Box
                      className={`column column--${classNameByFlag}`}
                      key={columnIndex}
                      onClick={() => {
                        const newDate = new Date(year, month - 1, dayNumber);

                        if (typeof onChange === "function") {
                          const isSameDate =
                            datesFlagsMatrix[rowIndex][columnIndex] === 2;
                          onChange(newDate, isSameDate);
                          setIsCalendarOpen(false);
                        }
                      }}
                    >
                      {dayNumber}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </MuiMenuStyled>
      </Dropdown> */}
    </CDatePickerStyled>
  );
}

const CDatePickerStyled = styled(Box)(({ theme }) => ({
  width: "max-content",
  position: "relative",
  display: "flex",
  alignItems: "center",

  ".date-input": {
    paddingLeft: "2.5rem",
    paddingBlock: "0.6rem",
    fontFamily: "'Helvetica Now Display',sans-serif",
    fontSize: "0.875rem",
    border: `1px solid #BABABA`,
    borderRadius: "0.3125rem",
  },

  ".calendar-icon": {
    position: "absolute",
    left: "0.5rem",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
  },

  ".selector-box": {
    borderRadius: "5px",
    padding: "0.5rem 1.5rem 0.5rem 0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    border: "1px solid #BABABA",
    cursor: "pointer",
  },

  "input::-webkit-calendar-picker-indicator": {
    display: "none",
  },

  'input[type="date"]::-webkit-input-placeholder': {
    visibility: "hidden !important",
  },
}));

const MuiMenuStyled = styled(Box)(() => ({
  padding: "2.125rem",

  ".selected-date": {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#3c3c3c",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  ".picker-container": {
    padding: "28px",
    border: "1px solid #BABABA",
    borderRadius: "9px",
    // position: "absolute",
    zIndex: 9999,
    backgroundColor: "#ffffff",
  },

  ".picker-header": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },

  ".move-actions-container": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  ".action-previous,.action-next": {
    cursor: "pointer",
  },

  ".calendar-grid": {
    display: "grid",
    gridTemplateRows: "repeat(6,1fr)",
    rowGap: "0.5rem",
  },

  ".calendar-grid .row": {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    columnGap: "0.5rem",
    placeItems: "center",
  },

  ".calendar-grid .column": {
    padding: "0.25rem 0.375rem",
    borderRadius: "100%",
    width: "100%",
    textAlign: "center",
  },
  ".calendar-grid .column--row-1": {
    fontSize: "0.75rem",
  },
  ".calendar-grid .column--disabled": {
    color: "#BABABA",
    pointerEvents: "none",
  },
  ".calendar-grid .column--enabled": {
    cursor: "pointer",

    "&:hover": {
      backgroundColor: "#90CFB6",
    },
  },
  ".calendar-grid .column--selected": {
    backgroundColor: "#90CFB6",
    cursor: "pointer",
  },
  ".calendar-grid .column--outlined": {
    border: "1px solid #90CFB6",
  },

  ".year-selector": {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: 1,
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
  },

  ".year-selector-grid-container": {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  ".year-selector-grid": {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    rowGap: "1rem",
    columnGap: "0.25rem",
    placeItems: "center",
  },

  ".year-selector-year": {
    textAlign: "center",
    borderRadius: "100%",
    cursor: "pointer",
    width: "max-content",
    padding: "16px",

    "&:hover": {
      backgroundColor: "#90CFB6",
    },
  },

  ".year-selector-year--selected": {
    backgroundColor: "#90CFB6",
  },
}));

const PopperStyled = styled(Popper)(() => ({
  padding: "2.125rem",
  backgroundColor: "#ffffff",
  zIndex: 9999,
  border: `1px solid #BABABA`,
  borderRadius: "0.5625rem",

  ".selected-date": {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#3c3c3c",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  ".picker-container": {
    padding: "28px",
    border: "1px solid #BABABA",
    borderRadius: "9px",
    // position: "absolute",
    zIndex: 9999,
    backgroundColor: "#ffffff",
  },

  ".picker-header": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },

  ".move-actions-container": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  ".action-previous,.action-next": {
    cursor: "pointer",
  },

  ".calendar-grid": {
    display: "grid",
    gridTemplateRows: "repeat(6,1fr)",
    rowGap: "0.5rem",
  },

  ".calendar-grid .row": {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    columnGap: "0.5rem",
    placeItems: "center",
  },

  ".calendar-grid .column": {
    padding: "0.25rem 0.375rem",
    borderRadius: "100%",
    width: "100%",
    textAlign: "center",
  },
  ".calendar-grid .column--row-1": {
    fontSize: "0.75rem",
  },
  ".calendar-grid .column--disabled": {
    color: "#BABABA",
    pointerEvents: "none",
  },
  ".calendar-grid .column--enabled": {
    cursor: "pointer",

    "&:hover": {
      backgroundColor: "#90CFB6",
    },
  },
  ".calendar-grid .column--selected": {
    backgroundColor: "#90CFB6",
    cursor: "pointer",
  },
  ".calendar-grid .column--outlined": {
    border: "1px solid #90CFB6",
  },

  ".year-selector": {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    zIndex: 1,
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
  },

  ".year-selector-grid-container": {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  ".year-selector-grid": {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    rowGap: "1rem",
    columnGap: "0.25rem",
    placeItems: "center",
  },

  ".year-selector-year": {
    textAlign: "center",
    borderRadius: "100%",
    cursor: "pointer",
    width: "max-content",
    padding: "16px",

    "&:hover": {
      backgroundColor: "#90CFB6",
    },
  },

  ".year-selector-year--selected": {
    backgroundColor: "#90CFB6",
  },
}));
