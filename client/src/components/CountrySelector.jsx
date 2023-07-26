import React from 'react';
import Select from 'react-select';
import countries from 'i18n-iso-countries';
import 'i18n-iso-countries/langs/en.json';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

function CountrySelector() {
  const countryList = Object.entries(countries.getNames('en')).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  return <Select options={countryList} isSearchable />;
}

export default CountrySelector;
