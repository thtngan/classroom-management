import * as React from 'react';
import Typography from "@mui/material/Typography";
import {Divider, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import TextField from "@mui/material/TextField";
import {useEffect, useState} from "react";
import ClassService from "../../../services/class.service";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AdminListItemPeople from "../../../components/List/AdminListItemPeople";
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import AuthService from "../../../services/auth.service";

export default function AdminClassDetail({classCode, clickRow, reloadTable}) {
  const [loading, setLoading] = React.useState(true);
  const [classData, setClassData] = React.useState(null);
  const [peopleData, setPeopleData] = React.useState(null);
  const [className, setClassName] = React.useState(null);
  const [open, setOpen] = React.useState(false);
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

  const handleClassNameChange = (event) => {
    const enteredName = event.target.value;
    setClassName(enteredName);
  };


  useEffect(() => {
    const fetchData = async () => {
      if (classCode) {
        await ClassService.getClassByClassCode({ classCode: classCode})
          .then((data) => {
            console.log(data.data.data);
            setClassData(data.data.data)
            setClassName(data.data.data.className)

          }, (error) => {
            console.log(error)
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          })
        ;

        await ClassService.listPeopleByClassCode({ classCode: classCode })
          .then((data) => {
            console.log(data.data.data)
            const peopleList = data.data.data
            setPeopleData(peopleList)

            setLoading(false);
          }, (error) => {
          })
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleUpdateClassName = async () => {
    setLoading(true);
    handleClose();
    await ClassService.updateClassName({classCode: classCode, className: className })
      .then((data) => {
        showAlert('Update class name successfully.', 'success');
        reloadTable();
      }, (error) => {
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        setOpen(false);
      }).finally(setLoading(false))

  };

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
    <>
      <ListItem
        secondaryAction={
              <IconButton aria-label="comment" onClick={handleClickOpen}>
                <EditIcon />
              </IconButton>
        }
      >
        <ListItemText
          primary={
            <Typography variant="h6" gutterBottom>
              <strong>Class Name:</strong> {className}
            </Typography>
          }
        />
      </ListItem>

      <ListItem>
        <ListItemText
          primary={
            <Typography variant="h6" gutterBottom>
              <strong>Class Owner:</strong> {classData.classOwner.name}
            </Typography>
          }
        />
      </ListItem>

      <ListItem>
        <ListItemText
          primary={
            <Typography variant="h6" gutterBottom>
              <strong>Class Code:</strong> {classData.classCode}
            </Typography>
          }
        />
      </ListItem>


      <Typography variant="h6" gutterBottom sx={{ mt : 4 }}>
        Teachers
      </Typography>
      <Divider />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {<AdminListItemPeople name={peopleData.classOwner.name} email={peopleData.classOwner.email} note={"Class Owner"} noSetting={true}/>}

        {peopleData.teachers.map((teacher) => (
          teacher.email !== peopleData.classOwner.email && (
            <AdminListItemPeople classCode={classCode} id={teacher._id} key={teacher.email} name={teacher.name} email={teacher.email} noSetting={true} clickRow={clickRow} reloadTable={reloadTable}/>
          )
        ))}
      </List>

      <Typography variant="h6" gutterBottom sx={{ mt : 4 }}>
        Students
      </Typography>
      <Divider />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {peopleData.students.length === 0 ? (
          <Typography variant="body1" >There is no student in this class.</Typography>
        ) : (
          peopleData.students.map((card) => (
            <AdminListItemPeople classCode={classCode} id={card._id} name={card.name} email={card.email} note={card.studentId} clickRow={clickRow} reloadTable={reloadTable}/>
          ))
        )}
      </List>


      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit class name</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            id="name"
            label="Class Name"
            type="text"
            fullWidth
            value={className}
            variant="standard"
            onChange={handleClassNameChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            loading={loading}
            onClick={handleUpdateClassName}
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
