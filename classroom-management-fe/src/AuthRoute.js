import {Navigate, useLocation} from 'react-router-dom';
import {useUserStore} from "./context/UserStoreProvider";
import {Backdrop, CircularProgress} from "@mui/material";

export const AuthRoute = ({ children }) => {
  const { user, loadingUser } = useUserStore();
  const location = useLocation();
  console.log("user in isAuthenticated:", user);
  console.log("loading user:", loadingUser);

  if (loadingUser) {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingUser} // Use loadingUser instead of open
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  return user ? (
    children
  ) : (
    <>
      <p>Not authenticated. Redirecting to /login...</p>
      {console.log("Navigating to /login")}
      <Navigate to="/login" state={{ from: location }} />
    </>
  );
};