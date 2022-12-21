import React, { useState, useEffect } from "react";
import styled from "styled-components";
import stationData from "./stationInfo.json";
import { initConnection } from "../service/socketService";

export default function Home() {
  const [station, setStation] = useState("");
  const [stationLine, setStationLine] = useState("02호선");
  const stationDataList = stationData.DATA;
  return (
    <MainWrapper>
      {station ? <h1>{station}</h1> : <h1>Choose a station</h1>}

      {[
        ...new Set(
          stationDataList.map((data) => {
            return data.line;
          })
        ),
      ].map((line, index) => (
        <span
          key={index}
          style={{
            display: "inline-block",
            padding: "0.5rem",
            cursor: "pointer",
          }}
          onClick={() => {
            setStationLine(line);
          }}
        >
          {line}
        </span>
      ))}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {stationDataList
          .filter((data) => data.line === stationLine)
          .map((data) => (
            <div key={data.code}>
              <h2>{data.name}</h2>
            </div>
          ))}
      </div>
    </MainWrapper>
  );
}

const MainWrapper = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 0 1rem;
  max-width: 700px;
  margin: 0 auto;
  overflow: auto;
`;
