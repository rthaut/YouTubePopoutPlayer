import React from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import Snackbar from "@material-ui/core/Snackbar";

import HighlightOffIcon from "@material-ui/icons/HighlightOff";

import Options from "../../helpers/options";

export default function ResetOptions() {
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
    await Options.InitLocalStorageDefaults(true);
    setDialogOpen(false);
    setShowResetSuccess(true);
  };

  return (
    <>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={0}
      >
        <Grid item xs>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<HighlightOffIcon />}
            onClick={handleResetButtonClick}
          >
            {browser.i18n.getMessage("ButtonResetLabel")}
          </Button>
        </Grid>
      </Grid>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        keepMounted
      >
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
          <Button onClick={handleClose} color="default">
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
    </>
  );
}
