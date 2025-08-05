import React, { useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resumeService } from '../services/resumeService';

interface ResumeBuilderProps {
  onSave: (resumeData: any) => void;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onSave }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState({
    personal: {
      name: '',
      email: '',
      phone: '',
      location: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    certifications: []
  });

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'preview', label: 'Preview', icon: FileText }
  ];

  const handlePersonalChange = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: Date.now(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updated = [...resumeData.experience];
    updated[index][field] = value;
    setResumeData(prev => ({ ...prev, experience: updated }));
  };

  const removeExperience = (index: number) => {
    const updated = [...resumeData.experience];
    updated.splice(index, 1);
    setResumeData(prev => ({ ...prev, experience: updated }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now(),
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          description: ''
        }
      ]
    }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...resumeData.education];
    updated[index][field] = value;
    setResumeData(prev => ({ ...prev, education: updated }));
  };

  const removeEducation = (index: number) => {
    const updated = [...resumeData.education];
    updated.splice(index, 1);
    setResumeData(prev => ({ ...prev, education: updated }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, { id: Date.now(), name: '' }]
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const updated = [...resumeData.skills];
    updated[index].name = value;
    setResumeData(prev => ({ ...prev, skills: updated }));
  };

  const removeSkill = (index: number) => {
    const updated = [...resumeData.skills];
    updated.splice(index, 1);
    setResumeData(prev => ({ ...prev, skills: updated }));
  };

  const handleSave = () => {
    if (!user) return;
    setSaving(true);

    const resumeInput = {
      name: resumeData.personal.name || 'My Resume',
      content: resumeData,
      skills: resumeData.skills.map((skill: any) => skill.name || skill),
    };

    resumeService.createResume(user.id, resumeInput).then(({ resume, error }) => {
      if (resume) {
        onSave(resume);
      }
      setSaving(false);
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-64 space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${activeSection === section.id
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <section.icon className="w-5 h-5" />
            <span className="font-medium">{section.label}</span>
          </button>
        ))}
        <button
          onClick={handleSave}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mt-4"
        >
          {saving ? 'Saving...' : 'Save Resume'}
        </button>
      </div>

      <div className="flex-1">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {activeSection === 'personal' && (
            <>
              <h3 className="text-xl font-semibold">Personal Info</h3>
              {['name', 'email', 'phone', 'location', 'summary'].map((field) => (
                <input
                  key={field}
                  className="w-full border p-2 rounded mb-2"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={resumeData.personal[field]}
                  onChange={(e) => handlePersonalChange(field, e.target.value)}
                />
              ))}
            </>
          )}

          {activeSection === 'experience' && (
            <>
              <h3 className="text-xl font-semibold">Experience</h3>
              {resumeData.experience.map((exp, i) => (
                <div key={exp.id} className="border rounded p-4 mb-2 space-y-2">
                  {['company', 'position', 'startDate', 'endDate', 'description'].map((field) => (
                    <input
                      key={field}
                      className="w-full border p-2 rounded"
                      placeholder={field}
                      value={exp[field]}
                      onChange={(e) => handleExperienceChange(i, field, e.target.value)}
                    />
                  ))}
                  <button
                    onClick={() => removeExperience(i)}
                    className="text-red-500 flex items-center space-x-1"
                  >
                    <Trash2 size={16} /> <span>Remove</span>
                  </button>
                </div>
              ))}
              <button
                onClick={addExperience}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow flex items-center space-x-2"
              >
                <Plus size={16} /> <span>Add Experience</span>
              </button>
            </>
          )}

          {activeSection === 'education' && (
            <>
              <h3 className="text-xl font-semibold">Education</h3>
              {resumeData.education.map((edu, i) => (
                <div key={edu.id} className="border rounded p-4 mb-2 space-y-2">
                  {['school', 'degree', 'field', 'startDate', 'endDate', 'description'].map((field) => (
                    <input
                      key={field}
                      className="w-full border p-2 rounded"
                      placeholder={field}
                      value={edu[field]}
                      onChange={(e) => handleEducationChange(i, field, e.target.value)}
                    />
                  ))}
                  <button
                    onClick={() => removeEducation(i)}
                    className="text-red-500 flex items-center space-x-1"
                  >
                    <Trash2 size={16} /> <span>Remove</span>
                  </button>
                </div>
              ))}
              <button
                onClick={addEducation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow flex items-center space-x-2"
              >
                <Plus size={16} /> <span>Add Education</span>
              </button>
            </>
          )}

          {activeSection === 'skills' && (
            <>
              <h3 className="text-xl font-semibold">Skills</h3>
              {resumeData.skills.map((skill, i) => (
                <div key={skill.id} className="flex items-center gap-2 mb-2">
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="Skill"
                    value={skill.name}
                    onChange={(e) => handleSkillChange(i, e.target.value)}
                  />
                  <button
                    onClick={() => removeSkill(i)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addSkill}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow flex items-center space-x-2"
              >
                <Plus size={16} /> <span>Add Skill</span>
              </button>
            </>
          )}

          {activeSection === 'preview' && (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Resume Preview</h3>
              <h2 className="text-2xl font-bold">{resumeData.personal.name}</h2>
              <p>{resumeData.personal.email} | {resumeData.personal.phone} | {resumeData.personal.location}</p>
              <p className="italic">{resumeData.personal.summary}</p>

              <div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Experience</h3>
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="mb-2">
                    <strong>{exp.position}</strong> at <strong>{exp.company}</strong><br />
                    <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span>
                    <p>{exp.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Education</h3>
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="mb-2">
                    <strong>{edu.degree}</strong> in {edu.field} from <strong>{edu.school}</strong><br />
                    <span className="text-sm text-gray-500">{edu.startDate} - {edu.endDate}</span>
                    <p>{edu.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Skills</h3>
                <ul className="list-disc list-inside">
                  {resumeData.skills.map((skill) => (
                    <li key={skill.id}>{skill.name}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
