import React from 'react';
import { X, Download, FileText, Mail, Phone, MapPin, Calendar, Building } from 'lucide-react';

interface ResumePreviewProps {
  resume: any;
  onClose: () => void;
  onDownload: () => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, onClose, onDownload }) => {
  const renderContent = () => {
    if (typeof resume.content === 'string') {
      return (
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {resume.content}
          </pre>
        </div>
      );
    }

    // Structured resume content
    const content = resume.content || {};
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {content.personal?.name || resume.name || 'Resume'}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-gray-600">
            {content.personal?.email && (
              <div className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>{content.personal.email}</span>
              </div>
            )}
            {content.personal?.phone && (
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>{content.personal.phone}</span>
              </div>
            )}
            {content.personal?.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{content.personal.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {content.personal?.summary && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{content.personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {content.experience && content.experience.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Work Experience
            </h2>
            <div className="space-y-4">
              {content.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex flex-wrap items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{exp.position || 'Position'}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 mb-2">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">{exp.company || 'Company'}</span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {content.education && content.education.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {content.education.map((edu: any, index: number) => (
                <div key={index} className="border-l-2 border-green-200 pl-4">
                  <h3 className="font-semibold text-gray-900">{edu.degree || 'Degree'}</h3>
                  <p className="text-gray-600">{edu.school || 'School'}</p>
                  {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                  {edu.year && <p className="text-sm text-gray-500">{edu.year}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {(resume.skills || content.skills) && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {(resume.skills || content.skills || []).map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {content.certifications && content.certifications.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
              Certifications
            </h2>
            <div className="space-y-2">
              {content.certifications.map((cert: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">{cert.name || cert}</span>
                  {cert.year && <span className="text-sm text-gray-500">({cert.year})</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Resume Preview</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-3xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;