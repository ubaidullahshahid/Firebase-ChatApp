import React from "react";

const Button = ({ label = "button", type = "button", className = "" }) => {
  return (
    <div className="w-1/2">
      <button
        type={type}
        className={`text-white bg-primary hover:bg-primary focus:outline-none focus:border focus:border-blue-800 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center ${className}`}
      >
        {label}
      </button>
    </div>
  );
};

export default Button;
