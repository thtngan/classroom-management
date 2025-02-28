import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {CardActionArea, CardActions, IconButton, Tooltip} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {useUserStore} from "../../context/UserStoreProvider";

const cardStyle = {
  maxWidth: 345,
  transition: 'transform  0.3s',
  ':hover': {
    transform: 'scale(1.05)',
  },
};
export default function ClassCard({name, teacherName, classCode, invitationCode,
                                    showAlert, isTeacher}) {
  const navigate = useNavigate();
  const { setIsTeacherStatus } = useUserStore();
  const [isCopied, setIsCopied] = useState(false);

  const handleCardClick = () => {
    setIsTeacherStatus(isTeacher)
    navigate('/class/' + classCode);
  };

  const handleCopy = () => {
    setIsCopied(true);
    const URL = `https://classroom-management-fe.vercel.app/join-class/${classCode}?inviteC=${invitationCode}`;
    navigator.clipboard.writeText(URL).then(() => {
      showAlert('Invite link is copied', 'success')

      // Reset the 'isCopied' state after a brief delay
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    })

  };

  return (
    <Card sx={cardStyle}>
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="140"
          src={"https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
          alt="Class Cover"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Teacher: {teacherName}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Tooltip title={isCopied ? 'Link is copied!' : 'Copy invite link'} arrow onClick={handleCopy}>
          <IconButton aria-label="share">
            {isCopied ? <ContentPasteIcon /> : <ShareIcon />}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
