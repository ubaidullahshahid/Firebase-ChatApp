import React, { useEffect } from "react";
import Form from "./Modules/Form";
import Dashboard from "./Modules/Dashboard";
import { Route, Routes, useNavigate } from "react-router-dom";
import Notfound from "./Modules/notFound/notfound";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser, setLoading } from "./Redux/Authentication/AuthSlice";
import Loader from "./Components/loader/Loader";

const App = () => {
  const dispatch = useDispatch();

  const publicRoutes = [
    { path: "/", element: <Form isSignInPage={true} /> },
    { path: "/signup", element: <Form isSignInPage={false} /> },
  ];
  const privateRoutes = [{ path: "/", element: <Dashboard /> }];

  const redirectRoutes = ["/signup"];
  const ReDirect = () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate("/");
    }, [navigate]);

    return null;
  };

  const { currUser, loading } = useSelector((state) => state.currentUser);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    dispatch(setCurrentUser(user));
    dispatch(setLoading());
  }, [dispatch]); 

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        {(currUser ? privateRoutes : publicRoutes).map((route) => (
          <Route key={route.path} {...route} />
        ))}
        {redirectRoutes.map((path) => (
          <Route key={path} path={path} element={<ReDirect />} />
        ))}
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
};

export default App;
