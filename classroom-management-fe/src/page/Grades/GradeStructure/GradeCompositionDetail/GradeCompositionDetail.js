import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import Box from "@mui/material/Box";
import {read, utils, writeFile} from "xlsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Container from "@mui/material/Container";
import {LinearProgress} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {useEffect, useState} from "react";
import GradeService from "../../../../services/grade.service";
import PreUploadGradeTable from "./PreUploadGradeTable";
import FinalizeComfirmDialog from "./FinalizeComfirmDialog";
import Stack from "@mui/material/Stack";
import ClassService from "../../../../services/class.service";
import NotificationService from "../../../../services/notification.service";
import {useUserStore} from "../../../../context/UserStoreProvider";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function GradeCompositionDetail({grade, reloadData}) {
  const { user } = useUserStore();
  const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL
  const [open, setOpen] = React.useState(false);
  const [studentIdList, setStudentIdList] = React.useState([]);
  const [rows, setRows] = React.useState([]);
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


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const downloadTemplate = () => {
    const headings = [[
      'StudentId',
      'Grade'
    ]];
    // console.log(studentIdList)
    const data = studentIdList.map((studentId, index) => ({ studentId }));

    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, 'Grade Template.xlsx');
  }
  const importFile = (event) => {
    const files = event.target.files;

    // console.log(files)

    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          // setDatas(rows)
          // console.log(rows)

          var rowData = [];
          rows.forEach((row, index) => {
          rowData.push({
            student: {
              studentId: row.StudentId
            },
            grades: [ {
              grade :    row.Grade
            }
            ]
            });
          });

          // console.log(rowData)
          setRows(rowData)
        }
      }
      reader.readAsArrayBuffer(file);
    }
  };

  const handleImportGrade = async () => {
    var rowData = []
    // console.log(name)
    // eslint-disable-next-line
    rows.map((row, index) => {
      // console.log(row)
      var obj = {
        studentId: row.student.studentId
      }
      obj[grade.name] = row.grades[0].grade

      rowData.push(obj)
    })
    // console.log(rowData)

    await GradeService.updateGradesByClassCodeAndStudentId({
      classCode: classCode, gradesToUpdate: rowData
    })
      .then((data) => {
        // console.log(data);
        showAlert('Updated successful', 'success');
        // setLoading(false)
      }, (error) => {
        console.log(error)
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        return false;
      });
    handleClose()
  }

  const handleFinalizeGrade = async () => {
    setLoading(true);
    if (grade) {
      // console.log(grade.code)

      await ClassService.updateFinalizeInGradeComposition({gradeCompositionId: grade.code, classCode})
        .then(async (data) => {
          // console.log(data.data.data);
          showAlert('Finalize this grade success', 'success');
          setLoading(false)

          const className = localStorage.getItem("className");
          const studentIds = JSON.parse(localStorage.getItem("studentIds"));
          const msg = "Grade composition has been finalized for class "+ className + " by " + user.name + ".";
          await NotificationService.createNotification({
            senderId: user.id,
            receiverIds: studentIds,
            classCode: classCode,
            type: "grade_composition_finalized",
            message: msg
          })
            .then(
              (data) => {
                console.log(data.data.data)
                showAlert('Create a notification to your students successully', 'success');

              },
              (error) => {
                console.log(error)
                showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
              }
            );
          reloadData();
        }, (error) => {
          console.log(error)
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        })
      ;
    }

  }

  useEffect(() => {
    const fetchData = async () => {

      if (grade) {
        await GradeService.getGradesByGradeComposition({ gradeComposition: grade.code})
          .then((data) => {
            // console.log(data.data.data);

            var rowData = []
            var studentIds = [];

            data.data.data.forEach((row, index) => {
              rowData.push({
                ...row,
                id : index + 1
              })
              studentIds.push(row.student.studentId);
            })
            // console.log(rowData)
            // console.log(studentIds)

            setRows(rowData)
            setStudentIdList(studentIds)

            setLoading(false)
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
    <React.Fragment>
      {/*{console.log(grade)}*/}

      <Button variant="outlined" onClick={handleClickOpen} style={{ borderColor: 'teal', color: 'teal' }}>
        View
      </Button>

      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Grade Detail of {grade.name}
            </Typography>
            {!grade.finalized && (
              <FinalizeComfirmDialog clickAgree={handleFinalizeGrade}/>
            )}

          </Toolbar>
        </AppBar>
        <Box elevation={2}
             style={{
               border: '1px dashed ',
               borderRadius: 10,
               backgroundColor: '#eaeaea', // Light grey background color
               padding: "24px 18px",
               margin: "24px 18px",
             }}
        >
          <Typography gutterBottom>
            Want to import grade list? Download the lastest list of student here
          </Typography>
          <Button size="small"
                  onClick={downloadTemplate}
          >
            Download the template
          </Button>
        </Box>



        <Box elevation={2}
             style={{
               border: '1px dashed ',
               borderRadius: 10,
               backgroundColor: '#eaeaea', // Light grey background color
               padding: "24px 18px",
               display: 'flex',          // Add display: flex
               flexDirection: 'column',  // Adjust flexDirection as needed
               alignItems: 'center',
               margin: "0px 18px",
             }}
        >
          {grade.finalized ? (
            <Typography
              variant="h5"
              gutterBottom
            >
              This grade is final so you can not import data anymore.
            </Typography>
          ) : (
            <>
              <Typography gutterBottom>
                Once you have filled the template out, upload the file here
              </Typography>

              <label htmlFor="btn-upload">

                <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}
                        style={{paddingTop : "8px", paddingBottom : "8px", fontSize: "72"}}
                        disabled={studentIdList.length === 0}
                >
                  <input type="file" name="file" className="custom-file-input" id="inputGroupFile" required onChange={importFile}
                         accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>
                </Button>
              </label>

              <Box style={{ display: 'flex', alignItems: 'center', marginTop: "15px" }}>
                <Typography gutterBottom>
                  Review the newly imported data from the file:&nbsp;&nbsp;&nbsp;&nbsp;
                </Typography>

                <Stack spacing={2} direction="row"
                       justifyContent="center"
                       alignItems="center"
                >
                  <Button variant="outlined" onClick={handleImportGrade}
                          disabled={studentIdList.length === 0}
                  >
                    Save
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Box>

        <Box style={{
          padding: "24px 18px",
          margin: "5px 18px",
        }}>
          <Typography
            variant="h5"
            gutterBottom
          >
            View your student list:
          </Typography>
        </Box>


        <Box elevation={2}
             style={{
               border: '1px dashed ',
               borderRadius: 10,
               padding: "24px 18px",
               display: 'flex',          // Add display: flex
               flexDirection: 'column',  // Adjust flexDirection as needed
               alignItems: 'center',
               margin: "0px 18px",
             }}
        >
          <PreUploadGradeTable grade={rows}/>
        </Box>

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
