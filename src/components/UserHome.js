import React from "react";
import "materialize-css/dist/css/materialize.min.css";
import backgroundPhoto from "../image/2.png";
import { useTranslation } from "react-i18next";

const WelcomePage = ({ userData }) => {
  const userName = window.localStorage.getItem("userName");
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
    <div className="welcome-page" style={backgroundStyle}>
      <div className="container">
        <div className="row">
          <div className="col s12 center-align">
            <h1
              style={{ fontWeight: "800" }}
              className="welcome-title white-text"
            >
              {t("WelcomePage.title")} {`${userName}`}!
            </h1>
            <h5
              style={{ fontWeight: "700" }}
              className="welcome-message white-text "
            >
              {t("WelcomePage.message")}
            </h5>
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
