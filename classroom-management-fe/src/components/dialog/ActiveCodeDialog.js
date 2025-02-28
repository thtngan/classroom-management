
import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useState} from "react";
import {toast} from "react-toastify";
import AuthService from "../../services/auth.service";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {useNavigate} from "react-router-dom";

export default function ActiveCodeDialog({dialogOpen, setDialogOpen, email}) {
  const [activeCode, setActiveCode] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const navigate = useNavigate();

  const handleSnackbarClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    await toast.promise(AuthService.activeUser({email: email, code: activeCode})
      .then(() => {
          setSnackbarMessage('Activate account successfully');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setTimeout(() => {
            navigate('/login');
          }, 800)
        },
        (error) => {
          console.log(error)
          setSnackbarMessage(error.response.data.error.message || 'Error during activated. Please try again.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      ), {
      pending: "Activating..."
      });
  }

  const handleResentCode = async () => {
    await toast.promise(AuthService.resentCode({email: email})
      .then(() => {
          setSnackbarMessage('Resent email successfully');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        },
        (error) => {
          console.log(error)
          setSnackbarMessage(error.response.data.error.message || 'Error during sent email. Please try again.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      ),{
      pending: "Sending..."
    });
  }


  return (
    <React.Fragment>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Enter Code Verification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A verification code has been sent to email: <strong>{email}</strong>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Enter the code"
            type="text"
            fullWidth
            variant="standard"
            onChange={e => setActiveCode(e.target.value)}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleResentCode}>Resent Code</Button>
          <Button variant="contained" onClick={handleSubmit}>Verify</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert elevation={6} variant="filled" severity={snackbarSeverity} onClose={handleSnackbarClose}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
