import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles/messages.css";
import { useTranslation } from "react-i18next";

const MessagesComponentScroll = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("creationDate");
  const [sortOrder, setSortOrder] = useState("asc");

  const [lastMessageId, setLastMessageId] = useState(null);

  const truncateMessage = (message, maxLength) => {
    if (message.length > maxLength) {
      return message.slice(0, maxLength) + "...";
    }
    return message;
  };

  const loadMessages = useCallback(async () => {
    if (!hasMore || isLoading) {
      return;
    }
    setIsLoading(true);

    const url = `http://localhost:5165/api/messages-with-pagination-scroll?lastMessageIndex=${messages.length}&perPage=10&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method: "GET",
        headers: { token },
      });

      if (!response.ok) {
        throw new Error("Error fetching messages");
      }

      const data = await response.json();

      if (data.data.messages.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prevMessages) => [...prevMessages, ...data.data.messages]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, messages.length, sortBy, sortOrder]);

  const loadMoreMessages = useCallback(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadMessages();
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

      if (isNearBottom && hasMore && !isLoading) {
        loadMoreMessages();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadMoreMessages, hasMore, isLoading]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setMessages([]);
    setHasMore(true);
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

  const markMessageAsRead = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5165/api/message/read/${id}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        const updatedMessages = messages.map((message) =>
          message.id === id ? { ...message, read: "true" } : message
        );
        setMessages(updatedMessages);
      } else {
        console.error("Error marking message as read.");
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const getSortIcon = (column) => {
    if (sortBy === column) {
      return (
        <i className={`material-icons right`}>
          {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
        </i>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="container">
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
                  message.read === "true" ? "gradient-green" : "gradient-red"
                } fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td>{message.name}</td>
                <td>{renderGenderIcon(message.gender)}</td>
                <td>{new Date(message.creationDate).toLocaleDateString()}</td>
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

      {isLoading && <p>Loading...</p>}
      {!isLoading && hasMore && (
        <div className="load-more-button">
          <button className="btn deep-purple" onClick={loadMoreMessages}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default MessagesComponentScroll;
