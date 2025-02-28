import React, {createContext, useContext, useEffect, useState} from 'react';

const UserStoreContext = createContext();

export const UserStoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedIsTeacher = localStorage.getItem('isTeacher');
    const storedIsAdmin = localStorage.getItem('isAdmin');


    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedIsTeacher) {
      setIsTeacher(JSON.parse(storedIsTeacher));
    }

    if (storedIsAdmin) {
      setIsAdmin(JSON.parse(storedIsAdmin));
    }
    setLoadingUser(false);

  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateProfile = (userData) => {
      const newUser = {
        ...user,
        name: userData.name,
        studentId: userData.studentId,
      };
      console.log(newUser)
      setUser(newUser); //update name, studentId
      localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logoutUser = () => {
    setUser(null);
    setIsTeacher(false);
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isTeacher');
    localStorage.removeItem('isAdmin');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const setIsTeacherStatus = (status) => {
    setIsTeacher(status);
    localStorage.setItem('isTeacher', JSON.stringify(status));
  };

  const setIsAdminStatus = (status) => {
    setIsAdmin(status)
    localStorage.setItem('isAdmin', JSON.stringify(status));
  };

  return (
    <UserStoreContext.Provider value={{ user, loginUser, logoutUser, isAuthenticated, updateProfile,
      loadingUser, isTeacher, setIsTeacherStatus, isAdmin, setIsAdminStatus
    }}>
      {children}
    </UserStoreContext.Provider>
  );
};

export const useUserStore = () => {
  return useContext(UserStoreContext);
};
