// index.js
import React from "react";
import ReactDOM from "react-dom";
import "materialize-css/dist/css/materialize.min.css";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import App from "./App";

ReactDOM.render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>,
  document.getElementById("root")
);
