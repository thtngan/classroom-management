import * as React from 'react';
import {
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {useState} from "react";
import Container from "@mui/material/Container";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import LoadingButton from "@mui/lab/LoadingButton";
import AuthService from "../../../services/auth.service";
import {ErrorMessage, Field, Form, Formik} from "formik";
import Grid from "@mui/material/Grid";
import GoogleIcon from "@mui/icons-material/Google";
import * as Yup from "yup";
import {toast} from "react-toastify";
import LockIcon from '@mui/icons-material/Lock';
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import LockOpenIcon from '@mui/icons-material/LockOpen';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(25, 'Name must be at most 25 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export default function AdminUserDetail({userDetail, clickRow, reloadTable}) {
  const [loading, setLoading] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
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

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log(values)

    setLoading(true);
    await toast.promise(AuthService.updateProfile({
        email: values.email,
        studentId: values.studentId,
        name: values.name
      })
        .then((data) => {
            showAlert('Update profile successful', 'success');
            console.log(data.data.data)
            reloadTable();
          },
          (error) => {
            showAlert(error.response.data.error.message || 'Error during update profile. Please try again.', 'error');
          }
        ).finally(() => {
          setSubmitting(false);
          setLoading(false)
        })
      , {
        pending: 'Registering...',
      })
  };

  const handleBanUser = async () => {

    setLoading(true);
    await AuthService.banUser({
        email: userDetail.email
      })
        .then((data) => {
            showAlert('Ban user successful', 'success');
            console.log(data.data.data)
          reloadTable();
          },
          (error) => {
            showAlert(error.response.data.error.message || 'Error during update profile. Please try again.', 'error');
          }
        ).finally(() => {
          setLoading(false)
        })
  };

  const handleActiveUser = async () => {

    setLoading(true);
    await AuthService.activeUserAdmin({
      email: userDetail.email
    })
      .then((data) => {
          showAlert('Active user successful', 'success');
          console.log(data.data.data)
        reloadTable()
        },
        (error) => {
          showAlert(error.response.data.error.message || 'Error during update profile. Please try again.', 'error');
        }
      ).finally(() => {
        setLoading(false)
      })
  };

  var initialValues = {
    name : userDetail.name,
    email: userDetail.email,
    studentId: userDetail.studentId
  };

  if (userDetail.socialLogins.length > 0) {
    initialValues = {
      name : userDetail.name,
      email: userDetail.email,
      studentId: userDetail.studentId,
      socialLoginId: userDetail.socialLogins[0].socialId
    };
  }

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
      <Formik initialValues={initialValues}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
      >
        <Form>
          <Grid container spacing={2.5}>
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Stack spacing={2} direction="row">
                <Button variant="outlined" startIcon={<LockIcon />} color="error"
                        onClick={handleBanUser}
                >
                  BAN&nbsp;&nbsp;&nbsp;
                </Button>
                <Button variant="outlined" startIcon={<LockOpenIcon />} color="success"
                        onClick={handleActiveUser}
                >
                  ACTIVE
                </Button>

              </Stack>

            </Grid>

            <Grid item xs={12}>
              <Field
                as={TextField}
                variant="outlined"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                required
                disabled
                error={Boolean(validationSchema.fields.email && validationSchema.fields.email.errors)}
                helperText={<ErrorMessage name="email" component="div" className="error-message" />}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                variant="outlined"
                fullWidth
                id="name"
                label="Name"
                name="name"
                required
                error={Boolean(validationSchema.fields.name && validationSchema.fields.name.errors)}
                helperText={<ErrorMessage name="name" component="div" className="error-message" />}
              />
            </Grid>
            <Grid item xs={12}>
              <Field
                as={TextField}
                variant="outlined"
                fullWidth
                id="studentId"
                label="Student ID"
                name="studentId"
                helperText={<ErrorMessage name="studentId" component="div" className="error-message" />}
              />
            </Grid>
            {userDetail.socialLogins.length > 0 && (
            <Grid item xs={12}>
              <Field
                as={TextField}
                variant="outlined"
                fullWidth
                disabled
                id="socialLoginId"
                label="Social Login"
                name="socialLoginId"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GoogleIcon color="primary"/>
                    </InputAdornment>
                  ),
                  readOnly: true,
                }}
                error={Boolean(validationSchema.fields.email && validationSchema.fields.email.errors)}
                helperText={<ErrorMessage name="socialLoginId" component="div" className="error-message" />}
              />
            </Grid>
            )}


          </Grid>
          <LoadingButton
            type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
            loading={loading}
          >
            <span>Save</span>
          </LoadingButton>
        </Form>
      </Formik>



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
