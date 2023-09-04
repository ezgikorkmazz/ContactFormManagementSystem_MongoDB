import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeaderMenu from "./components/HeaderMenu"; // Import HeaderMenu component
import Login from "./components/LoginComponent";
import UserDetails from "./components/UserDetails";
import ContactForm from "./components/ContactForm";
import MessagesComponent from "./components/MessagesComponent";
import MessageDetails from "./components/MessageDetails";
import UsersList from "./components/UsersList";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import Reports from "./components/ReportsPage";
import NotAuthorizedPage from "./components/NotAuthorizedPage";
import NotFoundPage from "./components/NotFoundPage";

function App() {
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  const role = window.localStorage.getItem("role");
  const renderWithHeader = (Component) => (
    <>
      <HeaderMenu />
      <Component />
    </>
  );

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            exact
            path="/login"
            element={isLoggedIn == "true" ? <UserDetails /> : <Login />}
          />
          <Route
            path="/userDetails"
            element={
              role === "admin" || role === "reader" ? (
                renderWithHeader(UserDetails)
              ) : (
                <NotAuthorizedPage />
              )
            }
          />
          <Route path="/" element={renderWithHeader(ContactForm)} />
          <Route
            path="/messages"
            element={
              role === "admin" || role === "reader" ? (
                renderWithHeader(MessagesComponent)
              ) : (
                <NotAuthorizedPage />
              )
            }
          />
          <Route
            path="/message/:id"
            element={
              role === "admin" || role === "reader" ? (
                renderWithHeader(MessageDetails)
              ) : (
                <NotAuthorizedPage />
              )
            }
          />
          <Route
            exact
            path="/users"
            element={
              role === "admin" ? (
                renderWithHeader(UsersList)
              ) : (
                <NotAuthorizedPage />
              )
            }
          />
          <Route
            path="/add-user"
            element={
              role === "admin" ? (
                renderWithHeader(AddUser)
              ) : (
                <NotAuthorizedPage />
              )
            }
          />
          <Route
            path="/edit-user/:id"
            element={
              role === "admin" ? (
                renderWithHeader(EditUser)
              ) : (
                <NotAuthorizedPage />
              )
            }
          />
          <Route
            path="/reports"
            element={
              role === "admin" ? (
                renderWithHeader(Reports)
              ) : (
                <NotAuthorizedPage />
              )
            }
          />
          <Route path="*" element={renderWithHeader(NotFoundPage)} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
