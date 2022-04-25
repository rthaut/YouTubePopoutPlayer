import React from "react";
import PropTypes from "prop-types";

import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

function ConditionalTooltipWrapper({
  condition,
  html,
  placement = "bottom-start",
  children,
}) {
  if (condition) {
    return (
      <Tooltip
        interactive
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
