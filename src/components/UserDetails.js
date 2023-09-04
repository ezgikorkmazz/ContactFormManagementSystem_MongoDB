import React, { useEffect, useState } from "react";
import AdminHome from "./AdminHome";
import UserHome from "./UserHome";

export default function UserDetails() {
  const [userData, setUserData] = useState({});
  const [admin, setAdmin] = useState(false);
  const [reader, setReader] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = window.localStorage.getItem("token");
      if (!token) {
        alert("Token not found, please log in again");
        window.location.href = "./login";
        return;
      }

      const response = await fetch(
        "http://localhost:5165/api/user/check-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          alert("Token expired, please log in again");
          window.localStorage.clear();
          window.location.href = "./login";
        } else {
          alert(data.error);
        }
        return;
      }

      const data = await response.json();
      setUserData(data.data.user);

      if (data.data.user.role === "admin") {
        setAdmin(true);
      }
      if (data.data.user.role === "reader") {
        setReader(true);
      }
    } catch (error) {
      alert("Error fetching user data");
    }
  };
  return <>{admin ? <AdminHome /> : <UserHome />}</>;
}
