import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import {useState} from "react";
import ClassService from "../../services/class.service";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {useNavigate} from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import {useUserStore} from "../../context/UserStoreProvider";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function JoinClassByCode({open, setOpen}) {
  const { user } = useUserStore();
  const [loading, setLoading] = React.useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
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

  const validateClassCode = (code) => {
    const regex = /^[a-zA-Z0-9]{5,7}$/;
    return regex.test(code);
  };

  const handleClassCodeChange = (event) => {
    const enteredCode = event.target.value;
    setCode(enteredCode);

    if (!validateClassCode(enteredCode)) {
      setError('Class code must be 5-7 characters including letters and numbers, and no spaces or symbols.');
    } else {
      setError('');
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    handleClose();
    if (validateClassCode(code)) {
      await ClassService.joinClassByCode({invitationCode: code, userId: user.id})
        .then((data) => {
          localStorage.setItem('msgDialogSuccess', 'Join class successful');
          setTimeout(() => {
            navigate('/class/' + data.data.data.classCode);
          }, 800);
        }, (error) => {
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          setOpen(false);
        }).finally(setLoading(false))
    }
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Join the class
            </Typography>
            <LoadingButton
              onClick={handleSubmit}
              variant="outlined"
              disabled={Boolean(error)}
              sx={{
                borderColor: 'white', color: 'white',
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderColor: 'white',
                },
              }}
              loading={loading}
            >
              <span>Join</span>
            </LoadingButton>
          </Toolbar>
        </AppBar>

        <Container sx={{ py: 8 , px : 8 }} maxWidth="md">
          <Box border={1} p={2} borderRadius={4}>
            <Typography variant="h6" gutterBottom>
              Class code
            </Typography>
            <Typography variant="body2" color={"textSecondary"} paragraph>
              Ask your teacher for the class code, then enter it here.
            </Typography>
            <TextField
              label="Enter Class Code"
              variant="outlined"
              fullWidth
              value={code}
              onChange={handleClassCodeChange}
              error={Boolean(error)}
              helperText={error}
            />
          </Box>

          <Typography variant="h6" gutterBottom paragraph mt={5}>
            To sign in with a class code:
          </Typography>
          <Typography variant="body2" component="ul" paragraph>
            <li>Use an authorized account.</li>
            <li>Use a class code with 5-7 letters or numbers, and no spaces or symbols.</li>
          </Typography>


        </Container>

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
    </React.Fragment>
  );
}