import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from "@mui/lab/LoadingButton";
import GradeReviewServices from "../../../../services/grade.review.services";
import {useState} from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {useUserStore} from "../../../../context/UserStoreProvider";
import GradeIcon from "@mui/icons-material/Grade";
import IconButton from "@mui/material/IconButton";
import NotificationService from "../../../../services/notification.service";

export default function FinalGradeRequest({grade, onReload}) {
  const { user } = useUserStore();
  const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [finalGrade, setFinalGrade] = React.useState(0);
  const [alertProps, setAlertProps] = useState({
    open: false,
    message: '',
    severity: 'success', // Default to success
  });
  const handleAlertClose = () => {
    setAlertProps((prev) => ({ ...prev, open: false }));
  };

  const showAlert = (message, severity = 'success') => {
    setAlertProps({
      open: true,
      message,
      severity,
    });

    // Hide the Alert after 4 seconds (4000 milliseconds)
    setTimeout(() => {
      handleAlertClose();
    }, 6000);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  console.log(grade)
  const handleSendRequest = async () => {
    await GradeReviewServices.updateFinalDecision(
      {
        classCode: classCode,
        gradeCompositionId: grade.gradeCompositionId,
        studentId: grade.studentId,
        studentName: grade.studentName,
        grade: finalGrade,
        markedBy: user.id
      }
    )
      .then(async (data) => {
        console.log(data.data.data);
        showAlert('Finalize grade successfully', 'success');

        const className = localStorage.getItem("className");
        const msg = "The final decision on your mark review in the class " + className + " has been made by " + user.name + ".";
        await NotificationService.createNotification({
          senderId: user.id,
          receiverIds: grade.studentId,
          classCode: classCode,
          type: "mark_review_decision",
          message: msg
        })
          .then(
            (data) => {
              console.log(data.data.data)
              showAlert('Create a notification to your student successully', 'success');

            },
            (error) => {
              console.log(error)
              showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
            }
          );

      }, (error) => {
        console.log(error)
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
      })
    ;
    handleClose();
    onReload();
  };

  return (
    <>
      {!grade.finalDecision.markedBy && (
        <IconButton aria-label="settings" onClick={handleClickOpen}>
          <GradeIcon />
        </IconButton>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Final decision for <strong>{grade.gradeCompositionName}</strong></DialogTitle>
        <DialogContent>
          <DialogContentText>
            To mark the final decision for grade name <strong>{grade.gradeCompositionName}</strong> of student ID <strong>{grade.studentName}</strong>, please enter the grade.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="number"
            label="Final grade"
            type="number"
            fullWidth
            variant="standard"
            inputProps={{ min: 0, max: 10 }}
            value={finalGrade}
            onChange={(e) => setFinalGrade(e.target.value)}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            onClick={handleSendRequest}
            variant={"contained"}
            loading={loading}
          >
            <span>Save</span>
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alertProps.open}
        autoHideDuration={4000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleAlertClose} severity={alertProps.severity} sx={{ width: '100%' }}>
          {alertProps.message}
        </Alert>
      </Snackbar>
    </>
  );
}