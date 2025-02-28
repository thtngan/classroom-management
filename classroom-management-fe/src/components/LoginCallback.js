import React, { useEffect, useState } from 'react';
import {useUserStore} from "../context/UserStoreProvider";
import {useLocation, useNavigate} from "react-router-dom";

const LoginCallback = () => {
  const location = useLocation();
  const from = location.state?.from || "/";
  const [userData, setUserData] = useState(null);
  const { loginUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to extract user data from URL
    const getUserDataFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userDataParam = urlParams.get('userData');

      if (userDataParam) {
        try {
          const parsedUserData = JSON.parse(decodeURIComponent(userDataParam));
          setUserData(parsedUserData);
          console.log(parsedUserData)

          loginUser({
            email: parsedUserData.email,
            id: parsedUserData.id,
            name: parsedUserData.name,
            studentId: parsedUserData.studentId,
            token: parsedUserData.accessToken,
            socialLogins: parsedUserData.socialLogins
          });

          setTimeout(() => {
            navigate(from, { replace: true });
          }, 800);

        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    // Call the function to get user data
    getUserDataFromURL();

  }, [loginUser, navigate, from]);

  return (
    <div>
      <h1>Client Side</h1>
      {userData ? (
        <div>
          <p>Email: {userData.email}</p>
          {/* Add more user data properties as needed */}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default LoginCallback;
