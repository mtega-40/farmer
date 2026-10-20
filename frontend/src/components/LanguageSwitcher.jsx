import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      >
        <Globe className="h-4 w-4" />
        <span>{language === 'en' ? 'EN' : 'SW'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <button
            onClick={() => {
              changeLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
              language === 'en' ? 'bg-green-50 text-green-700' : 'text-gray-700'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => {
              changeLanguage('sw');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
              language === 'sw' ? 'bg-green-50 text-green-700' : 'text-gray-700'
            }`}
          >
            🇹🇿 Kiswahili
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;