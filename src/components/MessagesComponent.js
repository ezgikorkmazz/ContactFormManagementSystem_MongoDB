import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/messages.css";
import { useTranslation } from "react-i18next";
import MessagesComponentScroll from "./MessagesComponentScroll";

const MessagesComponent = () => {
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage, setMessagesPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("creationDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [totalMessages, setTotalMessages] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    getMessages();
  }, [currentPage, messagesPerPage, sortBy, sortOrder]);

  const getMessages = () => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:5165/api/messages-with-pagination?page=${currentPage}&perPage=${messagesPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    fetch(url, {
      method: "GET",
      headers: { token },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.data.messages);
        setTotalMessages(data.data.totalCount);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  const truncateMessage = (message, maxLength) => {
    if (message.length > maxLength) {
      return message.slice(0, maxLength) + "...";
    }
    return message;
  };

  const renderGenderIcon = (gender) => {
    if (gender === "female") {
      return <i className="material-icons">female</i>;
    } else {
      return <i className="material-icons">male</i>;
    }
  };

  const renderReadIcon = (read) => {
    if (read === "true") {
      return <i className="material-icons">visibility</i>;
    } else {
      return <i className="material-icons">visibility_off</i>;
    }
  };

  const markMessageAsRead = (id) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:5165/api/message/read/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        getMessages();
      })
      .catch((error) => {
        console.error("Error marking message as read:", error);
      });
  };

  const handlePerPageChange = (perPageValue) => {
    setMessagesPerPage(perPageValue);
    setCurrentPage(1); // Reset to first page when changing perPage
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(
    indexOfFirstMessage,
    indexOfLastMessage
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getSortIcon = (column) => {
    if (sortBy === column) {
      return sortOrder === "asc" ? (
        <i className="material-icons">arrow_upward</i>
      ) : (
        <i className="material-icons">arrow_downward</i>
      );
    }
    return null;
  };
  const isPreviousPageDisabled = currentPage === 1 || messages.length === 0;
  const isNextPageDisabled =
    currentPage === Math.ceil(totalMessages / messagesPerPage) ||
    messages.length === 0 ||
    (messages.length < messagesPerPage && currentPage !== 1);

  const handleRedirect = () => {
    window.location.href = "/MessagesComponentScroll"; // Redirect to MessagesComponentScroll.js
  };

  const [showScrollComponent, setShowScrollComponent] = useState(false);

  const toggleScrollComponent = () => {
    setShowScrollComponent(!showScrollComponent);
  };
  return (
    <>
      <div className="container">
        {showScrollComponent ? (
          <MessagesComponentScroll />
        ) : (
          <>
            <h1
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "50px",
              }}
              className="deep-purple-text"
            >
              {t("MessagesComponent.pageTitle")}
            </h1>

            <div className="per-page-buttons">
              <span> {t("MessagesComponent.showPerPage")} </span>
              <button
                className={`btn ${
                  messagesPerPage === 5
                    ? "active deep-purple"
                    : "deep-purple lighten-2"
                }`}
                onClick={() => handlePerPageChange(5)}
              >
                5
              </button>
              <button
                className={`btn ${
                  messagesPerPage === 10
                    ? "active deep-purple"
                    : "deep-purple lighten-2"
                }`}
                onClick={() => handlePerPageChange(10)}
              >
                10
              </button>
              <button
                className={`btn ${
                  messagesPerPage === 20
                    ? "active deep-purple"
                    : "deep-purple lighten-2"
                }`}
                onClick={() => handlePerPageChange(20)}
              >
                20
              </button>
              <button
                className={`btn ${
                  messagesPerPage === 100
                    ? "active deep-purple"
                    : "deep-purple lighten-2"
                }`}
                onClick={() => handlePerPageChange(100)}
              >
                100
              </button>
            </div>

            <div className="table-container">
              <table className="highlight centered responsive-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("name")}>
                      {t("MessagesComponent.tableHeaders.name")}
                      {getSortIcon("name")}
                    </th>
                    <th onClick={() => handleSort("gender")}>
                      {t("MessagesComponent.tableHeaders.gender")}
                      {getSortIcon("gender")}
                    </th>
                    <th onClick={() => handleSort("creationDate")}>
                      {t("MessagesComponent.tableHeaders.creationDate")}
                      {getSortIcon("creationDate")}
                    </th>
                    <th onClick={() => handleSort("country")}>
                      {t("MessagesComponent.tableHeaders.country")}
                      {getSortIcon("country")}
                    </th>
                    <th>{t("MessagesComponent.tableHeaders.message")}</th>
                    <th>{t("MessagesComponent.tableHeaders.messageRead")}</th>
                    <th>{t("MessagesComponent.tableHeaders.viewDetails")}</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message, index) => (
                    <tr
                      key={message.id}
                      className={`${
                        message.read === "true"
                          ? "gradient-green"
                          : "gradient-red"
                      } fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>{message.name}</td>
                      <td>{renderGenderIcon(message.gender)}</td>
                      <td>
                        {new Date(message.creationDate).toLocaleDateString()}
                      </td>
                      <td>{message.country}</td>
                      <td className="tooltip">
                        {truncateMessage(message.message, 50)}
                        <span className="tooltiptext">{message.message}</span>
                      </td>
                      <td>{renderReadIcon(message.read)}</td>
                      <td>
                        <Link to={`/message/${message.id}`}>
                          <button
                            className="btn waves-effect waves-light pink"
                            onClick={() => {
                              markMessageAsRead(message.id);
                            }}
                          >
                            <i className="material-icons left">arrow_forward</i>
                            {t("MessagesComponent.tableHeaders.viewDetails")}
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="pagination center-align">
              <li
                className={isPreviousPageDisabled ? "disabled" : "waves-effect"}
              >
                <button
                  className={`btn-flat waves-effect waves-deep-purple ${
                    isPreviousPageDisabled ? "disabled" : ""
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={isPreviousPageDisabled}
                >
                  <i className="material-icons left">chevron_left</i>
                  {t("MessagesComponent.Previous")}
                </button>
              </li>
              {Array.from({
                length: Math.ceil(totalMessages / messagesPerPage),
              }).map((_, index) => (
                <li
                  key={index}
                  className={
                    currentPage === index + 1 ? "active" : "waves-effect"
                  }
                >
                  <a
                    href="#!"
                    onClick={() => handlePageChange(index + 1)}
                    className="pagination-number"
                  >
                    {index + 1}
                  </a>
                </li>
              ))}
              <li className={isNextPageDisabled ? "disabled" : "waves-effect"}>
                <button
                  className={`btn-flat waves-effect waves-deep-purple ${
                    isNextPageDisabled ? "disabled" : ""
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={isNextPageDisabled}
                >
                  {t("MessagesComponent.Next")}
                  <i className="material-icons right">chevron_right</i>
                </button>
              </li>
            </ul>
          </>
        )}
        <button
          className="btn-floating btn-large waves-effect waves-light deep-purple lighten-2"
          style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            zIndex: "100",
          }}
          onClick={toggleScrollComponent}
        >
          <i className="material-icons">arrow_forward</i>
        </button>
      </div>
    </>
  );
};

export default MessagesComponent;
