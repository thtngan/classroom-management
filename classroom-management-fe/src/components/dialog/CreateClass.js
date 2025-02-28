import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {Field, Form, Formik} from "formik";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import * as Yup from "yup";
import ClassService from "../../services/class.service";
import {useUserStore} from "../../context/UserStoreProvider";
import {useState} from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {useNavigate} from "react-router-dom";

const initialValues = {
  name: '',
};

const validationSchema = Yup.object({
  name: Yup.string().required('Class name is required'),
});

export default function CreateClass({open, setOpen}) {
  const { user, setIsTeacherStatus } = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [nameError, setNameError] = React.useState('');
  const [alertProps, setAlertProps] = useState({
    open: false,
    message: '',
    severity: 'success', // Default to success
  });
  const [formData, setFormData] = React.useState({
    name: '',
    section: '',
    subject: '',
    room: '',
  });

  const handleClose = () => {
    setOpen(false);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'name') {
      setNameError(value.trim() ? '' : 'Class name is required');
    }
  };

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

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (formData.name.trim()) {
      console.log('Form data:', formData);
    } else {
      setNameError('Class name is required');
    }

    await ClassService.createClass({
      className: formData.name,
      section: formData.section,
      subject: formData.subject,
      room: formData.room,
      teacherId: user.id})
      .then(
        (data) => {
          showAlert('Create class successful', 'success');
          handleClose();
          setIsTeacherStatus(true)
          navigate('/class/' + data.data.data.classCode);
          window.location.reload();
        },
        (error) => {
          console.log(error)
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        }
      ).finally(() => {
        setLoading(false)
      });
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create class</DialogTitle>
        <DialogContent >
          <Formik initialValues={initialValues} validationSchema={validationSchema}>
            <Form>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Field sx={{mt: 2}}
                    as={TextField}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    id="name"
                    label="Class name"
                    name="name"
                    required
                    error={Boolean(nameError)}
                    helperText={nameError}
                    value={formData.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    id="section"
                    label="Section"
                    name="section"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    id="subject"
                    label="Subject"
                    name="subject"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    id="room"
                    label="Room"
                    name="room"
                  />
                </Grid>
              </Grid>
            </Form>
          </Formik>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton type="submit" variant="contained" loading={loading} onClick={handleSubmit}>
            <span>Create</span>
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

    </React.Fragment>
  );
}
