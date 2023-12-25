// LoginModal.tsx

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./LoginModal.css";
import { getCsrfToken } from "../../utils/csrf";

type LoginModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onLoginSuccess: (username: string) => void;
  onLoginStart: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onRequestClose,
  onLoginSuccess,
  onLoginStart,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setErrorMessage("");
    setShowErrorMessage(false);
  };
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    onLoginStart();

    const csrfToken = getCsrfToken();

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(`${apiUrl}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        resetForm();

        setShowErrorMessage(false);
        setTimeout(() => {
          setErrorMessage("");
          onLoginSuccess(username);
        }, 200);
      } else {
        const responseBody = await response.text();
        const errorData = JSON.parse(responseBody);
        setErrorMessage(errorData.detail || "Login failed. Please try again.");
        setShowErrorMessage(true);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);
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
        <div className="login-modal__error-container">
          <div
            className={`login-modal__error ${
              showErrorMessage ? "login-modal__error-visible" : ""
            }`}
          >
            {errorMessage}
          </div>
        </div>
        <button
          className="login-modal__button"
          data-testid="modal-login-button"
          type="submit"
        >
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
