// PDF Generation utility for resume download
export interface ResumeData {
  name: string;
  content: any;
  skills: string[];
  createdAt?: Date;
}

export const generateResumePDF = (resume: ResumeData): void => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please check your popup blocker.');
    }

    const content = resume.content || {};
    
    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.name} - Resume</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px 20px;
              background: white;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
            }
            
            .header h1 {
              font-size: 32px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            
            .contact-info {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 20px;
              color: #6b7280;
              font-size: 14px;
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            
            .experience-item, .education-item {
              margin-bottom: 20px;
              padding-left: 15px;
              border-left: 3px solid #3b82f6;
            }
            
            .experience-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 5px;
            }
            
            .position {
              font-weight: bold;
              font-size: 16px;
              color: #1f2937;
            }
            
            .company {
              font-weight: 600;
              color: #4b5563;
              margin-bottom: 5px;
            }
            
            .date {
              font-size: 12px;
              color: #6b7280;
              float: right;
            }
            
            .description {
              color: #4b5563;
              font-size: 14px;
              line-height: 1.5;
            }
            
            .skills-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            
            .skill-tag {
              background: #eff6ff;
              color: #1d4ed8;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .summary {
              color: #4b5563;
              font-size: 14px;
              line-height: 1.6;
              text-align: justify;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${content.personal?.name || resume.name || 'Resume'}</h1>
            <div class="contact-info">
              ${content.personal?.email ? `<span>📧 ${content.personal.email}</span>` : ''}
              ${content.personal?.phone ? `<span>📞 ${content.personal.phone}</span>` : ''}
              ${content.personal?.location ? `<span>📍 ${content.personal.location}</span>` : ''}
            </div>
          </div>

          ${content.personal?.summary ? `
            <div class="section">
              <h2 class="section-title">Professional Summary</h2>
              <p class="summary">${content.personal.summary}</p>
            </div>
          ` : ''}

          ${content.experience && content.experience.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Work Experience</h2>
              ${content.experience.map((exp: any) => `
                <div class="experience-item">
                  <div class="experience-header">
                    <div class="position">${exp.position || 'Position'}</div>
                    <div class="date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
                  </div>
                  <div class="company">${exp.company || 'Company'}</div>
                  ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${content.education && content.education.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Education</h2>
              ${content.education.map((edu: any) => `
                <div class="education-item">
                  <div class="position">${edu.degree || 'Degree'}</div>
                  <div class="company">${edu.school || 'School'}</div>
                  ${edu.field ? `<p class="description">${edu.field}</p>` : ''}
                  ${edu.year ? `<div class="date">${edu.year}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${(resume.skills || content.skills) && (resume.skills || content.skills).length > 0 ? `
            <div class="section">
              <h2 class="section-title">Skills</h2>
              <div class="skills-container">
                ${(resume.skills || content.skills || []).map((skill: any) => `
                  <span class="skill-tag">${typeof skill === 'string' ? skill : skill.name || skill}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${content.certifications && content.certifications.length > 0 ? `
            <div class="section">
              <h2 class="section-title">Certifications</h2>
              ${content.certifications.map((cert: any) => `
                <div class="education-item">
                  <div class="position">${cert.name || cert}</div>
                  ${cert.year ? `<div class="date">${cert.year}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (optional)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 250);
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback: Create a downloadable HTML file
    const content = resume.content || {};
    const htmlContent = createResumeHTML(resume);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resume.name || 'resume'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const createResumeHTML = (resume: ResumeData): string => {
  const content = resume.content || {};
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${resume.name} - Resume</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .skill-tag { background: #f0f0f0; padding: 2px 8px; margin: 2px; border-radius: 10px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${content.personal?.name || resume.name || 'Resume'}</h1>
          <p>${content.personal?.email || ''} | ${content.personal?.phone || ''} | ${content.personal?.location || ''}</p>
        </div>
        ${content.personal?.summary ? `<div class="section"><h2 class="section-title">Summary</h2><p>${content.personal.summary}</p></div>` : ''}
        ${(resume.skills || content.skills) ? `<div class="section"><h2 class="section-title">Skills</h2>${(resume.skills || content.skills || []).map((skill: any) => `<span class="skill-tag">${typeof skill === 'string' ? skill : skill.name || skill}</span>`).join('')}</div>` : ''}
      </body>
    </html>
  `;
};