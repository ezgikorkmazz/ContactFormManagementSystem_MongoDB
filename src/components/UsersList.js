import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "materialize-css/dist/css/materialize.min.css";

import "../styles/UsersList.css";
import { useTranslation } from "react-i18next";

const UsersList = () => {
  const role = window.localStorage.getItem("role");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getUsers();
  }, []);

  const { t } = useTranslation();
  const getUsers = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5165/api/users", {
      method: "GET",
      headers: { token },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.data.users);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const togglePasswordVisibility = (userId) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, passwordVisible: !user.passwordVisible };
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  if (loading) {
    return <div>{t("UsersList.loading")}</div>;
  }

  return (
    <>
      <div className="container center-align">
        <h1 className="deep-purple-text" style={{ marginBottom: "50px" }}>
          {t("UsersList.pageTitle")}
        </h1>
        <div className="fixed-action-btn">
          <Link
            to="/add-user"
            className="btn-floating btn-large waves-effect waves-light pink"
          >
            <i className="material-icons">add</i>
          </Link>
        </div>
        {currentUsers.length === 0 ? (
          <div>{t("UsersList.noUsersFound")}</div>
        ) : (
          <div>
            <div className="table-container">
              <table className="striped centered">
                <thead>
                  <tr>
                    <th>{t("UsersList.photo")}</th>
                    <th>{t("UsersList.role")}</th>
                    <th>{t("UsersList.name")}</th>
                    <th>{t("UsersList.password")}</th>
                    <th>{t("UsersList.edit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={` fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td>
                        {user.base64Photo && (
                          <img
                            src={`${user.base64Photo}`}
                            alt={user.username}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </td>
                      <td
                        style={{ fontWeight: "bold", fontSize: "16px" }}
                        //className={`${darkMode ? "white-text" : "pink-text"}`}
                      >
                        {user.role}
                      </td>
                      <td
                        style={{ fontWeight: "bold", fontSize: "16px" }}
                        //className={`${darkMode ? "pink-text" : "pink-text"}`}
                      >
                        {user.username}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          //className={`${darkMode ? "pink-text" : "pink-text"}`}
                        >
                          {user.passwordVisible ? (
                            user.password
                          ) : (
                            <span
                            //className={`${ darkMode ? "pink-text" : "pink-text"}`}
                            >
                              ••••••••
                            </span>
                          )}
                          <button
                            className="btn-flat waves-effect pink-text"
                            onClick={() => togglePasswordVisibility(user.id)}
                            style={{ marginLeft: "8px" }}
                          >
                            <i className="material-icons" c>
                              {user.passwordVisible
                                ? "visibility_off"
                                : "visibility"}
                            </i>
                          </button>
                        </div>
                      </td>
                      <td>
                        {role === "admin" && (
                          <Link to={`/edit-user/${user.id}`}>
                            <button className="btn btn-small waves-effect waves-light deep-purple">
                              <i className="material-icons">edit</i>
                            </button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ul className="pagination center-align ">
          <br />
          {Array.from(
            { length: Math.ceil(users.length / itemsPerPage) },
            (_, index) => (
              <li
                key={index}
                className={
                  currentPage === index + 1 ? "active" : "waves-effect "
                }
              >
                <button
                  className="btn-flat "
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            )
          )}
        </ul>
      </div>
    </>
  );
};

export default UsersList;
