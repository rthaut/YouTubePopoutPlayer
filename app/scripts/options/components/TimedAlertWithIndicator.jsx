import React from "react";

import { useInterval } from "react-use";

import { makeStyles } from "@material-ui/core/styles";

import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloseIcon from "@material-ui/icons/Close";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";

export const useStyles = makeStyles((theme) => ({
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -15,
    marginLeft: -15,
  },
}));

export function TimedAlertWithIndicator({ duration, alertProps, children }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const [remainingSeconds, setRemainingSeconds] = React.useState(duration);

  useInterval(
    () => {
      setRemainingSeconds((remainingSeconds) => --remainingSeconds);
    },
    remainingSeconds > 0 ? 1000 : null
  );

  React.useEffect(() => {
    if (remainingSeconds <= 0) {
      setOpen(false);
    }
  }, [remainingSeconds]);

  const normalize = (value) => ((value - 0) * 100) / (duration - 0);

  return (
    <Collapse in={open}>
      <Alert
        action={
          <div className={classes.wrapper}>
            <CircularProgress
              size={30}
              color="inherit"
              className={classes.buttonProgress}
              variant="determinate"
              value={100 - normalize(duration - remainingSeconds)}
            />
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                setRemainingSeconds(0);
                setOpen(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        }
        {...alertProps}
      >
        {children}
      </Alert>
    </Collapse>
  );
}
