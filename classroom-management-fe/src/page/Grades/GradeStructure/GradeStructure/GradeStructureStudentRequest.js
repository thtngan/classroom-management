import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddCommentIcon from '@mui/icons-material/AddComment';
import LoadingButton from "@mui/lab/LoadingButton";
import GradeReviewServices from "../../../../services/grade.review.services";
import {useUserStore} from "../../../../context/UserStoreProvider";
import NotificationService from "../../../../services/notification.service";

export default function GradeStructureStudentRequest({grade, currentGrade, showAlert}) {
  const { user } = useUserStore();
  const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [expectGrade, setExpectGrade] = React.useState(0);
  const [explanation, setExplanation] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSendRequest = async () => {
    setLoading(true);
    console.log(expectGrade)
    if (!expectGrade || expectGrade === null) {
      showAlert('Please enter an expect grade.', 'error');
      setLoading(false)
    } else {
      await GradeReviewServices.createGradeReview({
        classCode: classCode,
        gradeCompositionId: grade.code,
        studentId: user.id,
        currentGrade: currentGrade,
        expectationGrade : expectGrade,
        explanation: explanation,
      })
        .then(
          async (data) => {
            console.log(data.data.data)
            showAlert('Request a review successully', 'success');
            const className = localStorage.getItem("className");
            const teacherIds = JSON.parse(localStorage.getItem("teacherIds"));
            const msg = "A grade review of class "+ className + " has been requested by the student " + user.name + ".";
            await NotificationService.createNotification({
              senderId: user.id,
              receiverIds: teacherIds,
              classCode: classCode,
              type: "grade_review_request",
              message: msg
            })
              .then(
                (data) => {
                  console.log(data.data.data)
                  showAlert('Create a notification to your teacher successully', 'success');

                },
                (error) => {
                  console.log(error)
                  showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
                }
              ).finally(() => {
                setLoading(false)
              });
          },
          (error) => {
            console.log(error)
            showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
          }
        ).finally(() => {
          setLoading(false)
        });
    }
    handleClose();

  };

  const handleExpectGradeChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '' || inputValue === null) {
      setExpectGrade(null);
      showAlert('Please enter a number.', 'error');
    }

    // Check if the input is a valid grade between 0 and 10
    if (/^\d*\.?\d*$/.test(inputValue) ) {
      const numericValue = parseFloat(inputValue);

      if (numericValue >= 0 && numericValue <= 10) {
        setExpectGrade(numericValue.toString());
      } else {
          showAlert('Please enter a valid grade between 0 and 10.', 'error');
      }
    } else {
      showAlert('Please enter a valid number.', 'error');
    }
  };

  return (
    <>
      <Button variant="contained" endIcon={<AddCommentIcon />}
              style={{ backgroundColor: 'teal', color: 'white' }}
              onClick={handleClickOpen}
      >
        Request review
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Request a review of <strong>{grade.name}</strong></DialogTitle>
        <DialogContent>
          <DialogContentText>
            To request a review to your teachers, please enter your expectation grade and the explanation.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="number"
            label="Expectation grade"
            type="number"
            fullWidth
            variant="standard"
            inputProps={{ min: 0, max: 10 }}
            value={expectGrade}
            onChange={handleExpectGradeChange}
          />
          <TextField
            autoFocus
            margin="dense"
            id="text"
            label="Explanation"
            type="text"
            fullWidth
            variant="standard"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton
            onClick={handleSendRequest}
            variant={"contained"}
            loading={loading}
          >
            <span>Send</span>
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}