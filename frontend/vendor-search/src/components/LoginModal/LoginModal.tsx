// LoginModal.tsx

import React, { useState } from "react";
import Modal from "react-modal";
import "./LoginModal.css";
import { getCsrfToken } from "../../utils/csrf";

type LoginModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onLoginSuccess: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onRequestClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const csrfToken = getCsrfToken();
    console.log("CSRF token:", csrfToken);

    const apiUrl = import.meta.env.VITE_API_BASE_URL; // Accessing the API base URL from the .env file

    try {
      const response = await fetch(`${apiUrl}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken, // Include CSRF token in the request headers
        },
        credentials: "include", // Include credentials such as cookies in the request
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        onLoginSuccess();
      } else {
        // Log the full response object for non-OK responses
        console.error("Response status:", response.status);
        console.error("Response headers:", response.headers);
        response.text().then((text) => console.error("Response body:", text));
        const errorData = await response.json(); // Parsing the response body to get error details
        console.error("Parsed error data:", errorData);
        // Optionally, you can also update the UI to inform the user about the error
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      closeTimeoutMS={300}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      className={{
        base: "login-modal__content",
        afterOpen: "login-modal__content--after-open",
        beforeClose: "login-modal__content--before-close",
      }}
      overlayClassName={{
        base: "login-modal__overlay",
        afterOpen: "login-modal__overlay--after-open",
        beforeClose: "login-modal__overlay--before-close",
      }}
    >
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          className="login-modal__input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="login-modal__input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-modal__button" type="submit">
          Login
        </button>
        <button
          className="login-modal__button"
          type="button"
          onClick={onRequestClose}
        >
          Close
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;
