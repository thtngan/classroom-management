import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import {Divider, InputAdornment} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import GradeReviewServices from "../../../services/grade.review.services";
import {useUserStore} from "../../../context/UserStoreProvider";
import {useState} from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ListComment from "./ListComment";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));


export default function GradeStudentView({gradeReview}) {
  const { user } = useUserStore();
  const classCode = window.location.pathname.split('/').pop(); // Extract classCode from the URL
  const [expanded, setExpanded] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [listComment, setListComment] = React.useState(gradeReview.comments);
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

  const handleAddComment = async () => {
    // setLoading(true);

    await GradeReviewServices.addCommentByClassCodeStudentIdAndGradeCompositionId(
      {
        classCode: classCode,
        studentId: gradeReview.studentId,
        gradeCompositionId: gradeReview.gradeCompositionId,
        commenter: user.email,
        comment: comment
      }
    )
      .then((data) => {
        console.log(data.data.data);
        setListComment(data.data.data.comments);
        showAlert('Add comment successfully', 'success');

      }, (error) => {
        console.log(error)
        showAlert(error.response.data.error.message || 'An unexpected error occurred. Please try again later.', 'error');
      })
    ;

  }

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper elevation={2} style={{width:'100%' , marginTop: '10px', borderLeft: '10px solid' +
        ' teal'}}
    >
      <Card>
        <CardHeader
          title={<Typography variant="h6" gutterBottom><strong>Grade name:</strong> {gradeReview.gradeCompositionName}</Typography>}
          subheader={<Typography variant="h6" gutterBottom><strong>Your current grade:</strong> {gradeReview.currentGrade}</Typography>}
        />
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            <strong>Your expectation grade:</strong> {gradeReview.expectationGrade}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Your explanation:</strong> {gradeReview.explanation}
          </Typography>
        </CardContent>
        <CardActions disableSpacing             onClick={handleExpandClick}
        >
          <IconButton aria-label="add to favorites"
                      onClick={handleExpandClick}
          >
            <PeopleIcon/>
            <Typography variant="h6"><strong>&nbsp;Comments:</strong></Typography>
          </IconButton>

          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Divider/>
            {listComment.map((c) => (
              <ListComment oneComment={c} />
            ))}

            <TextField id="comment"
                       label="Comment"
                       variant="outlined"
                       fullWidth
                       defaultValue={""}
                       onChange={e => setComment(e.target.value)}
                       sx={{ marginTop : 3}}
                       InputProps={{
                         endAdornment: (
                           <InputAdornment position="end" onClick={handleAddComment}>
                             <IconButton edge="end">
                               <SendIcon />
                             </IconButton>
                           </InputAdornment>
                         ),
                       }}
            />
          </CardContent>
        </Collapse>
      </Card>
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
    </Paper>
  );
}
