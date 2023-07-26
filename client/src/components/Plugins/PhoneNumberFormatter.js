import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import axios from 'axios'; // npm install axios if you haven't installed it yet.
import 'i18n-iso-countries/langs/en.json';
import ExecuteFeatureButton from '../ExecuteFeatureButton/ExecuteFeatureButton';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const PhoneNumberFormatter = ({ userId, hubspotId, featureId }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const countryList = Object.entries(countries.getNames('en')).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  // Load selected country from Firestore on initial render
  useEffect(() => {
    const fetchSelectedCountry = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/select-country/${hubspotId}`);
        if (response.data.selectedCountry) {
          const countryCode = response.data.selectedCountry;
          setSelectedCountry({ value: countryCode, label: countries.getName(countryCode, 'en') });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSelectedCountry();
  }, [hubspotId]);

  const handleCountryChange = async (selectedOption) => {
    setSelectedCountry(selectedOption);

    // Update selected country in Firestore
    await axios.post('http://localhost:4000/api/select-country', {
      hubspotId,
      countryCode: selectedOption.value,
    });
  };

  console.log('Selected Country', selectedCountry);

  return (
    <div className="w-full max-w-[250px] mx-auto">
      <h4 className="m-0 p-4 font-semibold text-gray-600">Select Default Country</h4>
      <Select
        className="mb-10"
        options={countryList}
        isSearchable
        value={selectedCountry}
        onChange={handleCountryChange}
      />
      <ExecuteFeatureButton userId={userId} hubspotId={hubspotId} featureId={featureId} />
    </div>
  );
};

export default PhoneNumberFormatter;
