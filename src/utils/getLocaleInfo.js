import {getLocales} from 'react-native-localize';

const getLocaleInfo = () => {
  const locales = getLocales();

  // Prefer first Indian locale
  const indianLocale = locales.find(locale => locale.countryCode === 'IN');

  const regionCode =
    indianLocale?.countryCode || locales[0]?.countryCode || 'IN';
  const languageCode =
    indianLocale?.languageCode || locales[0]?.languageCode || 'en';

  return {regionCode, languageCode};
};

export default getLocaleInfo;
