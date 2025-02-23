import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";

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

ConditionalTooltipWrapper.propTypes = {
  condition: PropTypes.bool.isRequired,
  html: PropTypes.string.isRequired,
  placement: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default ConditionalTooltipWrapper;
