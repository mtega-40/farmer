import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    farms: 'Farms',
    livestock: 'Livestock',
    inventory: 'Inventory',
    workers: 'Workers',
    finance: 'Finance',
    tasks: 'Tasks',
    settings: 'Settings',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    phone: 'Phone',
    role: 'Role',
    
    // Farms
    addFarm: 'Add Farm',
    farmName: 'Farm Name',
    location: 'Location',
    area: 'Area (Hectares)',
    createFarm: 'Create Farm',
    editFarm: 'Edit Farm',
    delete: 'Delete',
    view: 'View',
    edit: 'Edit',
    
    // Livestock
    addAnimal: 'Add Animal',
    tagNumber: 'Tag Number',
    species: 'Species',
    breed: 'Breed',
    age: 'Age (months)',
    weight: 'Weight (kg)',
    healthStatus: 'Health Status',
    healthy: 'Healthy',
    sick: 'Sick',
    purchaseDate: 'Purchase Date',
    purchasePrice: 'Purchase Price ($)',
    
    // Inventory
    addItem: 'Add Item',
    itemName: 'Item Name',
    category: 'Category',
    quantity: 'Quantity',
    unit: 'Unit',
    minQuantity: 'Minimum Quantity',
    unitPrice: 'Unit Price ($)',
    supplier: 'Supplier',
    
    // Workers
    addWorker: 'Add Worker',
    position: 'Position',
    salary: 'Salary ($)',
    hireDate: 'Hire Date',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    
    // Finance
    addExpense: 'Add Expense',
    addIncome: 'Add Income',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    netProfit: 'Net Profit',
    description: 'Description',
    amount: 'Amount',
    date: 'Date',
    
    // Tasks
    addTask: 'Add Task',
    taskTitle: 'Task Title',
    taskDescription: 'Description',
    priority: 'Priority',
    dueDate: 'Due Date',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    back: 'Back',
    submit: 'Submit',
    success: 'Success',
    error: 'Error',
    loading: 'Loading...',
    noData: 'No data available',
    selectFarm: 'Select Farm',
    all: 'All',
  },
  sw: {
    // Navigation
    dashboard: 'Dashboard',
    farms: 'Shamba',
    livestock: 'Mifugo',
    inventory: 'Vifaa',
    workers: 'Wafanyakazi',
    finance: 'Fedha',
    tasks: 'Kazi',
    settings: 'Mipangilio',
    
    // Auth
    login: 'Ingia',
    register: 'Jisajili',
    logout: 'Toka',
    email: 'Barua pepe',
    password: 'Nywila',
    name: 'Jina',
    phone: 'Simu',
    role: 'Jukumu',
    
    // Farms
    addFarm: 'Ongeza Shamba',
    farmName: 'Jina la Shamba',
    location: 'Mkoani',
    area: 'Ekari',
    createFarm: 'Unda Shamba',
    editFarm: 'Hariri Shamba',
    delete: 'Futa',
    view: 'Ona',
    edit: 'Hariri',
    
    // Livestock
    addAnimal: 'Ongeza Mnyama',
    tagNumber: 'Namba ya Uchungu',
    species: 'Aina',
    breed: 'Kabila',
    age: 'Umri (miezi)',
    weight: 'Uzito (kg)',
    healthStatus: 'Hali ya Afya',
    healthy: 'Afya',
    sick: 'Mgonjwa',
    purchaseDate: 'Tarehe ya Ununuzi',
    purchasePrice: 'Bei ya Ununuzi ($)',
    
    // Inventory
    addItem: 'Ongeza Kifaa',
    itemName: 'Jina la Kifaa',
    category: 'Kundi',
    quantity: 'Idadi',
    unit: 'Kipimo',
    minQuantity: 'Idadi ya Chini',
    unitPrice: 'Bei ya Kipimo ($)',
    supplier: 'Msambazaji',
    
    // Workers
    addWorker: 'Ongeza Mfanyakazi',
    position: 'Kazi',
    salary: 'Mshahara ($)',
    hireDate: 'Tarehe ya Ajira',
    status: 'Hali',
    active: 'Hai',
    inactive: 'Si',
    
    // Finance
    addExpense: 'Ongeza Matumizi',
    addIncome: 'Ongeza Mapato',
    totalIncome: 'Mapato Jumla',
    totalExpenses: 'Matumizi Jumla',
    netProfit: 'Faida net',
    description: 'Maelezo',
    amount: 'Kiasi',
    date: 'Tarehe',
    
    // Tasks
    addTask: 'Ongeza Kazi',
    taskTitle: 'Jina la Kazi',
    taskDescription: 'Maelezo',
    priority: 'Kutegemea',
    dueDate: 'Tarehe ya Mwisho',
    low: 'Chini',
    medium: 'Wati',
    high: 'Ju',
    
    // Common
    save: 'Hifadhi',
    cancel: 'Ghairi',
    create: 'Unda',
    update: 'Sasisha',
    back: 'Rudi',
    submit: 'Tuma',
    success: 'Mafanikio',
    error: 'Kosa',
    loading: 'Inapimbia...',
    noData: 'Hakuna data',
    selectFarm: 'Chagua Shamba',
    all: 'Zote',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};