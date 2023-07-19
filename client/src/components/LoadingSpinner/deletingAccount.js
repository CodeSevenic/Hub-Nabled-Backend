import React from 'react';
import './deletingAccount.css';

export default function DeletingAccountLoading() {
  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-10 bg-[#ffffffa6]">
      <div className="spinner-container absolute left-[50%] translate-x-[-50%] top-[10%] translate-y-[-50%]">
        <div className="deleting-loading-spinner"></div>
      </div>
    </div>
  );
}
