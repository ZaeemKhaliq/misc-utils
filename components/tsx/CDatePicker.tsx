import { useEffect, useState } from "react";

import {
  CalendarTodayOutlined,
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

type CDatePickerProps = {
  value?: Date;
  onChange?: (newDate: Date) => void;
};
export default function CDatePicker(props: CDatePickerProps) {
  const { value = new Date(), onChange } = props;
  const initYear = value.getFullYear();
  const initMonth = value.getMonth() + 1;

  const [year, setYear] = useState<number>(initYear);
  const [month, setMonth] = useState<number>(initMonth);
  const startDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInCurrentMonth = new Date(year, month, 0).getDate();
  const currentDate = value.getDate();
  console.log("%cc-date-picker:", "background-color:crimson;color:white;", {
    props,
    value,
    startDayOfMonth,
    daysInCurrentMonth,
    currentDate,
  });

  useEffect(() => {
    setYear(value.getFullYear());
    setMonth(value.getMonth() + 1);
  }, [value]);

  const [yearsSelectionMatrix, setYearsSelectionMatrix] = useState<number[][]>(
    yearsSelectionMatrixInitState
  );
  const [currentYearVector, setCurrentYearVector] = useState<number[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState<boolean>(false);

  const datesFlagsMatrix: number[][] = (() => {
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
          prev[i][j] = 1;
          daysAdded += 1;
          if (daysAdded === currentDate) {
            prev[i][j] = 2;
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
    function leapYear(yearToCheck: number) {
      return (
        (yearToCheck % 4 == 0 && yearToCheck % 100 != 0) ||
        yearToCheck % 400 == 0
      );
    }

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

  return (
    <CDatePickerStyled id="c-date-picker">
      <Dropdown open={isCalendarOpen} onClose={() => setIsCalendarOpen(false)}>
        <MenuButton
          sx={{ gap: "0.25rem" }}
          onClick={() =>
            setIsCalendarOpen((prev) => {
              const newValue = !prev;
              if (newValue === false) {
                setYear(initYear);
                setMonth(initMonth);
              }

              return newValue;
            })
          }
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
        <MuiMenuStyled>
          {isYearSelectorOpen && (
            <Box className="year-selector">
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton>
                  <Close
                    onClick={() => setIsYearSelectorOpen(false)}
                    sx={{ cursor: "pointer", fontSize: "1.5rem" }}
                  />
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
                        if (datesFlagsMatrix[rowIndex][columnIndex] === 1) {
                          const newDate = new Date(year, month - 1, dayNumber);

                          if (typeof onChange === "function") {
                            onChange(newDate);
                            setIsCalendarOpen(false);
                          }
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
      </Dropdown>
    </CDatePickerStyled>
  );
}

const CDatePickerStyled = styled(Box)(() => ({
  width: "max-content",
  position: "relative",
  display: "flex",
  alignItems: "center",

  ".selector-box": {
    borderRadius: "5px",
    padding: "0.5rem 1.5rem 0.5rem 0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    border: "1px solid #BABABA",
    cursor: "pointer",
  },
}));

const MuiMenuStyled = styled(Menu)(() => ({
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
