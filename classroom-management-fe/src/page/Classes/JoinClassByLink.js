import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from "react";
import ClassService from "../../services/class.service";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Container from "@mui/material/Container";
import {LinearProgress} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {useUserStore} from "../../context/UserStoreProvider";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function JoinClassByLink() {
  const { classCode } = useParams();
  const { setIsTeacherStatus } = useUserStore();
  const { user } = useUserStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const invitationCode = queryParams.get('inviteC');
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [classData, setClassData] = React.useState(null);
  const [open, setOpen] = React.useState(true);
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

  const handleClose = () => {
    setOpen(false);
  };

  const handleJoinClassByLink = async () => {
    if (user) {
      await ClassService.joinClassByLink({classCode: classCode, invitationCode: invitationCode, userId: user.id})
        .then(() => {
          localStorage.setItem('msgDialogSuccess', 'Join class successful');

          if (classData.isTeacher) {
            setIsTeacherStatus(true)
          }
          setTimeout(() => {
            navigate('/class/' + classData.classCode);
          }, 800);
        }, (error) => {
          console.log(error)
          if (error.response.data.error.message === "You already exist in the class."
            || error.response.data.error.message === "You already exist in the class as a teacher.") {
            localStorage.setItem('msgDialog', error.response.data.error.message);
            setTimeout(() => {
              navigate('/class/' + classCode);
            }, 800);
          } else {
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          }
        });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (classCode && invitationCode && user) {
        await ClassService.getClassByInvitationCode({ invitationCode: invitationCode})
          .then((data) => {
            console.log(data.data.data)
            setClassData(data.data.data)
            setLoading(false);
          }, (error) => {
            console.log(error)
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          });
      }
    };

    fetchData();
  });

  if (loading) {
    return (
      <>
        <Container sx={{ py: 8 }} maxWidth="md">
          <LinearProgress  />
        </Container>
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

    )
  }

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Join the class
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
            <strong>{classData.className}</strong>
          </Typography>
          <Typography gutterBottom>
            <strong>Teacher: {classData.teachers[0].name}</strong>
          </Typography>
          <Typography gutterBottom>
            You are participating in the class as {classData.isTeacher ? 'a teacher' : 'a student'}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleJoinClassByLink}>
            Join
          </Button>
        </DialogActions>
      </BootstrapDialog>

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
