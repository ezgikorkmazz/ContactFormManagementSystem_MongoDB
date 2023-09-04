import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import io from "socket.io-client";

const ContactForm = () => {
  const inputMessageRef = useRef(null);
  const inputUsernameRef = useRef(null);
  const inputCountriesRef = useRef(null);
  const [usernameText, setUsernameText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [countryText, setCountryText] = useState("");
  const [countries, setCountries] = useState([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [gender, setGender] = useState("male");
  const [isValidCountry, setIsValidCountry] = useState(true);
  const { t } = useTranslation();

  const socket = useRef(null);

  useEffect(() => {
    if (inputMessageRef.current) {
      const characterCounterInstance = window.M.CharacterCounter.init(
        inputMessageRef.current
      );
    }

    if (inputUsernameRef.current) {
      const characterCounterInstance = window.M.CharacterCounter.init(
        inputUsernameRef.current
      );
    }

    if (inputCountriesRef.current) {
      const characterCounterInstance = window.M.CharacterCounter.init(
        inputCountriesRef.current
      );
    }

    fetchCountries();
    socket.current = io("ws://localhost:5165");
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const onCountryTextChange = (event) => {
    setCountryText(event.target.value);
    setIsValidCountry(countries.includes(event.target.value));
  };

  const onUsernameTextChange = (event) => {
    setUsernameText(event.target.value);
  };

  const onMessageTextChange = (event) => {
    setMessageText(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !usernameText ||
      !countryText ||
      !messageText ||
      !gender ||
      !isValidCountry
    ) {
      toast.error(t("ContactForm.toastFillFields"));
      return;
    }

    const formData = {
      name: usernameText,
      gender: gender,
      country: countryText,
      message: messageText,
    };

    try {
      const response = await fetch("http://localhost:5165/api/message/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const data = await response.json();
      console.log("Message added successfully:", data);
      setIsFormSubmitted(true);
      setUsernameText("");
      setMessageText("");
      setCountryText("");
      setGender("male");

      socket.current.emit("newMessage", {
        name: formData.name,
        message: formData.message,
      });

      toast.success(
        `Message submitted Successfully, Name: ${formData.name}, Message: ${formData.message}`
      ); // Display snack bar message
    } catch (error) {
      console.error("Error while submitting form:", error);
      toast.error(t("ContactForm.toastError"));
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch("http://localhost:5165/api/countries");
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      if (data?.data?.countries[0].countries) {
        setCountries(data.data.countries[0].countries);
      } else {
        console.error("Invalid response format:", data);
      }
    } catch (error) {
      console.error("Error fetching country names:", error);
    }
  };

  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("messageReceived", (data) => {
      const { name, message } = data;
      toast.success(`${name}: ${message}`);
    });
  }, []);

  return (
    <>
      <ToastContainer />
      <div className="container">
        <h1 className="center deep-purple-text">
          {t("ContactForm.pageTitle")}
        </h1>
        <h5 className="center deep-purple-text">
          {t("ContactForm.pageSubtitle")}
        </h5>
        <br />
        <br />
        <div className="row valign-wrapper ">
          <div className="col s12">
            <div className="card-panel deep-purple lighten-5">
              <span>
                <div className="row center-align">
                  <form className="col s12" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="input-field col s6">
                        <i className="material-icons prefix deep-purple-text">
                          person
                        </i>
                        <input
                          id="name"
                          type="text"
                          maxLength={50}
                          className="materialize-textarea deep-purple-text"
                          onChange={onUsernameTextChange}
                          ref={inputUsernameRef}
                          value={usernameText}
                          data-length="50"
                        />
                        <label htmlFor="name" className="deep-purple-text">
                          {t("ContactForm.nameLabel")}
                        </label>
                      </div>

                      <div className="input-field col s6">
                        <p className="col s3">
                          <label>
                            <input
                              name="group1"
                              type="radio"
                              checked={gender === "male"}
                              value="male"
                              onChange={(e) => setGender(e.target.value)}
                            />
                            <span className="deep-purple-text text-lighten-1">
                              <i className="material-icons">male</i>
                              {t("ContactForm.maleLabel")}
                            </span>
                          </label>
                        </p>
                        <p className="col s3">
                          <label>
                            <input
                              name="group1"
                              type="radio"
                              checked={gender === "female"}
                              value="female"
                              onChange={(e) => setGender(e.target.value)}
                            />
                            <span className="deep-purple-text text-lighten-1">
                              <i className="material-icons">female</i>
                              {t("ContactForm.femaleLabel")}
                            </span>
                          </label>
                        </p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col s6">
                        <div className="row">
                          <div className="input-field col s12">
                            <i className="material-icons prefix deep-purple-text">
                              public
                            </i>
                            <input
                              type="text"
                              id="autocomplete-input"
                              className="autocomplete deep-purple-text"
                              list="countries-list"
                              value={countryText}
                              onChange={onCountryTextChange}
                            />
                            <label
                              htmlFor="autocomplete-input"
                              className="deep-purple-text"
                            >
                              {t("ContactForm.countryLabel")}
                            </label>
                            <datalist id="countries-list">
                              {countries
                                .filter((name) =>
                                  name
                                    .toLowerCase()
                                    .startsWith(countryText.toLowerCase())
                                )
                                .map((name, index) => (
                                  <option key={index} value={name} />
                                ))}
                            </datalist>
                          </div>
                        </div>
                        {!isValidCountry && (
                          <p className="red-text deep-purple-text text-lighten-1">
                            {t("ContactForm.countryInvalidMessage")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      <div className="input-field col s12">
                        <i className="material-icons prefix deep-purple-text">
                          message
                        </i>
                        <textarea
                          id="message"
                          className="materialize-textarea deep-purple-text"
                          onChange={onMessageTextChange}
                          ref={inputMessageRef}
                          value={messageText}
                          data-length="500"
                          maxLength={500}
                        ></textarea>
                        <label htmlFor="message" className="deep-purple-text">
                          {t("ContactForm.messageLabel")}
                        </label>
                      </div>
                    </div>
                    <button
                      className="btn-large waves-effect waves-light pink"
                      type="submit"
                      name="action"
                    >
                      {t("ContactForm.submitButton")}
                      <i className="material-icons right">send</i>
                    </button>
                  </form>
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactForm;
