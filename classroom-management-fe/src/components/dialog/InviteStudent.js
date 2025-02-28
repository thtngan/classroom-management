import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useState} from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import {toast} from "react-toastify";
import ClassService from "../../services/class.service";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function InviteStudent({open, setOpen , classCode}) {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
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


  const handleChange = (event) => {
    const enteredEmail = event.target.value;
    setEmail(enteredEmail);

    // Validate the email format using a regular expression
    const isValid = enteredEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail);

    setError(isValid ? '' : 'Invalid email address');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInviteStudentByEmail = async () => {
    setLoading(true);
    if (email === '') {
      showAlert('Invalid email. Please enter a valid email address.', 'error');
      setLoading(false)
    } else {
      await toast.promise(ClassService.inviteByEmail(
        {email : email, classCode : classCode, isTeacher : false})
        .then(() => {
            showAlert('Sent invite email successful', 'success');
            setOpen(false);
          },
          (error) => {
            showAlert(error.response.data.error.message || 'Error during sign-up. Please try again.', 'error');
            setOpen(false);
          }
        ).finally(setLoading(false)),{
        pending: "Sending..."
      });
      setEmail('');
    }
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Invite students</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To invite students to this class, please provide your student's email address here.
            We will send the invitation link to your student's email.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            error={Boolean(error)}
            helperText={error}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>

          <LoadingButton
            onClick={handleInviteStudentByEmail}
            variant="contained"
            disabled={Boolean(error)}
            loading={loading}
          >
            <span>Invite</span>
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