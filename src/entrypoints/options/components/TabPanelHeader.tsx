import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

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
      {icon && <Grid>{icon}</Grid>}
      <Grid size="grow">
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      </Grid>
    </Grid>
  );
}
