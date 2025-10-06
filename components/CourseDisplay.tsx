
import React from 'react';
import { CourseContent, CourseModule, CourseSection } from '../types';
import { DownloadIcon } from './icons';

const createHtmlFile = (content: CourseContent): string => {
  const bodyContent = `
    <header class="bg-gray-800 p-8 text-center">
      <h1 class="text-5xl font-bold text-cyan-400">${content.title}</h1>
    </header>
    <main class="container mx-auto p-8">
      <div class="prose prose-invert max-w-none bg-gray-900 p-8 rounded-lg">
        <h2 class="text-3xl font-bold text-teal-300 border-b-2 border-teal-400 pb-2">Introduction</h2>
        ${content.introduction}
        ${content.modules.map(module => `
          <div class="mt-12">
            <h3 class="text-4xl font-bold text-teal-300 border-b-2 border-teal-400 pb-2 mb-4">${module.title}</h3>
            <p class="text-gray-400 italic">Estimated duration: ${module.durationMinutes} minutes</p>
            ${module.sections.map(section => `
              <div class="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 class="text-2xl font-semibold text-cyan-400">${section.title}</h4>
                <div class="mt-4">${section.content}</div>
                ${section.codeExample ? `
                  <div class="mt-6">
                    <p class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">${section.codeExample.language} Example</p>
                    <pre class="bg-gray-900 rounded-md p-4 text-sm overflow-x-auto"><code class="language-${section.codeExample.language}">${section.codeExample.code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                  </div>
                ` : ''}
                ${section.generatedImageBase64 ? `
                  <div class="mt-6 p-4 bg-gray-700/50 rounded-lg text-center">
                    <p class="text-gray-400 italic">Illustration for: "${section.imageSuggestion}"</p>
                    <img src="data:image/jpeg;base64,${section.generatedImageBase64}" alt="${section.imageSuggestion}" class="mt-2 rounded-md mx-auto" />
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </main>
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-900 text-gray-100 font-sans">
      ${bodyContent}
    </body>
    </html>
  `;
};


const CodeBlock: React.FC<{ language: string, code: string }> = ({ language, code }) => (
  <div className="mt-6">
    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">{language} Example</p>
    <pre className="bg-gray-900 rounded-md p-4 text-sm overflow-x-auto">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  </div>
);

const CourseSectionDisplay: React.FC<{ section: CourseSection }> = ({ section }) => (
  <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700 transition-shadow duration-300 hover:shadow-cyan-500/10">
    <h4 className="text-2xl font-semibold text-cyan-400">{section.title}</h4>
    <div className="mt-4 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
    {section.codeExample && <CodeBlock language={section.codeExample.language} code={section.codeExample.code} />}
    {section.generatedImageBase64 && (
      <div className="mt-6 p-4 bg-gray-700/50 rounded-lg text-center">
        <p className="text-gray-400 italic">Illustration for: "{section.imageSuggestion}"</p>
        <img src={`data:image/jpeg;base64,${section.generatedImageBase64}`} alt={section.imageSuggestion} className="mt-2 rounded-md mx-auto max-h-[400px] w-auto" />
      </div>
    )}
  </div>
);

const CourseModuleDisplay: React.FC<{ module: CourseModule }> = ({ module }) => (
  <div className="mt-12">
    <h3 className="text-4xl font-bold text-teal-300 border-b-2 border-teal-400 pb-2 mb-4">{module.title}</h3>
    <p className="text-gray-400 italic">Estimated duration: {module.durationMinutes} minutes</p>
    {module.sections.map((section, index) => (
      <CourseSectionDisplay key={index} section={section} />
    ))}
  </div>
);

const CourseDisplay: React.FC<{ content: CourseContent }> = ({ content }) => {

  const handleDownload = () => {
    const htmlContent = createHtmlFile(content);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700 relative">
        <button 
          onClick={handleDownload}
          className="absolute top-4 right-4 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Download HTML
        </button>

      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-cyan-400">{content.title}</h1>
      </header>
      <div className="prose prose-invert max-w-none">
        <h2 className="text-3xl font-bold text-teal-300 border-b-2 border-teal-400 pb-2">Introduction</h2>
        <div dangerouslySetInnerHTML={{ __html: content.introduction }} />
      </div>
      {content.modules.map((module, index) => (
        <CourseModuleDisplay key={index} module={module} />
      ))}
    </div>
  );
};

export default CourseDisplay;
