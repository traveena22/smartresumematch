import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resumeService } from '../services/resumeService';

interface ResumeUploaderProps {
  onUpload: (resumeData: any) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsUploading(true);
    
    // Simulate file processing and save to database
    setTimeout(() => {
      const resumeData = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        size: file.size,
        type: file.type,
        content: `Sample resume content for ${file.name}`,
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        experience: '5 years',
        education: 'Bachelor of Science in Computer Science'
      };
      
      // Save to database if user is authenticated
      if (user) {
        resumeService.createResume(user.id, {
          name: resumeData.name,
          content: resumeData.content,
          skills: resumeData.skills,
        }).then(({ resume, error }) => {
          if (resume) {
            onUpload(resume);
          }
        });
      } else {
        onUpload(resumeData);
      }
      setIsUploading(false);
      setUploadComplete(true);
      
      setTimeout(() => setUploadComplete(false), 2000);
    }, 1500);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Processing resume...</p>
          </div>
        ) : uploadComplete ? (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="text-green-600 font-medium">Resume uploaded successfully!</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Upload your resume</p>
                <p className="text-gray-500 text-sm mt-1">
                  Drag and drop or click to select
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileInput}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Choose File
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeUploader;