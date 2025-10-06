
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="text-white">AI Course</span>
          <span className="text-cyan-400">Architect</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
