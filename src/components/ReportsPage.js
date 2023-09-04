import React, { useState, useEffect } from "react";
import { Bar, Pie, PolarArea, Radar } from "react-chartjs-2";
import "materialize-css/dist/css/materialize.min.css";
import Chart from "chart.js/auto";
import { useTranslation } from "react-i18next";

const Reports = () => {
  const [countryMessageData, setCountryMessageData] = useState(null);
  const [genderMessageData, setGenderMessageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const darkMode = window.localStorage.getItem("darkMode");
  const { t } = useTranslation();

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    const token = localStorage.getItem("token");
    try {
      const countriesResponse = await fetch(
        "http://localhost:5165/api/countries",
        {
          method: "GET",
          headers: { token },
        }
      );
      const countriesData = await countriesResponse.json();

      const messagesResponse = await fetch(
        "http://localhost:5165/api/messages",
        {
          method: "GET",
          headers: { token },
        }
      );
      const messagesData = await messagesResponse.json();

      const countryMessageCounts = {};
      messagesData.data.messages.forEach((message) => {
        const country = message.country;
        countryMessageCounts[country] =
          (countryMessageCounts[country] || 0) + 1;
      });

      const genderMessageCounts = {
        male: 0,
        female: 0,
      };
      messagesData.data.messages.forEach((message) => {
        const gender = message.gender;
        genderMessageCounts[gender]++;
      });

      setCountryMessageData(countryMessageCounts);
      setGenderMessageData(genderMessageCounts);
      setLoading(false);
    } catch (error) {
      setError(t("Reports.errorFetchingData"));
      setLoading(false);
    }
  };

  if (loading) {
    return <div>{t("Reports.loading")}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="container">
        <h1
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "50px",
          }}
          className="deep-purple-text"
        >
          {t("Reports.pageTitle")}
        </h1>
        <div className="row">
          <div className="col s6">
            <h5
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "50px",
              }}
              className="pink-text"
            >
              {t("Reports.messageCountByCountry")}
            </h5>
            {countryMessageData ? (
              <Bar
                data={{
                  labels: Object.keys(countryMessageData),
                  datasets: [
                    {
                      label: "Messages",
                      data: Object.values(countryMessageData),
                      backgroundColor: "#7e57c2 ",
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            ) : (
              <div>{t("Reports.noData")}</div>
            )}
          </div>
          <div className="col s6">
            <h5
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "50px",
              }}
              className="pink-text"
            >
              {t("Reports.messageCountByGender")}
            </h5>
            {genderMessageData ? (
              <Pie
                data={{
                  labels: Object.keys(genderMessageData),
                  datasets: [
                    {
                      data: Object.values(genderMessageData),
                      backgroundColor: ["#7e57c2 ", "#e91e63"],
                    },
                  ],
                }}
              />
            ) : (
              <div>{t("Reports.noData")}</div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col s6">
            <h5
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "50px",
              }}
              className="pink-text"
            >
              {t("Reports.messageCountByGenderPolar")}
            </h5>
            {genderMessageData ? (
              <PolarArea
                data={{
                  labels: Object.keys(genderMessageData),
                  datasets: [
                    {
                      data: Object.values(genderMessageData),
                      backgroundColor: "#e91e63 ",
                    },
                  ],
                }}
                options={{
                  scales: {
                    r: {
                      suggestedMin: 0,
                    },
                  },
                }}
              />
            ) : (
              <div>{t("Reports.noData")}</div>
            )}
          </div>
          <div className="col s6">
            <h5
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "50px",
              }}
              className="pink-text"
            >
              {t("Reports.messageCountByGenderRadar")}
            </h5>
            {genderMessageData ? (
              <Radar
                data={{
                  labels: Object.keys(genderMessageData),
                  datasets: [
                    {
                      data: Object.values(genderMessageData),
                      backgroundColor: "#7e57c2 ",
                    },
                  ],
                }}
                options={{
                  scales: {
                    r: {
                      suggestedMin: 0,
                    },
                  },
                }}
              />
            ) : (
              <div>{t("Reports.noData")}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
