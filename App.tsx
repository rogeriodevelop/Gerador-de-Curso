
import React, { useState, useCallback } from 'react';
import { generateCourseContent } from './services/geminiService';
import { CourseContent, AgentStage, AgentStatus } from './types';
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
    { stage: AgentStage.QA, status: 'pending', name: 'QA Agent' },
  ];

  const simulateAgentProgress = useCallback(() => {
    let currentStageIndex = 0;
    setAgentStatuses(
      initialAgentStatuses.map((s, i) =>
        i === 0 ? { ...s, status: 'processing' } : s
      )
    );

    const interval = setInterval(() => {
      currentStageIndex++;
      if (currentStageIndex < initialAgentStatuses.length) {
        setAgentStatuses(prev =>
          prev.map((s, i) => {
            if (i < currentStageIndex) return { ...s, status: 'completed' };
            if (i === currentStageIndex) return { ...s, status: 'processing' };
            return s;
          })
        );
      } else {
        clearInterval(interval);
      }
    }, 1500); // Simulate each agent taking time
    return interval;
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCourseContent(null);
    const progressInterval = simulateAgentProgress();

    try {
      const content = await generateCourseContent(topic);
      setCourseContent(content);
      setAgentStatuses(prev =>
        prev.map(s => ({ ...s, status: 'completed' }))
      );
    } catch (err) {
      console.error('Error generating course:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate course content. ${errorMessage}`);
      setAgentStatuses(prev =>
        prev.map(s => (s.status === 'processing' ? { ...s, status: 'error' } : s))
      );
    } finally {
      clearInterval(progressInterval);
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

        {!isLoading && courseContent && (
          <div className="w-full max-w-6xl mt-8">
            <CourseDisplay content={courseContent} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
