import React from 'react';

const ErrorExistingPortal = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center px-10">
      <h1 className="text-6xl mb-5 text-center text-btn1">Error! 😒</h1>
      <h2 className="text-4xl text-center">A portal with that ID already exists.</h2>
    </div>
  );
};

export default ErrorExistingPortal;
