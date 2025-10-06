
import React from 'react';
import { AgentStatus } from '../types';
import { CheckIcon, CogIcon, DocumentIcon, ErrorIcon, PencilIcon, CodeBracketIcon, ShieldCheckIcon, LoadingSpinner } from './icons';

const getIconForStage = (stage: string, status: string) => {
    const iconClass = "w-8 h-8";
    if (status === 'processing') return <LoadingSpinner className={iconClass + " text-cyan-400"} />;
    if (status === 'completed') return <CheckIcon className={iconClass + " text-green-400"} />;
    if (status === 'error') return <ErrorIcon className={iconClass + " text-red-400"} />;

    switch (stage) {
        case 'Redator': return <PencilIcon className={iconClass + " text-gray-500"} />;
        case 'Designer': return <DocumentIcon className={iconClass + " text-gray-500"} />;
        case 'Developer': return <CodeBracketIcon className={iconClass + " text-gray-500"} />;
        case 'QA': return <ShieldCheckIcon className={iconClass + " text-gray-500"} />;
        default: return <CogIcon className={iconClass + " text-gray-500"} />;
    }
};

const AgentStatusDisplay: React.FC<{ statuses: AgentStatus[] }> = ({ statuses }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Generation Pipeline</h3>
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
        {statuses.map((agent, index) => (
          <React.Fragment key={agent.stage}>
            <div className="flex flex-col items-center text-center w-40">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-700/50 rounded-full border-2 border-gray-600 mb-2">
                {getIconForStage(agent.stage, agent.status)}
              </div>
              <p className="font-semibold text-gray-300">{agent.name}</p>
              <p className={`text-sm capitalize font-medium ${
                  agent.status === 'completed' ? 'text-green-400' :
                  agent.status === 'processing' ? 'text-cyan-400' :
                  agent.status === 'error' ? 'text-red-400' : 'text-gray-500'
              }`}>{agent.status}</p>
            </div>
            {index < statuses.length - 1 && (
              <div className="hidden md:block flex-grow h-1 bg-gray-700 rounded-full">
                <div 
                  className={`h-full rounded-full bg-cyan-500 transition-all duration-500 ${agent.status === 'completed' ? 'w-full' : 'w-0'}`}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AgentStatusDisplay;
