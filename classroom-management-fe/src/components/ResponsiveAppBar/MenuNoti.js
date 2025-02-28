import * as React from 'react';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Box from "@mui/material/Box";
import WorkIcon from '@mui/icons-material/Work';
import {useNavigate} from "react-router-dom";


export default function MenuNoti({notiList}) {
  const navigate = useNavigate();

  const handleClick = (classCode) => {
    navigate("/class/" + classCode);
    window.location.reload();
  };

  return (
    <Box sx={{ width: 500, maxWidth: '100%' }}>
      <MenuList>

        {
          notiList &&
          Array.isArray(notiList) &&
          notiList.map((notification) => (
            <React.Fragment key={notification.id}>
              <MenuItem onClick={() => handleClick(notification.classCode)}>
                <ListItemIcon>
                  <WorkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                  primaryTypographyProps={{ style: { whiteSpace: 'pre-line' } }}
                />
              </MenuItem>
            </React.Fragment>
          ))
        }


      </MenuList>
    </Box>
  );
}
