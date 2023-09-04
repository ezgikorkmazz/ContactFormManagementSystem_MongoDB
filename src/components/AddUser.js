import React, { useState } from "react";
import "materialize-css/dist/css/materialize.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useTranslation } from "react-i18next";

const AddUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [base64Photo, setBase64Photo] = useState("");
  const [error, setError] = useState("");
  const [redirectToUserList, setRedirectToUserList] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (!username || !password || !base64Photo) {
        setError("All fields are required");
        return;
      }

      if (username.length > 10 || password.length > 10) {
        setError("Username and password must be 10 characters or less");
        return;
      }

      const response = await fetch(
        "http://localhost:5165/api/user/add-reader",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token,
          },
          body: JSON.stringify({ username, password, base64Photo }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "An error occurred");
        return;
      }

      setUsername("");
      setPassword("");
      setBase64Photo("");
      setError("");

      toast.success("User added successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
      });

      setRedirectToUserList(true);
    } catch (error) {
      setError("An error occurred");
      console.log(error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBase64Photo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (redirectToUserList) {
    window.location.href = "/users";
    return null;
  }

  return (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div
          className="card-panel deep-purple lighten-4"
          style={{ width: "600px" }}
        >
          <h2 className="center-align deep-purple-text">
            {t("AddUser.Add User")}
          </h2>
          <form className="col s12" onSubmit={handleSubmit}>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={10}
                  required
                />
                <label htmlFor="username" className="deep-purple-text">
                  {t("AddUser.Username (Max 10 characters)")}
                </label>
              </div>
            </div>
            <div className="row">
              <div className="input-field col s12">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={10}
                  required
                />
                <label className="deep-purple-text" htmlFor="password">
                  {t("AddUser.Password (Max 10 characters)")}
                </label>
              </div>
            </div>
            <div className="row">
              <div className="file-field input-field col s12">
                <div className="btn deep-purple">
                  <span>{t("AddUser.UPLOAD")}</span>
                  <input type="file" onChange={handleFileChange} required />
                </div>
                <div className="file-path-wrapper">
                  <input
                    className="file-path validate"
                    type="text"
                    placeholder="Upload a photo"
                  />
                </div>
              </div>
            </div>
            {error && <div className="error red-text">{error}</div>}
            <div className="center-align">
              <a
                href="/users"
                className="btn waves-effect waves-light pink"
                style={{ marginRight: "10px" }}
              >
                <i className="material-icons left">arrow_back</i>
                {t("AddUser.Back")}
              </a>
              <button
                className="btn waves-effect waves-light deep-purple"
                type="submit"
              >
                {t("AddUser.Add User")}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default AddUser;
