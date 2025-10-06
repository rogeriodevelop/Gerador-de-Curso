
import React, { useState } from 'react';
import { generateCourseContent, generateImage } from './services/geminiService';
import { CourseContent, AgentStage, AgentStatus, CourseModule, CourseSection } from './types';
import Header from './components/Header';
import TopicInput from './components/TopicInput';
import AgentStatusDisplay from './components/AgentStatusDisplay';
import CourseDisplay from './components/CourseDisplay';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [courseContent, setCourseContent] = useState<CourseContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);

  const initialAgentStatuses: AgentStatus[] = [
    { stage: AgentStage.Redator, status: 'pending', name: 'Redator Agent' },
    { stage: AgentStage.Designer, status: 'pending', name: 'Designer Agent' },
    { stage: AgentStage.Developer, status: 'pending', name: 'Developer Agent' },
    { stage: AgentStage.Illustrator, status: 'pending', name: 'Illustrator Agent' },
    { stage: AgentStage.QA, status: 'pending', name: 'QA Agent' },
  ];

  const updateAgentStatuses = (completedStages: AgentStage[], processingStage?: AgentStage, errorStage?: AgentStage) => {
    setAgentStatuses(prev => {
      return initialAgentStatuses.map(agent => {
        if (completedStages.includes(agent.stage)) {
          return { ...agent, status: 'completed' };
        }
        if (agent.stage === processingStage) {
          return { ...agent, status: 'processing' };
        }
        if (agent.stage === errorStage) {
          return { ...agent, status: 'error' };
        }
        // Keep previous error states
        const previousAgent = prev.find(p => p.stage === agent.stage);
        if (previousAgent?.status === 'error') {
            return previousAgent;
        }
        return { ...agent, status: 'pending' };
      });
    });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCourseContent(null);
    setAgentStatuses(initialAgentStatuses);
    updateAgentStatuses([], AgentStage.Redator);

    try {
      // Step 1: Generate Textual Content
      const contentStructure = await generateCourseContent(topic);
      updateAgentStatuses([AgentStage.Redator, AgentStage.Designer, AgentStage.Developer], AgentStage.Illustrator);
      setCourseContent(contentStructure);

      // Step 2: Generate Images
      const imageGenerationPromises: Promise<void>[] = [];
      const updatedContent: CourseContent = JSON.parse(JSON.stringify(contentStructure));

      updatedContent.modules.forEach((module: CourseModule) => {
        module.sections.forEach((section: CourseSection) => {
          if (section.imageSuggestion) {
            const promise = generateImage(section.imageSuggestion)
              .then(imageBase64 => {
                section.generatedImageBase64 = imageBase64;
              })
              .catch(err => {
                console.warn(`Could not generate image for suggestion: "${section.imageSuggestion}". Skipping.`, err);
              });
            imageGenerationPromises.push(promise);
          }
        });
      });

      await Promise.all(imageGenerationPromises);

      setCourseContent(updatedContent);
      updateAgentStatuses([AgentStage.Redator, AgentStage.Designer, AgentStage.Developer, AgentStage.Illustrator], AgentStage.QA);
      
      // Step 3: Final QA simulation
      await new Promise(resolve => setTimeout(resolve, 500));
      updateAgentStatuses([AgentStage.Redator, AgentStage.Designer, AgentStage.Developer, AgentStage.Illustrator, AgentStage.QA]);

    } catch (err) {
      console.error('Error generating course:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate course content. ${errorMessage}`);
      const currentProcessingAgent = agentStatuses.find(s => s.status === 'processing')?.stage || AgentStage.Redator;
      updateAgentStatuses([], undefined, currentProcessingAgent);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-4 text-center">
            Generate a 2-Hour Course Website
          </h2>
          <p className="text-gray-400 mb-6 text-center">
            Enter a topic, and our AI agents will build a complete, didactic lesson plan for you.
          </p>
          <TopicInput
            topic={topic}
            setTopic={setTopic}
            onGenerate={handleGenerate}
            isLoading={isLoading}
          />
          {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>

        {(isLoading || courseContent) && (
          <div className="w-full max-w-4xl mt-8">
            <AgentStatusDisplay statuses={agentStatuses} />
          </div>
        )}

        {courseContent && (
          <div className="w-full max-w-6xl mt-8">
            <CourseDisplay content={courseContent} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
