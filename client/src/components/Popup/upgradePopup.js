// Popup.js
import React from 'react';
import Modal from 'react-modal';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { GrUpgrade } from 'react-icons/gr';
import './Popup.css';

Modal.setAppElement('#root'); // Replace '#root' with the id of your root element if it's different

const UpGradePopup = ({ isOpen, onRequestClose }) => {
  return (
    <Modal
      className="max-w-xl min-h-590 upgrade-popup bg-gray-100 rounded-lg overflow-hidden  mx-auto my-32 text-center relative"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Feature Modal"
      style={{
        overlay: {
          backgroundColor: 'rgba(0 0 0 / 50%)',
        },
      }}
    >
      <div className="bg-btn1 min-h-[40px] py-[10px] flex justify-center items-center relative">
        <AiOutlineCloseCircle
          onClick={onRequestClose}
          className="absolute text-2xl translate-y-[-50%] top-[50%] right-6 text-white cursor-pointer"
        />
      </div>

      <div className="flex flex-col justify-center items-center">
        <h3 className="flex gap-2 items-center mt-5 px-10">
          <GrUpgrade className="upgrade-icon text-2xl" />
          <span className="text-2xl font-medium">Upgrade to YuboData Enterprise</span>
        </h3>
        <p className="text-xl mt-5 px-10">
          With YuboData Enterprise, you gain the ability to add more Hubspot accounts, thus
          broadening your possibilities and enhancing your data management capabilities.
        </p>
        <button className="px-5 bg-btn1 py-2 mt-10 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300">
          Upgrade to Enterprise
        </button>
      </div>
    </Modal>
  );
};

export default UpGradePopup;
