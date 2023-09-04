import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

const MessageDetails = () => {
  const role = window.localStorage.getItem("role");
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5165/api/message/${id}`, {
      method: "GET",
      headers: { token },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.data.message);
      });
  }, [id]);

  useEffect(() => {
    if (isDeleted) {
      toast.success(t("MessageDetails.messageDeleted"));

      setTimeout(() => {
        window.location.href = "/messages";
      }, 1000);
    }
  }, [isDeleted]);

  if (!message) {
    return <div>Loading...</div>;
  }

  const handleDelete = () => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5165/api/message/delete/${id}`, {
      method: "POST",
      headers: { token },
    })
      .then((res) => res.json())
      .then(() => {
        setIsDeleted(true);
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
      });
  };

  return (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div
          className="card  deep-purple lighten-4 deep-purple-text"
          style={{
            width: "80%",
            maxWidth: "1000px",
            borderRadius: "10px",
            boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.5)",
            fontSize: "14px",
          }}
        >
          <div className="card-content">
            <span
              className="card-title"
              style={{
                fontSize: "30px",
                textTransform: "uppercase",
                borderBottom: "1px solid #fff",
                paddingBottom: "10px",
                fontWeight: "500",
              }}
            >
              {t("MessageDetails.title")}
            </span>
            <div className="message-line" style={{ fontSize: "20px" }}>
              <strong>{t("MessageDetails.nameLabel")}</strong> {message.name}
            </div>
            <div className="message-line" style={{ fontSize: "20px" }}>
              <strong>{t("MessageDetails.genderLabel")}</strong>{" "}
              {message.gender}
            </div>
            <div className="message-line" style={{ fontSize: "20px" }}>
              <strong>{t("MessageDetails.countryLabel")}</strong>{" "}
              {message.country}
            </div>
            <div className="message-line" style={{ fontSize: "20px" }}>
              <strong>{t("MessageDetails.messageLabel")}</strong>{" "}
              {message.message}
            </div>
            <div className="message-line" style={{ fontSize: "20px" }}>
              <strong>{t("MessageDetails.readLabel")}</strong>{" "}
              {message.read === "true" ? "Yes" : "No"}
            </div>
          </div>
          <div className="card-action center-align">
            {role === "admin" ? (
              <button
                onClick={handleDelete}
                className="waves-effect waves-light btn-large pink"
                style={{ fontSize: "20px", marginRight: "10px" }}
              >
                <i className="material-icons left">delete</i>
                {t("MessageDetails.deleteButton")}
              </button>
            ) : null}
            <a
              href="/messages"
              className="waves-effect waves-light btn-large deep-purple"
              style={{ fontSize: "20px", marginRight: "10px" }}
            >
              <i className="material-icons left">arrow_back</i>
              {t("MessageDetails.backButton")}
            </a>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default MessageDetails;
