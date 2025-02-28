import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function ListComment({oneComment}) {
  console.log(oneComment)

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper'}}>
      <ListItem>
        <ListItemAvatar>
          <Avatar>
            <AccountCircleIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={<strong>{oneComment.commenter}</strong>} secondary={oneComment.comment} />
      </ListItem>
    </List>
  );
}
