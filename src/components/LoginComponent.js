import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backgroundImage from "../image/2.png";
import { useTranslation } from "react-i18next";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  function handleSubmit(e) {
    e.preventDefault();

    fetch("http://localhost:5165/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showErrorToast(data.error);
        } else if (data.data && data.data.token) {
          showSuccessToast(t("Login.successMessage"));
          window.localStorage.setItem("userName", data.data.user.username);
          window.localStorage.setItem("userPhoto", data.data.user.base64Photo);
          window.localStorage.setItem("token", data.data.token);
          window.localStorage.setItem("loggedIn", true);
          window.localStorage.setItem("role", data.data.user.role);
          window.location.href = "/userDetails";
        }
      })
      .catch((error) => {
        showErrorToast(t("Login.errorMessage"));
      });
  }

  function showErrorToast(errorMessage) {
    toast.error(errorMessage, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  function showSuccessToast(successMessage) {
    toast.success(successMessage, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  return (
    <div
      className="valign-wrapper"
      style={{
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col s12 l6 offset-l3">
            <div
              className="card deep-purple lighten-1"
              style={{
                borderRadius: "15px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                width: "90%",
                margin: "0 auto",
              }}
            >
              <div className="card-content white-text">
                <form onSubmit={handleSubmit}>
                  <h3 className="center-align" style={{ fontWeight: "500" }}>
                    {t("Login.title")}
                  </h3>

                  <div className="input-field">
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="white-text"
                    />
                    <label htmlFor="username" className="white-text">
                      {t("Login.usernameLabel")}
                    </label>
                  </div>

                  <div className="input-field">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="white-text"
                    />
                    <label htmlFor="password" className="white-text">
                      {t("Login.passwordLabel")}
                    </label>
                  </div>

                  <div className="center-align">
                    <button
                      type="submit"
                      className="btn waves-effect waves-light pink"
                    >
                      {t("Login.submitButton")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="valign-wrapper"
        style={{ position: "absolute", bottom: "0" }}
      >
        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;
