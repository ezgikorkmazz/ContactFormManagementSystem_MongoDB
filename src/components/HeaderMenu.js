import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const HeaderMenu = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const storedLanguage = localStorage.getItem("language");
  const [currentLanguage, setCurrentLanguage] = useState(
    storedLanguage || i18n.language
  );

  const { t } = useTranslation();
  const role = window.localStorage.getItem("role");
  const userName = window.localStorage.getItem("userName");
  const userPhoto = window.localStorage.getItem("userPhoto");

  useEffect(() => {
    const sidenavElems = document.querySelectorAll(".sidenav");
    const sidenavInstances = window.M.Sidenav.init(sidenavElems);
    return () => {
      sidenavInstances.forEach((instance) => instance.destroy());
    };
  }, []);

  const changeLanguage = (language) => {
    localStorage.setItem("language", language);
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
  };

  useEffect(() => {
    const dropdownElems = document.querySelectorAll(".dropdown-trigger");
    const dropdownOptions = {
      inDuration: 300,
      outDuration: 225,
      coverTrigger: false,
    };
    const dropdownInstances = window.M.Dropdown.init(
      dropdownElems,
      dropdownOptions
    );
    return () => {
      dropdownInstances.forEach((instance) => instance.destroy());
    };
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    applyDarkModeStyles(newDarkMode);
  };

  const applyDarkModeStyles = (isDarkMode) => {
    const body = document.body;
    if (isDarkMode) {
      body.style.backgroundColor = "#2c2736";
      body.style.color = "#ffffff";
    } else {
      body.style.backgroundColor = "#ffffff";
      body.style.color = "#1f1f1f";
    }

    const tableCells = document.querySelectorAll("td");
    tableCells.forEach((cell) => {
      if (isDarkMode) {
        cell.style.color = "black";
      } else {
        cell.style.color = "black";
      }
    });
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    applyDarkModeStyles(darkMode);
  }, [darkMode]);

  return (
    <div>
      <ul id="dropdown1" className="dropdown-content purple lighten-4">
        <li>
          <div className="center-align">
            <p className="center">{userName}</p>
          </div>
        </li>
        <li className="divider"></li>
        <li>
          <div className="switch center-align">
            <a href="#!" onClick={toggleDarkMode}>
              {darkMode ? (
                <>
                  <i className="material-icons">brightness_5</i>

                  {t("HeaderMenu.Light Mode")}
                </>
              ) : (
                <>
                  <i className="material-icons">brightness_3</i>

                  {t("HeaderMenu.Dark Mode")}
                </>
              )}
            </a>
          </div>
        </li>
        <li>
          <div className="switch">
            <div className="switch center-align">
              <label>
                {t("HeaderMenu.Turkish")}
                <input
                  type="checkbox"
                  onClick={() =>
                    changeLanguage(currentLanguage === "tr" ? "en" : "tr")
                  }
                />
                <span className="lever"></span>
                {t("HeaderMenu.English")}
              </label>
            </div>
          </div>
        </li>
        <li>
          <a className="deep-purple-text" onClick={logOut}>
            {t("HeaderMenu.Log Out")}
          </a>
        </li>
      </ul>
      <nav className={`${darkMode ? "pink" : "deep-purple"}`}>
        <div className="nav-wrapper container">
          <Link to="/" className="brand-logo">
            <img
              src="./logo.svg"
              alt="Logo"
              style={{ width: "60px", height: "60px" }}
            />
          </Link>
          <a href="#!" className="sidenav-trigger" data-target="mobile-menu">
            <i className="material-icons">menu</i>
          </a>
          <ul className="right hide-on-med-and-down">
            {role === "admin" ? (
              <>
                <li>
                  <a href="/users">{t("HeaderMenu.Users")}</a>
                </li>
                <li>
                  <a href="/reports">{t("HeaderMenu.Reports")}</a>
                </li>
                <li>
                  <Link to="/messages">{t("HeaderMenu.Messages")}</Link>
                </li>
                <li>
                  <a
                    className="dropdown-trigger"
                    href="#!"
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                    data-target="dropdown1"
                  >
                    <img
                      src={userPhoto}
                      alt="Profile"
                      className="circle responsive-img"
                      style={{ width: "45px", height: "45px" }}
                    />
                    <i className="material-icons right">arrow_drop_down</i>
                  </a>
                </li>
              </>
            ) : role === "reader" ? (
              <>
                <li>
                  <Link to="/messages">{t("HeaderMenu.Messages")}</Link>
                </li>
                <li>
                  <a
                    className="dropdown-trigger"
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                    href="#!"
                    data-target="dropdown1"
                  >
                    <img
                      src={userPhoto}
                      alt="Profile"
                      className="circle responsive-img"
                      style={{ width: "45px", height: "45px" }}
                    />
                    <i className="material-icons right">arrow_drop_down</i>
                  </a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/login">{t("HeaderMenu.Login")}</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      <ul
        className={`sidenav ${
          darkMode ? "pink lighten-3" : "deep-purple"
        } lighten-4`}
        id="mobile-menu"
      >
        {role === "admin" ? (
          <>
            <li>
              <div className="container center">
                <img
                  src={userPhoto}
                  alt="Profile"
                  className="circle responsive-img"
                  style={{ width: "80px", height: "80px" }}
                />
                <p
                  className={`${
                    darkMode ? "pink lighten-3 text" : "deep-purple-text"
                  }`}
                  style={{ fontWeight: "500", fontSize: "28px" }}
                >
                  {userName}
                </p>
              </div>
            </li>
            <li>
              <a href="/users">{t("HeaderMenu.Users")}</a>
            </li>
            <li>
              <a href="/reports">{t("HeaderMenu.Reports")}</a>
            </li>
            <li>
              <Link to="/messages">{t("HeaderMenu.Messages")}</Link>
            </li>
            <li>
              <a onClick={logOut}>{t("HeaderMenu.Log Out")}</a>
            </li>
          </>
        ) : role === "reader" ? (
          <>
            <li>
              <div className="container center">
                <img
                  src={userPhoto}
                  alt="Profile"
                  className="circle responsive-img"
                  style={{ width: "80px", height: "80px" }}
                />
              </div>
            </li>
            <li>
              <Link to="/messages">{t("HeaderMenu.Messages")}</Link>
            </li>
            <li>
              <a onClick={logOut}>{t("HeaderMenu.Log Out")}</a>
            </li>
          </>
        ) : (
          <>
            <li>
              <a href="/login">{t("HeaderMenu.Login")}</a>
            </li>
          </>
        )}
        <li>
          <div className="center-align">
            <a href="#!" onClick={toggleDarkMode}>
              {darkMode ? (
                <>
                  {t("HeaderMenu.Light Mode")}
                  <i className="material-icons deep-purple-text">
                    brightness_5
                  </i>
                </>
              ) : (
                <>
                  {t("HeaderMenu.Dark Mode")}
                  <i className="material-icons deep-purple-text">
                    brightness_3
                  </i>
                </>
              )}
            </a>
          </div>
        </li>

        <li>
          <div className="switch center-align">
            <label className="deep-purple-text">
              {t("HeaderMenu.Turkish")}
              <input
                type="checkbox"
                onClick={() =>
                  changeLanguage(currentLanguage === "tr" ? "en" : "tr")
                }
              />
              <span className="lever deep-purple"></span>
              {t("HeaderMenu.English")}
            </label>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default HeaderMenu;
