// LoginModal.tsx

import React, { useState } from "react";
import Modal from "react-modal";
import "./LoginModal.css";

type LoginModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const apiUrl = import.meta.env.VITE_API_BASE_URL; // Accessing the API base URL from the .env file

    try {
      const response = await fetch(`${apiUrl}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log(data);
      onRequestClose();
    } catch (error) {
      console.error("Login error:", error);
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
