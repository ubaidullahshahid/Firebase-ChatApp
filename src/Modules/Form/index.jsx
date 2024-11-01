import React, { useState } from "react";
import Input from "../../Components/input/input";
import Button from "../../Components/Button";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../Config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../../Redux/Authentication/AuthSlice";
import { doc, setDoc } from "firebase/firestore";

const Form = ({ isSignInPage = true }) => {
  const [data, setData] = useState({
    ...(!isSignInPage && {
      fullName: "",
    }),
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isSignInPage) {
      createUserWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
          toast.success("User created successfully");
          const { uid, email } = userCredential.user;
          localStorage.setItem("currentUser", JSON.stringify({ uid, email }));
          dispatch(setCurrentUser({ uid, email }));
          setDoc(doc(db, "users", uid), {
            uid: uid,
            email: email,
            userName: data.fullName,
            createdAt: new Date(),
          });
        })
        .catch((error) => {
          toast.error(error.message);
        });
    } else {
      signInWithEmailAndPassword(auth, data.email, data.password)
        .then((userCredential) => {
          toast.success("User logged in successfully");
          const { uid, email } = userCredential.user;
          localStorage.setItem("currentUser", JSON.stringify({ uid, email }));
          dispatch(setCurrentUser({ uid, email }));
          navigate("/");
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  };

  return (
    <div className="bg-[#edf3fc] h-screen flex justify-center items-center">
      <div className="bg-white w-[400px] py-10 shadow-lg rounded-[30px] flex flex-col justify-center items-center">
        <div className="text-4xl font-bold">
          {isSignInPage ? "SignIn" : "SignUp"}
        </div>
        <div className="text-xl font-light mb-4 mt-4">
          {isSignInPage
            ? "Sign in to get expored"
            : "Sign up now to get started"}
        </div>
        <form
          className="w-full flex flex-col items-center pr-10"
          onSubmit={handleSubmit}
        >
          {!isSignInPage && (
            <Input
              label="Full Name"
              name="name"
              inputClassName="mb-6"
              placeholder="Enter your name"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
            />
          )}
          <Input
            label="Email"
            name="email"
            placeholder="Enter your email"
            type="email"
            inputClassName="mb-6"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            inputClassName="mb-6"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />
          <Button
            label={!isSignInPage ? "Sign Up" : "Sign In"}
            className="mt-2 mb-6 "
            type="submit"
          />
        </form>
        <div>
          {isSignInPage
            ? "Did'nt have an account?"
            : "Already have an Account?"}{" "}
          <Link
            className="text-primary cursor-pointer underline"
            to={isSignInPage ? "/signup" : "/"}
          >
            {isSignInPage ? "Sign up" : "Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Form;
