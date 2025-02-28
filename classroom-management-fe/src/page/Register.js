import React, { useState } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './Register.css';
import AuthService from "../services/auth.service";
import {ref} from "yup";
import { toast } from 'react-toastify'
import ActiveCodeDialog from "../components/dialog/ActiveCodeDialog";
import LoadingButton from '@mui/lab/LoadingButton';
import {IconButton, InputAdornment} from "@mui/material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

const defaultTheme = createTheme();

const initialValues = {
  name: '',
  email: ''
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').max(25, 'Name must be at most 25 characters'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required')
    .matches(passwordRegex, 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character. It must be at least 6 characters long'),
  confirmPassword: Yup.string().required("Confirm password is required!")
    .oneOf([ref("password")], "Passwords do not match"),
});
const Register = () => {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);
    await toast.promise(AuthService.register({name: values.name, email: values.email, password: values.password})
        .then(() => {
            showAlert('Sign-up successful', 'success');
            setDialogOpen(true);
            setEmail(values.email)
          },
          (error) => {
            showAlert(error.response.data.error.message || 'Error during sign-up. Please try again.', 'error');
          }
        ).finally(() => {
          setSubmitting(false);
          setLoading(false)
      })
      , {
      pending: 'Registering...',
    })

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
            <LockOutlinedIcon />
          </Avatar>
          <Typography style={{ marginBottom: 1 + 'em' }} component="h1" variant="h5">
            Sign up
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
                    id="email"
                    label="Email Address"
                    name="email"
                    required
                    error={Boolean(validationSchema.fields.email && validationSchema.fields.email.errors)}
                    helperText={<ErrorMessage name="email" component="div" className="error-message" />}
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
                <span>Sign Up</span>
              </LoadingButton>
            </Form>
          </Formik>
          <Link href="/login" variant="body2">
            Already have an account? Sign in
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

      <ActiveCodeDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} email={email}/>

    </ThemeProvider>
  );
};

export default Register;