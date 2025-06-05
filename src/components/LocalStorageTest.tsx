import React, { useState, useEffect } from 'react';

const LocalStorageTest: React.FC = () => {
  const [testValue, setTestValue] = useState<string>('');
  const [savedValue, setSavedValue] = useState<string | null>(null);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  // Update the list of keys in localStorage
  const updateStorageKeys = () => {
    const keys = Object.keys(localStorage);
    setStorageKeys(keys);
    
    // Check for auth tokens
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setSavedValue(accessToken.substring(0, 20) + '...');
    } else {
      setSavedValue(null);
    }
  };

  // Save a test value to localStorage
  const saveToLocalStorage = () => {
    if (testValue) {
      localStorage.setItem('testValue', testValue);
      updateStorageKeys();
    }
  };

  // Clear the test value from localStorage
  const clearTestValue = () => {
    localStorage.removeItem('testValue');
    updateStorageKeys();
  };

  // Initialize
  useEffect(() => {
    updateStorageKeys();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px', margin: '20px' }}>
      <h2>LocalStorage Test</h2>
      
      <div>
        <h3>Current localStorage Keys:</h3>
        {storageKeys.length > 0 ? (
          <ul>
            {storageKeys.map(key => (
              <li key={key}>{key}: {key === 'accessToken' && savedValue ? savedValue : 'value exists'}</li>
            ))}
          </ul>
        ) : (
          <p>No items in localStorage</p>
        )}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={testValue}
          onChange={(e) => setTestValue(e.target.value)}
          placeholder="Enter a test value"
        />
        <button 
          onClick={saveToLocalStorage}
          style={{ marginLeft: '10px' }}
        >
          Save to localStorage
        </button>
        <button 
          onClick={clearTestValue}
          style={{ marginLeft: '10px' }}
        >
          Clear test value
        </button>
        <button 
          onClick={updateStorageKeys}
          style={{ marginLeft: '10px' }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default LocalStorageTest; 