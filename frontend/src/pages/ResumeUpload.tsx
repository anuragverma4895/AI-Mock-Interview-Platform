import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { resumeAPI } from '../services/api';

export default function ResumeUpload() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      await resumeAPI.upload(formData);
      setMessage('Resume uploaded successfully!');
      setFile(null);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error uploading resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">AI Interview Bot - Upload Resume</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-blue-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">Upload Your Resume</h2>
          <p className="text-gray-600 mb-6">
            Upload your resume (PDF or DOCX) to get personalized interview questions based on your skills and experience.
          </p>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Resume File
            </label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded p-2"
            />
            <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOCX (Max 5MB)</p>
          </div>

          {file && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-700">Selected: {file.name}</p>
            </div>
          )}

          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}