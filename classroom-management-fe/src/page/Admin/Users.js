import * as React from 'react';
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TableClasses from "./Classes/TableClasses";
import {useEffect, useState} from "react";
import ClassService from "../../services/class.service";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AdminClassDetail from "./Classes/AdminClassDetail";
import {Divider, IconButton} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AuthService from "../../services/auth.service";
import TableUsers from "./Users/TableUsers";
import AdminUserDetail from "./Users/AdminUserDetail";

export default function Users() {
  const [loading, setLoading] = React.useState(true);
  const [userDetail, setUserDetail] = React.useState(null);
  const [userData, setUserData] = React.useState(null);
  const [rowClick, setRowClick] = React.useState(null);
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

  const fetchData = async () => {
    await AuthService.getAllUsers()
      .then((data) => {
        console.log(data.data.data);
        setUserData(data.data.data)
        setLoading(false);
      }, (error) => {
        console.log(error)
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
      })
    ;
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleClose = () => {
    setRowClick(null)
  };

  const handleRowClick = (row) => {
    console.log(row)
    setRowClick(null);

    setTimeout(() => {
      setRowClick(row);
    }, 800);
  };


  return (
    <>
      <Container sx={{ mt : 5}}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong>Users</strong>
          </Typography>
        </Stack>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <TableUsers users={userData} clickRow={handleRowClick}/>
      </Container>

      {rowClick && (
        <Container sx={{ mt : 5}}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>User Detail</strong>
            </Typography>
            <IconButton color="primary" aria-label="add people" onClick={handleClose}>
              <CloseIcon sx={{ fontSize: '2rem' }}/>
            </IconButton>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed', mb: 4 }} />

          <AdminUserDetail userDetail={rowClick} clickRow={handleRowClick} reloadTable={fetchData}/>

        </Container>
      )}


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
