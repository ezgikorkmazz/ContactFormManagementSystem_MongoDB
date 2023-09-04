import React from "react";
import { Link } from "react-router-dom";
import backgroundPhoto from "../image/2.png";
import { useTranslation } from "react-i18next";

const NotAuthorizedPage = () => {
  const backgroundStyle = {
    backgroundImage: `url(${backgroundPhoto})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const { t } = useTranslation();
  return (
    <div style={backgroundStyle}>
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
          className="card deep-purple-text white"
          style={{
            width: "100%",
            maxWidth: "500px",
            borderRadius: "10px",
            boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.5)",
            padding: "20px",
          }}
        >
          <div className="card-content center-align">
            <h1
              style={{
                color: "#fff",
                textShadow:
                  "0 0 5px #fff, 0 0 10px #fff, 0 0 20px #fff, 0 0 40px #e91e63 , 0 0 80px #e91e63 , 0 0 90px #e91e63 , 0 0 100px #e91e63 , 0 0 150px #e91e63 ",
              }}
            >
              403
            </h1>

            <h2 style={{ marginBottom: "30px" }}>
              {t("NotAuthorizedPage.pageTitle")}
            </h2>
            <p>{t("NotAuthorizedPage.errorMessage")}</p>
            <Link
              to="/"
              className="waves-effect waves-light btn pink"
              style={{ marginTop: "20px" }}
            >
              {t("NotAuthorizedPage.goToHomeButton")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
