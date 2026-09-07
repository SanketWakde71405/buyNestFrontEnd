import React from "react";
import { Outlet } from "react-router-dom";
function ViewLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default ViewLayout;
