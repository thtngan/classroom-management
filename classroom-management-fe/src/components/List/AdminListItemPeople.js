import * as React from 'react';
import Stack from '@mui/material/Stack';
import {IconButton, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useState} from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import AuthService from "../../services/auth.service";
import LoadingButton from "@mui/lab/LoadingButton";
import {useUserStore} from "../../context/UserStoreProvider";
import DeleteIcon from '@mui/icons-material/Delete';
import ClassService from "../../services/class.service";

export default function AdminListItemPeople(props) {
  const {name, email, note, noSetting, classCode, id, clickRow, reloadTable} = props;
  const [loading, setLoading] = React.useState(false);
  const [studentId, setStudentId] = React.useState(note);

  const [open, setOpen] = React.useState(false);
  const [openRemove, setOpenRemove] = React.useState(false);
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

  const handleStudentIdChange = (event) => {
    const enteredCode = event.target.value;
    setStudentId(enteredCode);
  };
  const handleUpdateStudentId = async () => {
    setLoading(true);
    handleClose();
    await AuthService.updateStudentId({email: email, studentId: studentId})
      .then((data) => {
        showAlert('Update student ID successfully.', 'success');


      }, (error) => {
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        setOpen(false);
      }).finally(setLoading(false))

  };

  const handleClickOpenRemove = () => {
    setOpenRemove(true);
  };

  const handleCloseRemove = async () => {
    if (noSetting) {
      await ClassService.removeTeacher({classCode: classCode, teacherId: id})
        .then((data) => {
          showAlert('Remove teacher successfully.', 'success');
          clickRow(classCode);
          reloadTable();
        }, (error) => {
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          setOpen(false);
        })
    } else {
      await ClassService.removeStudent({classCode: classCode, studentId: id})
        .then((data) => {
          showAlert('Remove student successfully.', 'success');
          clickRow(classCode);
          reloadTable();
        }, (error) => {
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          setOpen(false);
        })
    }
    handleRemove();

  };

  const handleRemove = () => {
    setOpenRemove(false);
  };

  return (
    <Stack spacing={2} direction="row">
      <ListItem
        secondaryAction={
            !noSetting ? (
              <>
                <IconButton aria-label="comment" onClick={handleClickOpen}>
                  <SettingsIcon />
                </IconButton>
                <IconButton aria-label="comment" onClick={handleClickOpenRemove}>
                  <DeleteIcon />
                </IconButton>
              </>
            ) : (
              !note && (
                <>
                  <IconButton aria-label="comment" onClick={handleClickOpenRemove}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )
            )
        }
      >
        <ListItemAvatar>
          <Avatar>
            <PersonIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography sx={{ fontWeight: 'bold' }}>
              {name} {studentId ? `- ${studentId}` : ''}
            </Typography>
          }
          secondary={email}
        />
      </ListItem>


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Student ID</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Edit the student ID of student <strong>name</strong>
          </DialogContentText>
          <TextField
            margin="dense"
            id="name"
            label="Student ID"
            type="text"
            fullWidth
            value={studentId}
            variant="standard"
            onChange={handleStudentIdChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            onClick={handleUpdateStudentId}
            loading={loading}
          >
            <span>Save</span>
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openRemove}
        keepMounted
        onClose={handleRemove}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{<Typography>Are you sure to remove <strong>{name}</strong>?</Typography>}</DialogTitle>
        <DialogActions>
          <Button onClick={handleRemove}>Disagree</Button>
          <Button onClick={handleCloseRemove}>Agree</Button>
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
    </Stack>
  );
}
