import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, X, RotateCcw, Download } from 'lucide-react';

const OCRCamera = ({ onDataExtracted, documentType = 'nric', className = '' }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
        setError('');
      }
    } catch (err) {
      setError('Camera access denied. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
    simulateOCRProcessing();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        simulateOCRProcessing();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateOCRProcessing = async () => {
    setIsScanning(true);
    setOcrProgress(0);
    setError('');

    const progressInterval = setInterval(() => {
      setOcrProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      
      const mockData = getMockDataByType(documentType);
      setExtractedData(mockData);
      setIsScanning(false);
      
      if (onDataExtracted) {
        onDataExtracted(mockData);
      }
    }, 2500);
  };

  const getMockDataByType = (type) => {
    const mockData = {
      nric: {
        name: 'TAN WEI MING',
        nric: 'S1234567A',
        dateOfBirth: '15/08/1985',
        address: '123 Orchard Road #12-34, Singapore 238824',
        race: 'Chinese',
        sex: 'M'
      },
      passport: {
        name: 'TAN WEI MING',
        passportNumber: 'E1234567N',
        nationality: 'SINGAPORE',
        dateOfBirth: '15/08/1985'
      },
      bankStatement: {
        name: 'TAN WEI MING',
        accountNumber: '123-456789-001',
        bankName: 'DBS Bank',
        address: '123 Orchard Road #12-34, Singapore 238824',
        balance: '45,678.90'
      }
    };
    
    return mockData[type] || mockData.nric;
  };

  const resetScan = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setError('');
    setOcrProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
          <Scan className="mr-3 text-blue-600" size={24} />
          Document Scanner
        </h3>
        <p className="text-gray-600">
          Scan {documentType.toUpperCase()} and extract data automatically
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <X className="mr-2" size={16} />
            {error}
          </div>
        </div>
      )}

      {!capturedImage && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={startCamera}
            className="flex items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 transition-all"
          >
            <Camera className="mr-3 text-blue-600" size={28} />
            <span className="text-gray-800 font-medium">Take Photo</span>
          </button>

          <label className="flex items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 transition-all cursor-pointer">
            <Upload className="mr-3 text-green-600" size={28} />
            <span className="text-gray-800 font-medium">Upload File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {showCamera && (
        <div className="mb-6">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={capturePhoto}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all shadow-lg"
              >
                <Camera size={24} />
              </button>
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all shadow-lg"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="mb-6">
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured document"
              className="w-full max-h-80 object-contain rounded-lg border border-gray-300"
            />
            <button
              onClick={resetScan}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90 transition-all"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Scan className="mr-2 text-blue-600 animate-spin" size={16} />
            <span className="text-gray-700">Processing document... {ocrProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            🔬 Demo mode: Simulating OCR processing with sample data
          </p>
        </div>
      )}

      {extractedData && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
            <Download className="mr-2" size={16} />
            Extracted Data:
          </h4>
          
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(extractedData).map(([key, value]) => (
              <div key={key} className="p-2 bg-white rounded border">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-gray-900 font-medium">{value || 'Not detected'}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onDataExtracted?.(extractedData)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center text-sm"
            >
              <Download className="mr-2" size={14} />
              Use This Data
            </button>
            <button
              onClick={resetScan}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all text-sm"
            >
              Scan Again
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default OCRCamera;