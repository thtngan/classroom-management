import React, { useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AuthService from "../services/auth.service";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {ref} from "yup";
import LoadingButton from "@mui/lab/LoadingButton";
import {IconButton, InputAdornment} from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const initialValues = {
  name: '',
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const validationSchema = Yup.object({
  name: Yup.string().required('Code is required').max(6, 'Code must be at most 6 characters'),
  password: Yup.string().required('Password is required')
    .matches(passwordRegex, 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character. It must be at least 6 characters long'),
  confirmPassword: Yup.string().required("Confirm password is required!")
    .oneOf([ref("password")], "Passwords do not match"),
});

export default function ResetPwd() {
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const defaultTheme = createTheme();
  const location = useLocation();
  const email = location.state.email;

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

  const handleResendCode = async () => {

    await AuthService.forgotPwd({email: email})
      .then(
        () => {
          showAlert('Send email successful', 'success');
          console.log(email)

        },
        (error) => {
          console.log(error)
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again.', 'error');
        }
      );
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);

    await AuthService.resetPwd({email: email, userToken : values.name, password: values.password})
      .then(
      () => {
        showAlert('Change password successful', 'success');
        setTimeout(() => {
          navigate('/login');
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
            <PasswordOutlinedIcon />
          </Avatar>
          <Typography style={{ marginBottom: 1 + 'em' }} component="h1" variant="h5">
            Reset Your Password
          </Typography>

          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            <Form>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="name"
                    label="Verification Code"
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
                    id="password"
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    error={Boolean(validationSchema.fields.password && validationSchema.fields.password.errors)}
                    helperText={<ErrorMessage name="password" component="div" className="error-message" />}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    fullWidth
                    id="confirmPassword"
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    error={Boolean(validationSchema.fields.password && validationSchema.fields.password.errors)}
                    helperText={<ErrorMessage name="confirmPassword" component="div" className="error-message" />}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <LoadingButton
                type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                loading={loading}
              >
                <span>Reset Password</span>
              </LoadingButton>
            </Form>
          </Formik>
          <Link onClick={handleResendCode}  style={{ cursor: 'pointer' }} variant="body2">
            Resend code
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