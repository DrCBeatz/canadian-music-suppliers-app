// LoginModal.tsx

import React from "react";
import Modal from "react-modal";
import "./LoginModal.css";

type LoginModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onRequestClose }) => {
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
      <form>
        <input
          className="login-modal__input"
          type="text"
          placeholder="Username"
        />
        <input
          className="login-modal__input"
          type="password"
          placeholder="Password"
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
