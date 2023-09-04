import React, { useState, useEffect } from "react";
import "materialize-css/dist/css/materialize.min.css";
import { useParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useTranslation } from "react-i18next";

const EditUser = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [base64Photo, setBase64Photo] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5165/api/user/${id}`, {
      method: "GET",
      headers: { token },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.data.user);
        setUsername(data.data.user.username);
        setPassword(data.data.user.password);
        setBase64Photo(data.data.user.base64Photo);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
      });
  };

  const handleUpdate = () => {
    const token = localStorage.getItem("token");
    const updatedUser = {
      username,
      password,
      base64Photo,
    };

    fetch(`http://localhost:5165/api/user/update/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify(updatedUser),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("User details successfully updated!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
        });

        setTimeout(() => {
          window.location.href = "/users";
        }, 1000);
      })
      .catch((error) => {
        console.error("Error updating user details:", error);
      });
  };

  if (!user) {
    return <div>Loading user details...</div>;
  }

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
        <div className="card-panel deep-purple lighten-4">
          <h2
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
            className="deep-purple-text"
          >
            {t("EditUser.pageTitle")}
          </h2>
          <div className="row">
            <div className="input-field col s12">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled
              />
              <label htmlFor="username" className="active deep-purple-text">
                {t("EditUser.usernameLabel")}
              </label>
            </div>
            <div className="input-field col s12">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={10}
              />
              <label htmlFor="password" className="active deep-purple-text">
                {t("EditUser.passwordLabel")}
              </label>
            </div>
            <div className="col s12">
              <div className="row">
                <div className="col s4">
                  {base64Photo && (
                    <img
                      src={base64Photo}
                      alt={user.username}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <div className="col s8">
                  <div className="file-field input-field">
                    <div className="btn deep-purple">
                      <span>{t("EditUser.fileUploadButton")}</span>
                      <input type="file" onChange={handleFileChange} />
                    </div>
                    <div className="file-path-wrapper">
                      <input
                        className="file-path validate"
                        type="text"
                        placeholder={t("EditUser.uploadPhotoPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col s12">
              <button
                className="btn waves-effect waves-light deep-purple"
                onClick={handleUpdate}
              >
                {t("EditUser.updateButton")}
              </button>
              <Link
                to="/users"
                className="btn waves-effect waves-light pink"
                style={{ marginLeft: "10px" }}
              >
                {t("EditUser.cancelButton")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default EditUser;
