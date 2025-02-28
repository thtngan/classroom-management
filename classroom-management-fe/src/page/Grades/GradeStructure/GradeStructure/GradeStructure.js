import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from '@mui/material/Paper';
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {useEffect, useState} from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import GradeStructureEdit from "./GradeStructureEdit";
import LoadingButton from "@mui/lab/LoadingButton";
import ClassService from "../../../../services/class.service";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import {LinearProgress} from "@mui/material";
import {useUserStore} from "../../../../context/UserStoreProvider";
import GradeStructureTeacherView from "./GradeStructureTeacherView";
import GradeStructureStudentView from "./GradeStructureStudentView";
import GradeService from "../../../../services/grade.service";

export default function GradeStructure() {
  const { isTeacher, user } = useUserStore();
  const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL
  const [loading, setLoading] = React.useState(false);
  const [view, setView] = React.useState(true);
  const [loadingGrade, setLoadingGrade] = React.useState(false);
  const [gradeComposition, setGradeComposition] = useState([]);
  const [gradeDetails, setGradeDetails] = useState([]);
  const [gradeArr, setGradeArr] = useState([]);
  const [totalGrade, setTotalGrade] = useState(-1);
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

  const handleEditForm = () => {
    setView(!view);
  };

  const onDragEnd = (result) => {
    if (!view) {
      if (!result.destination) return;

      const items = Array.from(gradeComposition);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setGradeComposition(items);
    }
  };

  const handleDataChange = (newDataName, newDataScale, gradeId) => {
    const updatedGrades = gradeComposition.map((grade) =>
      grade.id === gradeId ? { ...grade, name: newDataName, gradeScale: parseFloat(newDataScale) } : grade
    );

    let totalScale = 0;
    for (const grade of updatedGrades) {
      if (!isNaN(grade.gradeScale)) {
        totalScale += parseFloat(grade.gradeScale);
      }
    }

    if (totalScale > 100) {
      showAlert('Total grade scale exceeds 100%', 'error');
    }

    setGradeComposition(updatedGrades);
  };

  const handleAddData = (newDataName, newDataScale, gradeId) => {
    // Find the maximum gradeId in the existing grades
    const maxGradeId = Math.max(...gradeComposition.map((grade) => grade.id), 0);

    // Create a new object with the next gradeId
    const newGrade = {
      id: maxGradeId + 1,
      gradeName: newDataName,
      gradeScale: newDataScale,
      code: null
    };

    setGradeComposition((prevGrades) => [...prevGrades, newGrade]);
  };

  const handleDeleteDataByGradeId = (gradeId) => {
    if (gradeComposition.length === 1) {
      showAlert('Grade composition can not be null', 'error');
    } else {
      const updatedGrades = gradeComposition.filter((grade) => grade.id !== gradeId);
      setGradeComposition(updatedGrades);
    }
  };

  const fetchData = async () => {
    if (classCode) {
      await ClassService.getGradeCompositionByClassCode({ classCode: classCode})
        .then((data) => {
          setLoading(false);

          // console.log(data.data.data)
          const newGrades = data.data.data.gradeCompositions.map((grade, index) => ({
            name: grade.name,
            gradeScale: grade.gradeScale,
            position: grade.position,
            id: grade.position,
            code: grade.id,
            finalized: grade.finalized
          }));
          setGradeComposition(newGrades)
          console.log(newGrades)

          setLoadingGrade(false);
        }, (error) => {
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        })
      ;
    }

    if (!isTeacher) {
      if (user.studentId) {

        await GradeService.getGradeByClassCodeAndStudentId({ classCode: classCode, studentId : user.studentId})
          .then((data) => {
            setLoadingGrade(true);

            // setLoading(false);

            console.log(data.data.data)
            const newGrades = {};
            const {fullName, studentId, ...listGrades} = data.data.data

            for (const [gradeName, gradeValue] of Object.entries(listGrades)) {
              newGrades[gradeName] = gradeValue;
              // for (const gradeComp of gradeComposition) {
              //   if (gradeComp.code === gradeName && gradeValue !== -1) {
              //     gradeTotal += gradeValue * gradeComp.gradeScale / 100;
              //   }
              // }
            }
            // const gradeToSet = Number(gradeTotal.toFixed(2))

            // setTotalGrade(gradeToSet)
            setGradeDetails(newGrades);
            setGradeArr(data.data.data)
            setLoadingGrade(false);

          }, (error) => {
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          })
        ;
      } else {
        showAlert('Please update your student ID to view your grade', 'error');
      }
    }

  };

  useEffect(() => {
    setLoadingGrade(true);
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const calculateTotalGrade = () => {
      if (!isTeacher && user.studentId) {
        let gradeTotal = 0;

        for (const [gradeName, gradeValue] of Object.entries(gradeArr)) {
          for (const gradeComp of gradeComposition) {
            if (gradeComp.code === gradeName && gradeValue !== -1) {
              gradeTotal += gradeValue * gradeComp.gradeScale / 100;
            }
          }
        }

        const gradeToSet = Number(gradeTotal.toFixed(2));
        setTotalGrade(gradeToSet);
        console.log(gradeToSet)
      }
    };

    calculateTotalGrade();
    // eslint-disable-next-line
  }, [gradeArr]);

  const handleSubmit = async () => {
    let totalScale = 0;
    for (const grade of gradeComposition) {
      if (!isNaN(grade.gradeScale))
        totalScale += parseFloat(grade.gradeScale);
    }

    if (totalScale !== 100) {
      showAlert('Total grade scale must be equal 100%', 'error');
    } else {
      setLoading(true);
      const newGrades = gradeComposition.map((grade, index) => ({
        name: grade.name,
        gradeScale: grade.gradeScale,
        position: index + 1,
        id: grade.code
      }));


      await ClassService.updateGradeCompositionByClassCode({gradeCompositions : newGrades, classCode})
        .then((data) => {
          showAlert('Save grade structure successful', 'success');
          setView(true);
          console.log(data.data.data)
          const newGrades = data.data.data.class.gradeCompositions.map((grade, index) => ({
            name: grade.name,
            gradeScale: grade.gradeScale,
            position: grade.position,
            id: grade.position,
            code: grade.id,
            finalized: grade.finalized
          }));
          setGradeComposition(newGrades)

        }, (error) => {
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        }).finally(setLoading(false))
    }
  }

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
                Grade Structure
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid style={{paddingTop: '15px'}}>
          {isTeacher
            ?
            view ? (
              <>
                {gradeComposition.map((grade, index) => (
                  <GradeStructureTeacherView dataName={grade.name} dataScale={grade.gradeScale} data={grade}
                                             dataFinal={grade.finalized} reloadData={fetchData}
                  />
                ))}
              </>
              ) :
            (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {gradeComposition.map((grade, index) => (
                      <Draggable
                        key={grade.id}
                        draggableId={grade.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            <Paper elevation={2} style={{width:'100%' , marginTop: '10px', borderLeft: '10px solid' +
                                ' teal'}}>
                              <Box style={{display: 'flex',flexDirection:'column', alignItems:'flex-start', marginLeft: '20px', marginRight: '20px', paddingTop: '20px', paddingBottom: '10px'}}>
                                <GradeStructureEdit dataName={grade.name} dataScale={grade.gradeScale}
                                                    dataId={grade.id}
                                                    viewData={view}
                                                    onDataChange={handleDataChange}
                                                    onDeleteData={handleDeleteDataByGradeId}
                                />
                              </Box>
                            </Paper>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <>
              {gradeComposition.map((grade, index) => (
                <GradeStructureStudentView data={grade} gradeData={gradeDetails} showAlert={showAlert}

                />
              ))}
              {totalGrade !== -1 && (
                <Typography variant="h6" style={{ textAlign: 'right', color: 'teal', paddingTop: "15px" }}>
                  <strong>Total: </strong>{totalGrade}
                </Typography>
              )}

            </>
          )}
        </Grid>

        {view
          ? isTeacher && (
          <Stack spacing={2} direction="row"
                 style={{paddingTop: '15px'}}
                 justifyContent="center"
                 alignItems="center"
          >
            <Button variant="contained" style={{ backgroundColor: 'teal', color: 'white' }}
                    onClick={handleEditForm}
            >
              EDIT
            </Button>
          </Stack>
        ) : (
          <Stack spacing={2} direction="row"
                 style={{paddingTop: '15px'}}
                 justifyContent="center"
                 alignItems="center"
          >
            <Button variant="outlined" style={{ borderColor: 'teal', color: 'teal' }}
                    onClick={() => handleAddData('', '')}
            >
              ADD
            </Button>
            <LoadingButton
              type="submit" variant="contained" style={{ backgroundColor: 'teal', color: 'white' }}
              loading={loading}
              onClick={handleSubmit}
            >
              <span>SAVE</span>
            </LoadingButton>
          </Stack>
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