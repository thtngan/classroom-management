import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from '@mui/material/Paper';
import {useEffect, useState} from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import {LinearProgress} from "@mui/material";
import GradeReviewServices from "../../../services/grade.review.services";
import {useUserStore} from "../../../context/UserStoreProvider";
import GradeStudentView from "./GradeStudentView";
import GradeTeacherView from "./GradeTeacherView/GradeTeacherView";
import FilterListStudent from "./GradeTeacherView/FilterListStudent";
import GradeService from "../../../services/grade.service";

export default function GradeReview() {
  const { isTeacher, user } = useUserStore();
  const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL
  const [loadingGrade, setLoadingGrade] = React.useState(false);
  const [gradeReviews, setGradeReviews] = React.useState([]);
  const [studentList, setStudentList] = React.useState([]);
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
    if (classCode) {
      if (isTeacher) {
        await GradeReviewServices.getGradeReviewsByClassCode({
          classCode: classCode
        })
          .then((data) => {
            setLoadingGrade(false);
            // console.log(data.data.data)
            setGradeReviews(data.data.data)
          }, (error) => {
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          })
        ;

        await GradeService.getGradesByClassCode({ classCode: classCode})
          .then((data) => {
            // console.log(data.data.data);
            setStudentList(data.data.data);
          }, (error) => {
            console.log(error)
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          })
        ;


      } else {
        await GradeReviewServices.getGradeReviewsByClassCodeAndStudentId({
          classCode: classCode,
          studentId: user.id
        })
          .then((data) => {
            setLoadingGrade(false);

            console.log(data.data.data)
            setGradeReviews(data.data.data)

          }, (error) => {
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          })
        ;
      }

    }
  };

  useEffect(() => {
    setLoadingGrade(true);
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleFilterData = async (personName) => {
    // console.log(personName)
    setLoadingGrade(true);

    await GradeReviewServices.getGradeReviewsByClassCodeAndStudentIds({
      classCode: classCode,
      studentIds: personName
    })
      .then((data) => {
        setLoadingGrade(false);

        console.log(data.data.data)
        setGradeReviews(data.data.data)

      }, (error) => {
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
      });


  };

  const handleReload = async () => {
    setLoadingGrade(true);
    fetchData();
  };


  if (loadingGrade) {
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
    <Box sx={{ width: '100%' }}>
      <Grid style={{width: '100%'}}>
        <Grid style={{borderTop: '10px solid teal', borderRadius: 10}}>
          <Paper elevation={2} style={{width:'100%'}}>
            <Box style={{display: 'flex',flexDirection:'column', alignItems:'flex-start', marginLeft: '15px', paddingTop: '20px', paddingBottom: '20px'}}>
              <Typography variant="h4" style={{fontFamily:'sans-serif Roboto', marginBottom:"15px"}}>
                Grade Review
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {isTeacher ? (
          <>
            <Grid style={{paddingTop: '15px'}}>
              <Paper elevation={2} style={{width:'100%' , marginTop: '10px', borderLeft: '10px solid' +
                  ' teal', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              >
                <FilterListStudent studentList={studentList} handleFilterData={handleFilterData}/>

              </Paper>
              {gradeReviews.map((grade, index) => (
                <GradeTeacherView gradeReview={grade} onReload={handleReload} />
              ))}
            </Grid>
          </>
        ) : (
          <>
            <Grid style={{paddingTop: '15px'}}>
              {gradeReviews.map((grade, index) => (
                <GradeStudentView gradeReview={grade} />
              ))}
            </Grid>
          </>
        )}


      </Grid>

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
    </Box>
  );
}