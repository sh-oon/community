import React, { useEffect } from "react";
import { Router } from "react-router-dom";
import styled from "styled-components";

const NotFoundPage = () => (
  // 10초 뒤에 메인 페이지로 이동
  useEffect(() => {
    setTimeout(() => {
      window.location.href = "/";
    }, 10000);
  }, []),
  (
    <>
      <NotFoundPageStyle>
        <div id="main">
          <div className="fof">
            <h1>페이지를 찾을 수 없습니다.</h1>
          </div>
        </div>
      </NotFoundPageStyle>
    </>
  )
);

export default NotFoundPage;

const NotFoundPageStyle = styled.article`
  #main {
    display: table;
    width: 100%;
    height: 100vh;
    text-align: center;
  }

  .fof {
    display: table-cell;
    vertical-align: middle;
  }

  .fof h1 {
    font-size: 45px;
    display: inline-block;
    padding-right: 12px;
    color: #888;
    animation: type 0.5s alternate infinite;
  }

  @keyframes type {
    from {
      box-shadow: inset -3px 0px 0px #888;
    }
    to {
      box-shadow: inset -3px 0px 0px transparent;
    }
  }
`;
