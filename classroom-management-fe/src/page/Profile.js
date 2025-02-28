import React, {useState} from 'react';
import {Formik, Field, Form, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './Register.css';
import AuthService from "../services/auth.service";
import { toast } from 'react-toastify'
import LoadingButton from '@mui/lab/LoadingButton';
import { InputAdornment} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from "@mui/icons-material/Google";
import {useUserStore} from "../context/UserStoreProvider";

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(25, 'Name must be at most 25 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});
const Profile = () => {
  const { user, updateProfile } = useUserStore();
  const [loading, setLoading] = React.useState(false);
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

            updateProfile(data.data.data)
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

  var initialValues = {
    name : user.name,
    email: user.email,
    studentId: user.studentId
  };

  if (user.socialLogins.length > 0) {
    initialValues = {
      name : user.name,
      email: user.email,
      studentId: user.studentId,
      socialLoginId: user.socialLogins[0].socialId
    };
  }
  console.log(initialValues)

  return (
    <>
      <CssBaseline />
      <main>
        <Container maxWidth="md">
          <Box
            sx={{
              marginTop: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <AccountCircleIcon />
            </Avatar>
            <Typography style={{ marginBottom: 1 + 'em' }} component="h1" variant="h5">
              Profile Detail
            </Typography>
            <Formik initialValues={initialValues}
                    enableReinitialize
                    validationSchema={validationSchema} onSubmit={handleSubmit}>
              <Form>
                <Grid container spacing={2.5}>
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
                      disabled={Boolean(initialValues.studentId)}
                    />
                  </Grid>
                  {user.socialLogins.length > 0 && (
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
          </Box>
        </Container>
      </main>

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
};

export default Profile;