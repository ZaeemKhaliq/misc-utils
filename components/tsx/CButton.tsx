import { PropsWithChildren } from "react";

import { styled } from "@mui/material/styles";

import CSpinner from "../CSpinner/CSpinner";

type CButtonProps = {
  variant?: "filled" | "outlined";
  fontWeight?: number;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  padding?: string;
  disabled?: boolean;
  isLoading?: boolean;
};
export default function CButton(props: CButtonProps & PropsWithChildren) {
  const {
    children,
    variant = "filled",
    fontWeight = 600,
    onClick,
    type = "button",
    padding,
    disabled,
    isLoading,
  } = props;

  return (
    <CButtonStyled
      padding={padding}
      type={type}
      variant={variant}
      fontWeight={fontWeight}
      onClick={onClick}
      disabled={disabled}
    >
      {isLoading ? <CSpinner height="1.5rem" width="1.5rem" /> : children}
    </CButtonStyled>
  );
}

type CButtonStyledProps = {
  variant: "filled" | "outlined";
  fontWeight: number;
  padding?: string;
};
const CButtonStyled = styled("button", {
  shouldForwardProp(propName) {
    return propName !== "variant" && propName !== "fontWeight" && propName !== "padding";
  },
})<CButtonStyledProps>(({ theme, variant, fontWeight, padding }) => {
  const variantToStylesMap = {
    filled: {
      backgroundColor: theme.colors.primary,
      color: "white",

      "&:hover": {
        backgroundColor: theme.colors.primaryHover,
      },

      "&:disabled": {
        backgroundColor: "hsl(219, 64%, 80%)",
        pointerEvents: "none",
      },

      ".MuiCircularProgress-root": {
        color: "white",
      },
    },
    outlined: {
      backgroundColor: "white",
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,

      "&:hover": {
        backgroundColor: "hsl(0, 0%, 96%)",
        border: `1px solid ${theme.colors.primary}`,
      },

      "&:disabled": {
        opacity: 0.35,
        pointerEvents: "none",
      },
    },
  };
  return {
    all: "unset",
    ...variantToStylesMap[variant],
    padding: padding ?? "1rem 2rem",
    fontSize: "1rem",
    lineHeight: "1.25rem",
    fontWeight,
    borderRadius: "1.5625rem",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.2s ease",
  };
});
