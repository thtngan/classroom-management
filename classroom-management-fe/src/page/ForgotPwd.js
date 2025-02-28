import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AuthService from "../services/auth.service";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import LoadingButton from "@mui/lab/LoadingButton";

const initialValues = {
  email: '',
};

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export default function ForgotPwd() {
  const navigate = useNavigate();
  const defaultTheme = createTheme();
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
    }, 4000);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const email = values.email;
    setLoading(true);

    await AuthService.forgotPwd({email: email})
      .then(
      () => {
        showAlert('Send email successful', 'success');
        setTimeout(() => {
          navigate('/reset-password',{state:{ email : email }});
        }, 800);

      },
      (error) => {
        console.log(error)
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again.', 'error');
      }
    ).finally(() => {
        setSubmitting(false);
        setLoading(false)
      });

  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockResetOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Forgot your Password
          </Typography>
          <Typography style={{ marginBottom: 2 + 'em' }} component="body" variant="body">
            We’ll send you an email with verification code.
          </Typography>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            <Form>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    style={{ width: '400px' }}
                    id="email"
                    label="Email Address"
                    name="email"
                    required
                    error={Boolean(validationSchema.fields.email && validationSchema.fields.email.errors)}
                    helperText={<ErrorMessage name="email" component="div" className="error-message" />}
                  />
                </Grid>
              </Grid>
              <LoadingButton
                type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                loading={loading}
              >
                <span>Request code</span>
              </LoadingButton>
            </Form>
          </Formik>
          <Link href="login" variant="body2">
            Back to sign in
          </Link>

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

    </ThemeProvider>
  );
}