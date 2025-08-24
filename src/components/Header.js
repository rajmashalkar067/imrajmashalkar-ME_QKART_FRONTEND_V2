import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons, hideRegisterBtn, hideLoginBtn }) => {
  const history = useHistory();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "";
  const isLoggedIn = Boolean(token);

  const handleBackToExplore = () => {
    // “BACK TO EXPLORE” - redirect to products page
    history.push("/");
  };

  const handleLogin = () => {
    // “LOGIN” - redirect to login page
    history.push("/login");
  };

  const handleRegister = () => {
    // “REGISTER” - redirect to register page
    history.push("/register");
  };

  const handleLogout = () => {
    // “LOGOUT” - clear contents of localStorage and redirect to products page itself
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("balance");
    history.push("/");
    // Forced reload so header re-renders immediately (per milestone tip)
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box
        className="header-title"
        onClick={handleBackToExplore}
        style={{ cursor: "pointer" }}
      >
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      <Button
        className="explore-button"
        startIcon={<ArrowBackIcon />}
        variant="text"
        onClick={handleBackToExplore}
      >
        BACK TO EXPLORE
      </Button>

      <Box>
        {hasHiddenAuthButtons ? (
          // Register/Login pages: show only the *other* action as needed
          <Stack direction="row" spacing={1} alignItems="center">
            {!hideLoginBtn && (
              <Button variant="text" onClick={handleLogin}>
                LOGIN
              </Button>
            )}
            {!hideRegisterBtn && (
              <Button variant="contained" onClick={handleRegister}>
                REGISTER
              </Button>
            )}
          </Stack>
        ) : (
          // Products page
          <>
            {isLoggedIn ? (
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar alt={username} src="avatar.png" />
                <Box className="username-text">{username}</Box>
                <Button variant="text" onClick={handleLogout}>
                  LOGOUT
                </Button>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="text" onClick={handleLogin}>
                  LOGIN
                </Button>
                <Button variant="contained" onClick={handleRegister}>
                  REGISTER
                </Button>
              </Stack>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Header;
