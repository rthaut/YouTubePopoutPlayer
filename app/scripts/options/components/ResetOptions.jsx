import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";

import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import useOptionsStore from "../stores/optionsStore";

export default function ResetOptions() {
  const resetOptions = useOptionsStore((store) => store.reset);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [showResetSuccess, setShowResetSuccess] = React.useState(false);

  const handleResetButtonClick = () => {
    setShowResetSuccess(false);
    setDialogOpen(true);
  };

  const handleClose = (event, reason) => {
    switch (reason) {
      case "escapeKeyDown":
      case "backdropClick":
        return;

      default:
        setDialogOpen(false);
        break;
    }
  };

  const handleConfirm = async () => {
    await resetOptions();
    setDialogOpen(false);
    setShowResetSuccess(true);
  };

  return <>
    <Box mx={2}>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<HighlightOffIcon />}
        onClick={handleResetButtonClick}
      >
        {browser.i18n.getMessage("ButtonResetLabel")}
      </Button>
    </Box>
    <Dialog open={dialogOpen} onClose={handleClose} keepMounted>
      <DialogTitle>
        {browser.i18n.getMessage("ConfirmSettingsResetHeading")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("ConfirmSettingsResetText"),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {browser.i18n.getMessage("ButtonCancelResetLabel")}
        </Button>
        <Button onClick={handleConfirm} color="secondary">
          {browser.i18n.getMessage("ButtonConfirmResetLabel")}
        </Button>
      </DialogActions>
    </Dialog>
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={showResetSuccess}
      autoHideDuration={3000}
      onClose={() => setShowResetSuccess(false)}
      message={browser.i18n.getMessage("OptionsResetSuccessMessage")}
    />
  </>;
}
