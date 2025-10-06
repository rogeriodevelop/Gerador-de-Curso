
import React from 'react';
import { LoadingSpinner } from './icons';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ topic, setTopic, onGenerate, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      onGenerate();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 'Introduction to Quantum Computing'"
        className="w-full flex-grow bg-gray-900 border-2 border-gray-600 rounded-lg px-4 py-3 text-lg text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-gray-500"
        disabled={isLoading}
      />
      <button
        onClick={onGenerate}
        disabled={isLoading || !topic.trim()}
        className="w-full sm:w-auto flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-900/50"
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="mr-3" />
            Generating...
          </>
        ) : (
          'Generate Course'
        )}
      </button>
    </div>
  );
};

export default TopicInput;
