import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Language Context
const LanguageContext = createContext();

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations
const translations = {
  en: {
    selectLanguage: 'Select Language',
    english: 'English',
    malayalam: 'മലയാളം',
    continue: 'Continue',
    welcomeToAkshaya: 'Welcome to Akshaya E-Services',
    welcomeMessage: 'Access government services easily from your mobile device. Apply for certificates, documents, and more.',
    phoneNumber: 'Phone Number',
    getOTP: 'Get OTP',
    verifyOTP: 'Verify OTP',
    enterOTP: 'Enter OTP',
    otpSent: 'OTP sent to your phone',
    loginSuccessful: 'Login successful!',
    availableServices: 'Available Services',
    rationCard: 'Ration Card',
    birthCertificate: 'Birth Certificate',
    incomeCertificate: 'Income Certificate',
    residenceCertificate: 'Residence Certificate',
    casteCertificate: 'Caste Certificate',
    pensionScheme: 'Pension Scheme',
    cantFind: "Can't find what you're looking for?",
    callSupport: 'Call Akshaya Support',
    aboutAkshaya: 'About Akshaya E-Services',
    aboutText: 'Akshaya E-Services is a government initiative to provide easy access to various services through mobile devices.',
    home: 'Home',
    documents: 'Documents',
    payments: 'Payments',
    myAccount: 'My Account',
    myDocuments: 'My Documents',
    documentsMessage: 'This is where all your scanned documents are stored. You can view, send to Akshaya services, or delete your documents.',
    scanFirstDocument: 'Scan Your First Document',
    scanDocument: 'Scan Document',
    requiredDocuments: 'Required Documents',
    proceedToPayment: 'Proceed to Payment',
    scan: 'Scan',
    ready: 'Ready',
    uploadImage: 'Upload Image',
    openCamera: 'Open Camera',
    transactionHistory: 'Transaction History',
    timeSaved: 'Time Saved',
    moneySaved: 'Money Saved',
    visitsAvoided: 'Visits Avoided',
    paymentMethods: 'Payment Methods',
    payNow: 'Pay Now',
    notifications: 'Notifications',
    profile: 'Profile',
    editProfile: 'Edit Profile',
    logout: 'Logout',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    view: 'View',
    share: 'Share',
    delete: 'Delete',
    fee: 'Fee',
    status: 'Status',
    date: 'Date',
    amount: 'Amount',
    service: 'Service',
    completed: 'Completed',
    pending: 'Pending',
    processing: 'Processing',
    rejected: 'Rejected'
  },
  ml: {
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    english: 'English',
    malayalam: 'മലയാളം',
    continue: 'തുടരുക',
    welcomeToAkshaya: 'അക്ഷയ ഇ-സേവനങ്ങളിലേക്ക് സ്വാഗതം',
    welcomeMessage: 'നിങ്ങളുടെ മൊബൈൽ ഉപകരണത്തിൽ നിന്ന് സർക്കാർ സേവനങ്ങൾ എളുപ്പത്തിൽ ആക്സസ് ചെയ്യുക.',
    phoneNumber: 'ഫോൺ നമ്പർ',
    getOTP: 'OTP നേടുക',
    verifyOTP: 'OTP പരിശോധിക്കുക',
    enterOTP: 'OTP നൽകുക',
    otpSent: 'നിങ്ങളുടെ ഫോണിലേക്ക് OTP അയച്ചു',
    loginSuccessful: 'ലോഗിൻ വിജയകരം!',
    availableServices: 'ലഭ്യമായ സേവനങ്ങൾ',
    rationCard: 'റേഷൻ കാർഡ്',
    birthCertificate: 'ജനന സർട്ടിഫിക്കറ്റ്',
    incomeCertificate: 'വരുമാന സർട്ടിഫിക്കറ്റ്',
    residenceCertificate: 'വസതി സർട്ടിഫിക്കറ്റ്',
    casteCertificate: 'ജാതി സർട്ടിഫിക്കറ്റ്',
    pensionScheme: 'പെൻഷൻ പദ്ധതി',
    cantFind: 'നിങ്ങൾ തിരയുന്നത് കണ്ടെത്താൻ കഴിയുന്നില്ലേ?',
    callSupport: 'അക്ഷയ സപ്പോർട്ടിനെ വിളിക്കുക',
    aboutAkshaya: 'അക്ഷയ ഇ-സേവനങ്ങളെക്കുറിച്ച്',
    aboutText: 'മൊബൈൽ ഉപകരണങ്ങളിലൂടെ വിവിധ സേവനങ്ങൾ എളുപ്പത്തിൽ ആക്സസ് ചെയ്യുന്നതിനുള്ള ഒരു സർക്കാർ സംരംഭമാണ് അക്ഷയ ഇ-സേവനങ്ങൾ.',
    home: 'ഹോം',
    documents: 'രേഖകൾ',
    payments: 'പേയ്‌മെന്റുകൾ',
    myAccount: 'എന്റെ അക്കൗണ്ട്',
    myDocuments: 'എന്റെ രേഖകൾ',
    documentsMessage: 'നിങ്ങളുടെ എല്ലാ സ്കാൻ ചെയ്ത രേഖകളും ഇവിടെ സൂക്ഷിച്ചിരിക്കുന്നു.',
    scanFirstDocument: 'നിങ്ങളുടെ ആദ്യ രേഖ സ്കാൻ ചെയ്യുക',
    scanDocument: 'രേഖ സ്കാൻ ചെയ്യുക',
    requiredDocuments: 'ആവശ്യമായ രേഖകൾ',
    proceedToPayment: 'പേയ്‌മെന്റിലേക്ക് നീങ്ങുക',
    scan: 'സ്കാൻ',
    ready: 'തയ്യാർ',
    uploadImage: 'ചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
    openCamera: 'ക്യാമറ തുറക്കുക',
    transactionHistory: 'ഇടപാട് ചരിത്രം',
    timeSaved: 'സംരക്ഷിച്ച സമയം',
    moneySaved: 'സംരക്ഷിച്ച പണം',
    visitsAvoided: 'ഒഴിവാക്കിയ സന്ദർശനങ്ങൾ',
    paymentMethods: 'പേയ്‌മെന്റ് രീതികൾ',
    payNow: 'ഇപ്പോൾ പേയ് ചെയ്യുക',
    notifications: 'അറിയിപ്പുകൾ',
    profile: 'പ്രൊഫൈൽ',
    editProfile: 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക',
    logout: 'ലോഗ് ഔട്ട്',
    loading: 'ലോഡ് ചെയ്യുന്നു...',
    error: 'പിശക്',
    success: 'വിജയം',
    view: 'കാണുക',
    share: 'പങ്കിടുക',
    delete: 'ഇല്ലാതാക്കുക',
    fee: 'ഫീസ്',
    status: 'നില',
    date: 'തീയതി',
    amount: 'തുക',
    service: 'സേവനം',
    completed: 'പൂർത്തിയായി',
    pending: 'തീർപ്പുകൽപ്പിക്കാത്ത',
    processing: 'പ്രോസസ്സിംഗ്',
    rejected: 'നിരസിച്ചു'
  }
};

// Language Selection Screen
const LanguageSelection = ({ onLanguageSelect }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Select Language / ഭാഷ തിരഞ്ഞെടുക്കുക
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => onLanguageSelect('en')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
          >
            English
          </button>
          
          <button
            onClick={() => onLanguageSelect('ml')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
          >
            മലയാളം
          </button>
        </div>
      </div>
    </div>
  );
};

// Phone Authentication Screen
const PhoneAuth = ({ onAuthSuccess }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t('otpSent'));
        setStep('otp');
        // Auto-fill OTP in development (remove in production)
        setTimeout(() => setOtp('123456'), 1000);
      } else {
        setError(data.detail || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(t('loginSuccessful'));
        // Store auth token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user_id);
        onAuthSuccess(data.user_id, data.token);
      } else {
        setError(data.detail || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('welcomeToAkshaya')}
          </h1>
          <p className="text-gray-600">{t('welcomeMessage')}</p>
        </div>

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              onClick={handleRequestOTP}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? t('loading') : t('getOTP')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('enterOTP')}
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-wider"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? t('loading') : t('verifyOTP')}
            </button>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-blue-600 hover:text-blue-700 font-medium py-2"
            >
              ← Back to phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Header Component
const Header = ({ title, showBack = false, onBack }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.slice(0, 3)); // Show only 3 recent notifications
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <div className="bg-blue-800 text-white p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBack && (
            <button onClick={onBack} className="mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-blue-700 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 10v-2a6 6 0 10-12 0v2a2 2 0 100 4h12a2 2 0 100-4z" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          
          <button className="p-2 hover:bg-blue-700 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute top-16 right-4 bg-white text-gray-800 rounded-lg shadow-lg p-4 w-80 z-50">
          <h3 className="font-semibold mb-3">{t('notifications')}</h3>
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-gray-600">{notification.message}</p>
                </div>
              ))}
              <button className="text-blue-600 text-sm font-medium">
                {t('viewAll')}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No new notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

// Bottom Navigation Component
const BottomNav = ({ currentTab, onTabChange }) => {
  const { t } = useLanguage();
  
  const tabs = [
    { id: 'home', label: t('home'), icon: '🏠' },
    { id: 'documents', label: t('documents'), icon: '📄' },
    { id: 'payments', label: t('payments'), icon: '💳' },
    { id: 'account', label: t('myAccount'), icon: '👤' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
      <div className="flex justify-around">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center p-2 ${
              currentTab === tab.id ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Home Screen
const HomeScreen = ({ onServiceSelect }) => {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API}/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const serviceIcons = {
    'ration_card': '🍚',
    'birth_certificate': '👶',
    'income_certificate': '💰',
    'residence_certificate': '🏠',
    'caste_certificate': '📋',
    'pension_scheme': '👴'
  };

  return (
    <div className="pb-20">
      <div className="bg-blue-50 p-4 m-4 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          {t('welcomeToAkshaya')}
        </h2>
        <p className="text-blue-600 text-sm">{t('welcomeMessage')}</p>
      </div>

      <div className="px-4 mb-6">
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('availableServices')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {filteredServices.map(service => (
            <button
              key={service.id}
              onClick={() => onServiceSelect(service)}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="text-4xl mb-2">{serviceIcons[service.id] || '📋'}</div>
              <div className="text-sm font-medium text-gray-800">{service.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600 mb-3">{t('cantFind')}</p>
          <button className="w-full bg-blue-50 text-blue-600 font-medium py-3 px-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
            📞 {t('callSupport')}
          </button>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {t('aboutAkshaya')}
          </h3>
          <p className="text-gray-600 text-sm">{t('aboutText')}</p>
        </div>
      </div>
    </div>
  );
};

// Service Detail Screen
const ServiceDetailScreen = ({ service, onBack, onDocumentScan }) => {
  const { t } = useLanguage();
  const [userDocuments, setUserDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserDocuments();
  }, []);

  const fetchUserDocuments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const hasDocument = (docType) => {
    return userDocuments.some(doc => doc.type === docType);
  };

  const allDocumentsReady = service.required_documents.every(doc => 
    hasDocument(doc.type)
  );

  const handleProceedToPayment = async () => {
    if (!allDocumentsReady) {
      alert('Please upload all required documents first');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const documentIds = service.required_documents.map(reqDoc => {
        const userDoc = userDocuments.find(doc => doc.type === reqDoc.type);
        return userDoc ? userDoc.id : null;
      }).filter(id => id !== null);

      const response = await fetch(`${API}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_name: service.name,
          service_id: service.id,
          fee: service.fee,
          documents: documentIds
        }),
      });

      if (response.ok) {
        alert('Application submitted successfully!');
        onBack();
      } else {
        alert('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-blue-50 p-4 m-4 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          {service.name}
        </h2>
        <p className="text-blue-600 text-sm mb-2">{service.description}</p>
        <p className="text-blue-800 font-medium">
          {t('fee')}: ₹{service.fee}
        </p>
      </div>

      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t('requiredDocuments')}
        </h3>
        <div className="space-y-3">
          {service.required_documents.map((doc, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{doc.name}</h4>
                <button
                  onClick={() => onDocumentScan(doc.type)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    hasDocument(doc.type)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {hasDocument(doc.type) ? t('ready') : t('scan')}
                </button>
              </div>
              <p className="text-gray-600 text-sm">{doc.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={handleProceedToPayment}
          disabled={!allDocumentsReady || loading}
          className={`w-full py-4 px-6 rounded-lg font-semibold ${
            allDocumentsReady && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? t('loading') : `${t('proceedToPayment')} (₹${service.fee})`}
        </button>
      </div>
    </div>
  );
};

// Document Scanner Screen
const DocumentScannerScreen = ({ documentType, onBack, onDocumentSaved }) => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API}/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: selectedFile.name,
            type: documentType,
            file_data: base64Data
          }),
        });

        if (response.ok) {
          const savedDoc = await response.json();
          onDocumentSaved(savedDoc);
          alert('Document saved successfully!');
          onBack();
        } else {
          alert('Failed to save document');
        }
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document');
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="bg-blue-50 p-4 m-4 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          {t('scanDocument')}
        </h2>
        <p className="text-blue-600 text-sm">
          Upload or take a photo of your {documentType.replace('_', ' ')} document
        </p>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          {preview ? (
            <div className="mb-4">
              <img src={preview} alt="Document preview" className="max-w-full h-48 object-contain mx-auto rounded-lg" />
            </div>
          ) : (
            <div className="mb-4">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="w-full bg-blue-50 text-blue-600 border border-blue-200 font-medium py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors duration-200 cursor-pointer block">
                {t('uploadImage')}
              </span>
            </label>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer block">
                {t('openCamera')}
              </span>
            </label>

            {selectedFile && (
              <button
                onClick={handleSaveDocument}
                disabled={loading}
                className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? t('loading') : 'Save Document'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Documents Screen
const DocumentsScreen = ({ onDocumentScan }) => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleViewDocument = (document) => {
    // Create a new window/tab to view the document
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head><title>${document.name}</title></head>
        <body style="margin: 0; padding: 20px; text-align: center;">
          <h2>${document.name}</h2>
          <img src="${document.file_data}" style="max-width: 100%; height: auto;" />
        </body>
      </html>
    `);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-blue-50 p-4 m-4 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          {t('myDocuments')}
        </h2>
        <p className="text-blue-600 text-sm">{t('documentsMessage')}</p>
      </div>

      {documents.length === 0 ? (
        <div className="px-4 text-center py-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No documents yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start by scanning your first document
            </p>
            <button
              onClick={() => onDocumentScan('general')}
              className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {t('scanFirstDocument')}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {documents.map(document => (
            <div key={document.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">{document.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {document.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewDocument(document)}
                  className="flex-1 bg-blue-50 text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  👁️ {t('view')}
                </button>
                <button
                  onClick={() => navigator.share && navigator.share({ files: [document.file_data] })}
                  className="flex-1 bg-green-50 text-green-600 font-medium py-2 px-3 rounded-lg hover:bg-green-100 transition-colors duration-200"
                >
                  📤 {t('share')}
                </button>
                <button
                  onClick={() => handleDeleteDocument(document.id)}
                  className="flex-1 bg-red-50 text-red-600 font-medium py-2 px-3 rounded-lg hover:bg-red-100 transition-colors duration-200"
                >
                  🗑️ {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => onDocumentScan('general')}
        className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

// Payments Screen
const PaymentsScreen = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('history');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [savings, setSavings] = useState({ time_saved: '0h', money_saved: '₹0', visits_avoided: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch payment history
      const historyResponse = await fetch(`${API}/payments/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setPaymentHistory(historyData);
      }

      // Fetch savings data
      const savingsResponse = await fetch(`${API}/analytics/savings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (savingsResponse.ok) {
        const savingsData = await savingsResponse.json();
        setSavings(savingsData);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'history', label: 'History' },
    { id: 'methods', label: 'Methods' },
    { id: 'pay', label: 'Pay Now' }
  ];

  return (
    <div className="pb-20">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'history' && (
        <div>
          <div className="bg-blue-50 p-4 m-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              {t('transactionHistory')}
            </h2>
            <p className="text-blue-600 text-sm">
              View your payment history and status
            </p>
          </div>

          {/* Savings Cards */}
          <div className="px-4 mb-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{savings.time_saved}</div>
                <div className="text-xs text-blue-600">{t('timeSaved')}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{savings.money_saved}</div>
                <div className="text-xs text-green-600">{t('moneySaved')}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{savings.visits_avoided}</div>
                <div className="text-xs text-purple-600">{t('visitsAvoided')}</div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="px-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600">{t('loading')}</div>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-600">No payment history yet</div>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">{payment.service}</h3>
                        <p className="text-sm text-gray-600">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">₹{payment.amount}</div>
                        <div className="text-sm text-green-600">{payment.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'methods' && (
        <div className="px-4">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Payment Methods
            </h3>
            <p className="text-gray-600 mb-4">
              Add your preferred payment methods
            </p>
            <button className="bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              + Add Payment Method
            </button>
          </div>

          <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
            <h4 className="font-medium text-gray-800 mb-3">Secured by Akshaya Payment Gateway</h4>
            <div className="flex justify-center space-x-4 text-sm text-gray-600">
              <span>💳 Visa</span>
              <span>💳 MasterCard</span>
              <span>💳 RuPay</span>
              <span>📱 UPI</span>
              <span>📱 GPay</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pay' && (
        <div className="px-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Make a Payment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service ID / Reference Number
                </label>
                <input
                  type="text"
                  placeholder="Enter service ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Account Screen
const AccountScreen = ({ onLogout }) => {
  const { t } = useLanguage();
  const [user, setUser] = useState({ name: 'User', phone: '+91 9876543210' });

  const menuItems = [
    { id: 'documents', label: t('myDocuments'), icon: '📄' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'settings', label: 'App Settings', icon: '⚙️' },
    { id: 'help', label: 'Help & Support', icon: '❓' },
  ];

  return (
    <div className="pb-20">
      {/* User Profile Card */}
      <div className="bg-white p-6 m-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.phone}</p>
          </div>
          <button className="text-blue-600 font-medium">
            {t('editProfile')}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            className="w-full bg-white p-4 rounded-lg shadow-md flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{item.icon}</span>
              <span className="font-medium text-gray-800">{item.label}</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-6">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          🚪 {t('logout')}
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || null);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedService, setSelectedService] = useState(null);
  const [scanningDocumentType, setScanningDocumentType] = useState(null);

  useEffect(() => {
    if (authToken) {
      const userId = localStorage.getItem('userId');
      setUser({ id: userId });
    }
  }, [authToken]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleAuthSuccess = (userId, token) => {
    setUser({ id: userId });
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setCurrentScreen('home');
    setCurrentTab('home');
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setCurrentScreen('service-detail');
  };

  const handleDocumentScan = (docType) => {
    setScanningDocumentType(docType);
    setCurrentScreen('document-scanner');
  };

  const handleDocumentSaved = (document) => {
    // Refresh the current screen or update state as needed
    console.log('Document saved:', document);
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'home') {
      setCurrentScreen('home');
    } else if (tab === 'documents') {
      setCurrentScreen('documents');
    } else if (tab === 'payments') {
      setCurrentScreen('payments');
    } else if (tab === 'account') {
      setCurrentScreen('account');
    }
  };

  const handleBack = () => {
    if (currentScreen === 'service-detail') {
      setCurrentScreen('home');
      setCurrentTab('home');
    } else if (currentScreen === 'document-scanner') {
      if (selectedService) {
        setCurrentScreen('service-detail');
      } else {
        setCurrentScreen('documents');
        setCurrentTab('documents');
      }
    }
  };

  const getScreenTitle = () => {
    const titles = {
      home: 'Akshaya E-Services',
      documents: 'My Documents',
      payments: 'Payments',
      account: 'My Account',
      'service-detail': selectedService?.name || 'Service Details',
      'document-scanner': 'Scan Document'
    };
    return titles[currentScreen] || 'Akshaya E-Services';
  };

  if (!language) {
    return <LanguageSelection onLanguageSelect={handleLanguageSelect} />;
  }

  if (!user) {
    return (
      <LanguageContext.Provider value={{ language, t: (key) => translations[language][key] || key }}>
        <PhoneAuth onAuthSuccess={handleAuthSuccess} />
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, t: (key) => translations[language][key] || key }}>
      <AuthContext.Provider value={{ user, logout: handleLogout }}>
        <div className="min-h-screen bg-gray-50">
          <Header 
            title={getScreenTitle()}
            showBack={currentScreen !== 'home' && !['documents', 'payments', 'account'].includes(currentScreen)}
            onBack={handleBack}
          />
          
          <main className="min-h-screen">
            {currentScreen === 'home' && (
              <HomeScreen onServiceSelect={handleServiceSelect} />
            )}
            
            {currentScreen === 'service-detail' && selectedService && (
              <ServiceDetailScreen 
                service={selectedService}
                onBack={handleBack}
                onDocumentScan={handleDocumentScan}
              />
            )}
            
            {currentScreen === 'document-scanner' && (
              <DocumentScannerScreen 
                documentType={scanningDocumentType}
                onBack={handleBack}
                onDocumentSaved={handleDocumentSaved}
              />
            )}
            
            {currentScreen === 'documents' && (
              <DocumentsScreen onDocumentScan={handleDocumentScan} />
            )}
            
            {currentScreen === 'payments' && (
              <PaymentsScreen />
            )}
            
            {currentScreen === 'account' && (
              <AccountScreen onLogout={handleLogout} />
            )}
          </main>
          
          <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
        </div>
      </AuthContext.Provider>
    </LanguageContext.Provider>
  );
};

export default App;