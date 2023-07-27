import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { RiDeleteBin6Line } from 'react-icons/ri';
import axios from 'axios';
import * as XLSX from 'xlsx';
import baseURL from '../../url';

const hubspotPropertyNames = ['firstname', 'lastname', 'phone', 'website']; // This can be fetched dynamically

const DataUploader = ({ userId, hubspotId, featureId }) => {
  const [columns, setColumns] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [jsonData, setJsonData] = useState([]);

  const onDrop = useCallback((files) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setColumns(jsonData[0]); // Assuming the first row contains column names
      setJsonData(jsonData.slice(1));
    };
    reader.readAsBinaryString(files[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleAddField = () => {
    setSelectedFields([...selectedFields, { column: '', property: '' }]);
  };

  const handleSelectChange = (selectedValue, index, type) => {
    const newSelectedFields = [...selectedFields];
    newSelectedFields[index][type] = selectedValue;
    setSelectedFields(newSelectedFields);
  };

  const handleDeleteField = (index) => {
    const newSelectedFields = [...selectedFields];
    newSelectedFields.splice(index, 1);
    setSelectedFields(newSelectedFields);
  };

  const handleSubmit = async () => {
    const fieldMappings = selectedFields.filter((field) => field.column && field.property);
    if (fieldMappings.length === 0) {
      alert('Please select at least one field');
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}/api/execute-feature/${userId}/${hubspotId}/${featureId}`,
        {
          jsonData,
          fieldMappings,
        }
      );

      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }

      alert('Data processed successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing data');
    }
  };

  return (
    <div className="overflow-y-auto flex flex-col items-center pb-10">
      <div
        className="bg-gray-400 w-fit mx-auto px-5 py-10 rounded-[30px] mb-5 font-medium"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {selectedFields.map((field, index) => (
        <div key={index} className="mb-3">
          <div className="flex items-center gap-5">
            <div className="flex  flex-col mb-3">
              <label className="font-semibold mb-3 uppercase text-[12px]">
                Select Excel Column
              </label>
              <select
                onChange={(e) => handleSelectChange(e.target.value, index, 'column')}
                className="form-select border-2 px-5 py-1 border-btn1 rounded-xl"
              >
                <option value="">Select...</option>
                {columns.map((column, idx) => (
                  <option key={idx} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col mb-3">
              <label className="font-semibold mb-3 uppercase text-[12px]">
                Select HubSpot Property
              </label>
              <select
                onChange={(e) => handleSelectChange(e.target.value, index, 'property')}
                className="form-select border-2 px-5 py-1 border-btn1 rounded-xl"
              >
                <option value="">Select...</option>
                {hubspotPropertyNames.map((property, idx) => (
                  <option key={idx} value={property}>
                    {property}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-[1.5rem]">
              <button
                onClick={() => handleDeleteField(index)}
                className="bg-red-500 text-white px-2 py-1 rounded-md"
              >
                <RiDeleteBin6Line className="text-red-900" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={handleAddField}
        className="bg-btn1 px-5 py-1 text-white hover:drop-shadow-lg rounded-xl block mx-auto"
      >
        Add Field
      </button>

      <div>
        <button
          onClick={handleSubmit} // Added this button
          className="bg-btn2 px-5 py-1 text-white hover:drop-shadow-lg rounded-xl block mx-auto mt-3"
        >
          Submit Data
        </button>
      </div>
    </div>
  );
};

export default DataUploader;
