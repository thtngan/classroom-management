import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import {IconButton, LinearProgress, Paper, Tooltip} from "@mui/material";
import Grid from "@mui/material/Grid";
import ShareIcon from "@mui/icons-material/Share";
import {useEffect, useState} from "react";
import ClassService from "../../services/class.service";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import PeopleList from "./PeopleList";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import GradePanel from "../Grades/GradePanel";
import {useUserStore} from "../../context/UserStoreProvider";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function ClassDetail({socket}) {
  const { isTeacher } = useUserStore();
  const [loading, setLoading] = React.useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedJoinCode, setIsCopiedJoinCode] = useState(false);
  const [value, setValue] = React.useState(0);
  const [classData, setClassData] = React.useState(null);
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL

      if (classCode) {
        await ClassService.getClassByClassCode({ classCode: classCode})
          .then((data) => {
            console.log(data.data.data);
            setClassData(data.data.data)
            localStorage.setItem('className', data.data.data.className)
            setLoading(false);
          }, (error) => {
            console.log(error)
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          })
        ;
      }
    };

    const msgDialog = localStorage.getItem('msgDialog');
    const msgDialogSuccess = localStorage.getItem('msgDialogSuccess');

    if (msgDialog) {
      showAlert(msgDialog, 'error');
      localStorage.removeItem('msgDialog')
    }
    if (msgDialogSuccess) {
      showAlert(msgDialogSuccess, 'success');
      localStorage.removeItem('msgDialogSuccess')
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleCopy = () => {
    setIsCopied(true);
    const URL = `https://classroom-management-fe.vercel.app/join-class/${classData.classCode}?inviteC=${classData.invitationCode}`;
    navigator.clipboard.writeText(URL).then(() => {
      showAlert('Invite link is copied', 'success')

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    })
  };

  const handleCopyJoinCode = () => {
    setIsCopiedJoinCode(true);
    const codeToCopy = classData.invitationCode;

    navigator.clipboard.writeText(codeToCopy).then(() => {
      showAlert('Invite code is copied', 'success')
      setTimeout(() => {
        setIsCopiedJoinCode(false);
      }, 2000);
    })
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
      <Container maxWidth="lg">
        <Paper
          sx={{
            position: 'relative',
            backgroundColor: 'grey.800',
            color: '#fff',
            borderRadius: '0 0 32px 32px',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              backgroundColor: 'rgba(0,0,0,.3)',
              borderRadius: '0 0 32px 32px',
            }}
          />
          <Grid container>
            <Grid item md={6}>
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 6 },
                  pr: { md: 0 },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                  {classData.className}
                </Typography>
                <Typography variant="h5" color="inherit" paragraph>
                  Teacher: {classData.classOwner.name}
                </Typography>
                {isTeacher && (
                  <Typography variant="h5" color="inherit">
                    Code to join class: {classData.invitationCode}
                    <Tooltip title={isCopiedJoinCode ? 'Link is copied!' : 'Copy join code'} arrow onClick={handleCopyJoinCode}>
                      <IconButton aria-label="copy" color="inherit" sx={{mb : 1}}>
                        {isCopiedJoinCode ? <ContentPasteIcon /> : <FileCopyIcon />}
                      </IconButton>
                    </Tooltip>
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {isTeacher && (
            <Tooltip title={isCopied ? 'Link is copied!' : 'Copy invite link'} arrow onClick={handleCopy}>
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                }}
                color="inherit"
              >
                {isCopied ? <ContentPasteIcon /> : <ShareIcon />}
              </IconButton>
            </Tooltip>
          )}

        </Paper>

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="People" {...a11yProps(0)} />
              <Tab label="Grades" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <PeopleList />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <GradePanel />
          </CustomTabPanel>

        </Box>
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
  );
}
