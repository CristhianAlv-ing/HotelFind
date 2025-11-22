export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const countries: Country[] = [
  { name: 'Bahamas', code: 'BS', dialCode: '+1-242', flag: '🇧🇸' },
  { name: 'Barbados', code: 'BB', dialCode: '+1-246', flag: '🇧🇧' },
  { name: 'Antigua y Barbuda', code: 'AG', dialCode: '+1-268', flag: '🇦🇬' },
  { name: 'Jamaica', code: 'JM', dialCode: '+1-876', flag: '🇯🇲' },
  { name: 'Trinidad y Tobago', code: 'TT', dialCode: '+1-868', flag: '🇹🇹' },
  { name: 'República Dominicana', code: 'DO', dialCode: '+1-809', flag: '🇩🇴' },
  { name: 'Granada', code: 'GD', dialCode: '+1-473', flag: '🇬🇩' },
  { name: 'Dominica', code: 'DM', dialCode: '+1-767', flag: '🇩🇲' },
  { name: 'Santa Lucía', code: 'LC', dialCode: '+1-758', flag: '🇱🇨' },
  { name: 'San Vicente y las Granadinas', code: 'VC', dialCode: '+1-784', flag: '🇻🇨' },
  { name: 'San Cristóbal y Nieves', code: 'KN', dialCode: '+1-869', flag: '🇰🇳' },
  { name: 'Canadá', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Estados Unidos', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'Belice', code: 'BZ', dialCode: '+501', flag: '🇧🇿' },
  { name: 'Guatemala', code: 'GT', dialCode: '+502', flag: '🇬🇹' },
  { name: 'El Salvador', code: 'SV', dialCode: '+503', flag: '🇸🇻' },
  { name: 'Honduras', code: 'HN', dialCode: '+504', flag: '🇭🇳' },
  { name: 'Nicaragua', code: 'NI', dialCode: '+505', flag: '🇳🇮' },
  { name: 'Costa Rica', code: 'CR', dialCode: '+506', flag: '🇨🇷' },
  { name: 'Panamá', code: 'PA', dialCode: '+507', flag: '🇵🇦' },
  { name: 'Cuba', code: 'CU', dialCode: '+53', flag: '🇨🇺' },
  { name: 'Haití', code: 'HT', dialCode: '+509', flag: '🇭🇹' },
  { name: 'México', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
  { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
  { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪' },
  { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨' },
  { name: 'Perú', code: 'PE', dialCode: '+51', flag: '🇵🇪' },
  { name: 'Bolivia', code: 'BO', dialCode: '+591', flag: '🇧🇴' },
  { name: 'Guyana', code: 'GY', dialCode: '+592', flag: '🇬🇾' },
  { name: 'Surinam', code: 'SR', dialCode: '+597', flag: '🇸🇷' },
  { name: 'Brasil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
  { name: 'Paraguay', code: 'PY', dialCode: '+595', flag: '🇵🇾' },
  { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱' },
  { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
  { name: 'Uruguay', code: 'UY', dialCode: '+598', flag: '🇺🇾' },
  { name: 'España', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
  { name: 'Reino Unido', code: 'UK', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Francia', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Alemania', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'Italia', code: 'IT', dialCode: '+39', flag: '🇮🇹' },
  { name: 'Portugal', code: 'PT', dialCode: '+351', flag: '🇵🇹' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Japón', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Nueva Zelanda', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
].sort((a, b) => a.dialCode.localeCompare(b.dialCode));

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return countries.find(c => c.dialCode === dialCode);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(c => c.code === code);
};

// Función para generar placeholder según el país
export const getPhonePlaceholder = (dialCode: string): string => {
  const dialCodeOnly = dialCode.replace('+', '');
  
  if (dialCode === '+1' || dialCode === '+1-242' || dialCode === '+1-246' || 
      dialCode === '+1-268' || dialCode === '+1-876' || dialCode === '+1-868' ||
      dialCode === '+1-809' || dialCode === '+1-473' || dialCode === '+1-767' ||
      dialCode === '+1-758' || dialCode === '+1-784' || dialCode === '+1-869') {
    return `${dialCode} ### #### - ####`;
  } else if (dialCode === '+504') {
    return `${dialCode} #### - ####`;
  } else if (dialCode === '+55') {
    return `${dialCode} ## ##### - ####`;
  } else if (dialCode === '+52') {
    return `${dialCode} ### ### ####`;
  } else {
    return `${dialCode} ### ### ####`;
  }
};