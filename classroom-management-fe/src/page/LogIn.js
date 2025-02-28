import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AuthService from "../services/auth.service";
import {ErrorMessage, Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {Divider} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import FacebookIcon from "@mui/icons-material/Facebook";
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { InputAdornment, IconButton } from '@mui/material';
import Stack from "@mui/material/Stack";
import {useUserStore} from "../context/UserStoreProvider";

const initialValues = {
  email: '',
  password: ''
};

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required')
});

const googleStyle = {
  background: '#db3236',
  width: '165px',
  height: '35px',
  color: 'white',
  border: '0px transparent',
  '&:hover': {
    background: '#3b5998',
    opacity: 1,
  },
};

const facebookStyle = {
  background: '#3b5998',
  width: '165px',
  height: '35px',
  color: 'white',
  border: '0px transparent',
  '&:hover': {
    opacity: 1,
  },
};

export default function LogIn() {
  const location = useLocation();
  const from = location.state?.from || "/";
  const { loginUser } = useUserStore();
  const navigate = useNavigate();
  const defaultTheme = createTheme();
  const [loading, setLoading] = React.useState(false);
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

  useEffect(() => {
    const msgDialog = localStorage.getItem('msgDialog');
    if (msgDialog) {
      showAlert(msgDialog, 'error');
      localStorage.removeItem('msgDialog')
    }
  })

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    const email = values.email;
    const password = values.password;

    await AuthService.login({email: email, password: password})
      .then(
      (data) => {
        showAlert('Sign-in successful', 'success');
        const user = data.data.data;
        console.log(user)

        loginUser({
          email: user.email,
          id: user.id,
          name: user.name,
          studentId: user.studentId,
          token: user.accessToken,
          socialLogins: user.socialLogins
        });

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 800);

      },
      (error) => {
        console.log(error)

        if (error.response && error.response.status === 401) {
          showAlert(error.response.data.error.message || 'Invalid email or password. Please try again.', 'error');
        } else {
          showAlert('An unexpected error occurred. Please try again later.', 'error');
        }
      }
    ).finally(() => {
        setSubmitting(false);
        setLoading(false)
      });

  };

  const handleGoogleSignIn = async () => {
    await AuthService.googleLogin();
  }

  const handleFacebookSignIn = async () => {
    await AuthService.facebookLogin();
  }

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
            <LockOpenOutlinedIcon />
          </Avatar>
          <Typography style={{ marginBottom: 1 + 'em' }} component="h1" variant="h5">
            Sign in
          </Typography>
          <Stack direction="row" spacing={2} >
            <Button variant="contained" style={googleStyle} onClick={handleGoogleSignIn}>
              <GoogleIcon />
            </Button>

            <Button variant="contained" style={facebookStyle} onClick={handleFacebookSignIn}>
              <FacebookIcon />
            </Button>

          </Stack>
        </Box>

        <Divider sx={{ my : 3}}> OR </Divider>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
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
              </Grid>
              <LoadingButton
                type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}
                loading={loading}
              >
                <span>Sign In</span>
              </LoadingButton>

              <Grid container>
                <Grid item xs>
                  <Link href={"/forgot-password"} variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="/register" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Form>
          </Formik>
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