import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import {makeStyles} from "@mui/styles";
import {useNavigate} from "react-router-dom";
import {useUserStore} from "../../context/UserStoreProvider";
import {Divider, ListItemIcon} from "@mui/material";
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import CreateClass from "../dialog/CreateClass";
import {AssignmentInd, Logout} from "@mui/icons-material";
import JoinClassByCode from "../dialog/JoinClassByCode";
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuNoti from "./MenuNoti";
import NotificationService from "../../services/notification.service";

const useStyles = makeStyles(() => ({
  transition: {
    transition: "all 0.3s ease-out", // Adjust the duration and timing function as needed
    "&:hover": {
      transform: "Scale(1.1)",
    },
  },
}));

function ResponsiveAppBar() {
  const { user, isAuthenticated, logoutUser } = useUserStore();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElClass, setAnchorElClass] = React.useState(null);
  const [anchorElNoti, setAnchorElNoti] = React.useState(null);
  const [openCreateClass, setOpenCreateClass] = React.useState(false);
  const [openJoinClass, setOpenJoinClass] = React.useState(false);
  const [notiList, setNotiList] = React.useState(null);

  const classes = useStyles();
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenClassMenu = (event) => {
    setAnchorElClass(event.currentTarget);
  };

  const handleOpenNotiMenu = async (event) => {
    setAnchorElNoti(event.currentTarget);

    await NotificationService.getAllNotificationByUserId({
      userId: user.id
    })
      .then(
        (data) => {
          console.log(data.data.data)
          setNotiList(data.data.data)
        },
        (error) => {
          console.log(error)
        }
      );
  };
  const handleOpenCreateClass = (event) => {
    setAnchorElClass(null);
    setOpenCreateClass(event.currentTarget);
  };
  const handleOpenJoinClass = (event) => {
    setAnchorElClass(null);
    setOpenJoinClass(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleCloseClassMenu = () => {
    setAnchorElClass(null);
  };
  const handleCloseNotiMenu = () => {
    setAnchorElNoti(null);
  };

  const navigateProfilePage = () => {
    navigate("/profile");
    window.location.reload();
  };

  const navigateTeachingClassesPage = () => {
    navigate("/teaching-classes");
    window.location.reload();
  };
  const navigateJoinedClassesPage = () => {
    navigate("/joined-classes");
    window.location.reload();
  };

  const handleLogOut = () => {
    logoutUser();
    navigate('/')
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <SchoolOutlinedIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1
            }}
          >
            HAQ CLASSROOM
          </Typography>

          {isAuthenticated()  && (
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem key={"Teaching"} onClick={navigateTeachingClassesPage} className={classes.transition}>
                  <Typography textAlign="center">{"Teaching"}</Typography>
                </MenuItem>

                <MenuItem key={"Joined"} onClick={navigateJoinedClassesPage} className={classes.transition}>
                  <Typography textAlign="center">{"Joined"}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}

          <SchoolOutlinedIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            HAQ CLASSROOM
          </Typography>

          {isAuthenticated()  && (
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Button
                key={"Teaching"}
                onClick={navigateTeachingClassesPage}
                sx={{ my: 2, color: 'white', display: 'block' }}
                className={classes.transition}
              >
                Teaching
              </Button>
              <Button
                key={"Joined"}
                onClick={navigateJoinedClassesPage}
                sx={{ my: 2, color: 'white', display: 'block' }}
                className={classes.transition}
              >
                Joined
              </Button>
            </Box>
          )}

          {isAuthenticated() ? (
            <Box sx={{ flexGrow: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleOpenClassMenu}
                  color="inherit"
                  sx={{ p: 0 }}
                >
                  <AddIcon sx={{
                    width: 36,
                    height: 36
                  }} />
                </IconButton>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleOpenNotiMenu}
                  color="inherit"
                  sx={{ p: 0 }}
                >
                  <NotificationsIcon sx={{
                    width: 36,
                    height: 36
                  }} />
                </IconButton>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleOpenUserMenu}
                  color="inherit"
                  sx={{ p: 0 }}
                >
                  <AccountCircle sx={{
                    width: 36,
                    height: 36
                  }} />
                </IconButton>
              </Stack>

              {/*Menu class*/}
              <Menu
                sx={{ mt: '45px' }}
                id="menu-class"
                anchorEl={anchorElClass}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElClass)}
                onClose={handleCloseClassMenu}
              >
                <MenuItem onClick={handleOpenCreateClass}>Create Class</MenuItem>
                <MenuItem onClick={handleOpenJoinClass}>Join Class</MenuItem>
              </Menu>

              {/*Menu noti*/}
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElNoti}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElNoti)}
                onClose={handleCloseNotiMenu}
              >
                <Box sx={{ my: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" noWrap>
                    <strong>All Notifications</strong>
                  </Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />
                <MenuNoti notiList={notiList}/>

              </Menu>

              {/*Menu user*/}
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <Box sx={{ my: 1.5, px: 2 }}>
                  <Typography variant="subtitle2" noWrap>
                    <strong>{user.name}</strong>
                  </Typography>
                  <Typography variant="body2" noWrap>
                    {user.email}
                  </Typography>
                </Box>

                <Divider sx={{ borderStyle: 'dashed' }} />

                <MenuItem onClick={navigateProfilePage}>
                  <ListItemIcon>
                    <AssignmentInd fontSize="small"/>
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem
                  disableRipple
                  disableTouchRipple
                  onClick={handleLogOut}
                  sx={{ color: 'error.main' }}
                >
                  <ListItemIcon>
                    <Logout fontSize="small"
                            sx={{ color: 'error.main' }}
                    />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <Button href="/login" variant="filled">SIGN IN</Button>
              <Button href="/register" variant="outlined"
                      sx={{
                        ml: 2, borderColor: 'white', color: 'white', '&:hover': {
                          backgroundColor: 'transparent',
                          borderColor: 'white',
                        },
                      }}
              >SIGN UP</Button>
            </Box>
          )
          }

        </Toolbar>
      </Container>
      <CreateClass open={openCreateClass} setOpen={setOpenCreateClass}/>
      <JoinClassByCode open={openJoinClass} setOpen={setOpenJoinClass}/>
    </AppBar>
  );
}
export default ResponsiveAppBar;
