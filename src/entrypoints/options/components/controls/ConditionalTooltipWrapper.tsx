import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

function ConditionalTooltipWrapper({
  condition,
  html,
  placement = "bottom-start",
  children,
}: {
  condition: boolean;
  html: string;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  children: React.ReactElement;
}) {
  if (condition) {
    return (
      <Tooltip
        placement={placement}
        title={
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
        }
      >
        {children}
      </Tooltip>
    );
  }

  return children;
}

export default ConditionalTooltipWrapper;
