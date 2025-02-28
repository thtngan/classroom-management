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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {useState} from "react";
import {read, utils, writeFile} from "xlsx";
import PreUploadStudentTable from "./PreUploadStudentTable";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import GradeService from "../../../../services/grade.service";
import LoadingButton from "@mui/lab/LoadingButton";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ImportStudentFile({open, setOpen, onReloadTable}) {
  const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL
  const [datas, setDatas] = useState([]);
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

  const handleClose = () => {
    setOpen(false);
    setDatas([])
  };
  const importFile = (event) => {
    const files = event.target.files;

    console.log(files)

    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          setDatas(rows)
          console.log(rows)

        }
      }
      reader.readAsArrayBuffer(file);
    }
  };

  const downloadTemplate = () => {
    const headings = [[
      'StudentId',
      'FullName'
    ]];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, 'Student Template.xlsx');
  }

  const handleImportData = async () => {
    setLoading(true);

    const students = datas.map((d) => ({
      studentId: d.StudentId,
      fullName: d.FullName
    }));

    await GradeService.createGrade({
      students : students, classCode : classCode
    })
      .then(
        () => {
          showAlert('Import data successful', 'success');
          onReloadTable();
          handleClose();
        },
        (error) => {
          console.log(error)
          showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
        }
      ).finally(() => {
        setLoading(false)
      });

  }


  return (
    <React.Fragment>
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
              Import Student
            </Typography>
            <LoadingButton
              onClick={handleImportData}
              variant="outlined"
              sx={{
                borderColor: 'white', color: 'white',
                '&:hover': {
                  backgroundColor: 'transparent',
                  borderColor: 'white',
                },
              }}
              loading={loading}
            >
              <span>Import</span>
            </LoadingButton>
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
            Want to import student list?
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
          <Typography gutterBottom>
            Once you have filled the template out, upload the file here
          </Typography>

          <label htmlFor="btn-upload">

            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}
                    style={{paddingTop : "8px", fontSize: "72"}}
            >
              <input type="file" name="file" className="custom-file-input" id="inputGroupFile" required onChange={importFile}
                     accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>
            </Button>
          </label>
        </Box>

        <Typography style={{
          padding: "24px 18px",
          margin: "5px 18px",
        }}
                    variant="h5"
          gutterBottom
        >
          View your student list before importing them:
        </Typography>

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
          <PreUploadStudentTable data={datas}/>
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