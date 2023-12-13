import { useEffect, useState } from "react";

import {
  CalendarTodayOutlined,
  Close,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { Box, Dropdown, Menu, MenuButton, Typography, styled } from "@mui/joy";

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

  const [datesFlagsMatrix, setDatesFlagsMatrix] = useState<number[][]>(
    datesFlagsMatrixInitState
  );
  const [dateValuesMatrix, setDateValuesMatrix] = useState<number[][]>(
    datesValuesMatrixInitState
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  console.log({ datesFlagsMatrix, dateValuesMatrix });

  useEffect(() => {
    setDatesFlagsMatrix(prev => {
      let daysAdded = 0;
      let datesAfterLastDateOfCurrentMonth = 1;
      const dateValuesMatrixLocal = structuredClone(dateValuesMatrix);

      for (let i = 0; i < prev.length; i += 1) {
        const row = prev[i];

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
              prev[i][k] = 0;
              previousMonthLastDate -= 1;
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
            dateValuesMatrixLocal[i][j] = daysAdded;
          }

          if (daysAdded > daysInCurrentMonth) {
            dateValuesMatrixLocal[i][j] = datesAfterLastDateOfCurrentMonth;
            datesAfterLastDateOfCurrentMonth += 1;
            prev[i][j] = 0;
          }
        }
      }

      setDateValuesMatrix(dateValuesMatrixLocal);

      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, daysInCurrentMonth, month, startDayOfMonth, year]);

  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState<boolean>(false);
  const onYearMonthClick = () => {
    setIsYearSelectorOpen(true);
  };

  const onPreviousClick = () => {
    const newMonthValue = month - 1;
    if (newMonthValue === 0) {
      setMonth(12);
      setYear(prev => prev - 1);
      return;
    }

    setMonth(newMonthValue);
  };
  const onNextClick = () => {
    const newMonthValue = month + 1;
    if (newMonthValue === 13) {
      setMonth(1);
      setYear(prev => prev + 1);
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
            setIsCalendarOpen(prev => {
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
                <Close onClick={() => setIsYearSelectorOpen(false)} />
              </Box>
              <Box className="year-selector-grid">abcd</Box>
            </Box>
          )}

          <Box className="picker-header">
            <Typography className="selected-date">
              {months[month - 1]} {year}
            </Typography>

            <Box className="move-actions-container">
              <Typography className="action-previous" onClick={onPreviousClick}>
                <KeyboardArrowLeft sx={{ fontSize: "1.5rem" }} />
              </Typography>
              <Typography className="action-next" onClick={onNextClick}>
                <KeyboardArrowRight sx={{ fontSize: "1.5rem" }} />
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
    padding: "28px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
  },
}));
