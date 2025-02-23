import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";

export default function TabPanelHeader({
  title,
  icon = null,
}: {
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <Grid
      container
      wrap="nowrap"
      spacing={1}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
    >
      {icon && <Grid item>{icon}</Grid>}
      <Grid item xs zeroMinWidth>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      </Grid>
    </Grid>
  );
}

TabPanelHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
};
