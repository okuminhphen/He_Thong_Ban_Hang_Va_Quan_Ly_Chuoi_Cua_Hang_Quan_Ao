import React from "react";
import Nav from "../components/Navigation/Nav";
import Footer from "../components/Footer/Footer";

const MainLayout = ({ children }) => {
  return (
    <>
      <div className="app-header">
        <Nav />
      </div>
      <div className="app-container">{children}</div>
      <div className="app-footer">
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
