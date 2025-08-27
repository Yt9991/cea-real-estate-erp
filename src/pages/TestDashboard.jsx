import React from 'react';
import OCRCamera from '../components/OCRCamera';

const TestDashboard = () => {
  const handleDataExtracted = (data) => {
    console.log('OCR Data extracted:', data);
    alert('OCR Data extracted! Check console for details.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">CEA Real Estate ERP - Test Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">PWA Status</h2>
            <p className="text-green-600">PWA features are active</p>
            <p className="text-sm text-gray-600">Service Worker registered successfully</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">OCR Camera</h2>
            <OCRCamera
              documentType="nric"
              onDataExtracted={handleDataExtracted}
              className="border-0 shadow-none p-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;