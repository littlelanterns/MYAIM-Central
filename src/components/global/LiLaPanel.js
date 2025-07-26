// src/components/LiLaPanel.js - Clean, elegant AI helpers panel
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LilaAssist from './LilaAssist';
import LilaHelp from './LilaHelp';
import LilaOptimizer from './LilaOptimizer';
import './LiLaPanel.css';

const LiLaPanel = () => {
  const scrollRef = useRef(null);
  const [showAssist, setShowAssist] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [hoveredCharacter, setHoveredCharacter] = useState(null);

  // LiLa characters data
  const lilaCharacters = [
    {
      id: 'help',
      name: 'LiLa™ Help',
      subtitle: 'Happy to Help',
      image: '/Lila-HtH.png',
      description: 'Support & troubleshooting for all your AIMfM questions',
      onClick: () => setShowHelp(true)
    },
    {
      id: 'assist',
      name: 'LiLa™ Assist',
      subtitle: 'Your Guide',
      image: '/lila-asst.png',
      description: 'Feature guidance & tips to help you master AIMfM',
      onClick: () => setShowAssist(true)
    },
    {
      id: 'optimizer',
      name: 'LiLa™ Optimizer',
      subtitle: 'Smart AI',
      image: '/lila-opt.png',
      description: 'Prompt optimization to get better AI results',
      onClick: () => setShowOptimizer(true)
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction * 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="lila-panel-container">
        <div className="lila-panel-header">
          <h3 className="lila-panel-title">AI Helpers</h3>
          <p className="lila-panel-subtitle">Your LiLa™ assistants</p>
        </div>

        {/* Desktop: Large static characters */}
        <div className="lila-characters-desktop">
          {lilaCharacters.map((character) => (
            <div 
              key={character.id}
              className="lila-character-large"
              onClick={character.onClick}
              onMouseEnter={() => setHoveredCharacter(character.id)}
              onMouseLeave={() => setHoveredCharacter(null)}
            >
              <div className="lila-character-avatar">
                <img 
                  src={character.image}
                  alt={character.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              
              {/* Speech bubble tooltip on hover */}
              {hoveredCharacter === character.id && (
                <div className="lila-speech-bubble">
                  <div className="speech-content">
                    <h4>{character.name}</h4>
                    <p>{character.description}</p>
                  </div>
                  <div className="speech-arrow"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Swipeable carousel */}
        <div className="lila-characters-mobile">
          <button 
            className="lila-scroll-button lila-scroll-left"
            onClick={() => scroll(-1)}
            title="Previous helper"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="lila-characters-scroll" ref={scrollRef}>
            <div className="lila-characters-list">
              {lilaCharacters.map((character) => (
                <div 
                  key={character.id}
                  className="lila-character-mobile"
                  onClick={character.onClick}
                >
                  <div className="lila-character-avatar">
                    <img 
                      src={character.image}
                      alt={character.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="lila-character-info">
                    <h4>{character.name}</h4>
                    <p>{character.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="lila-scroll-button lila-scroll-right"
            onClick={() => scroll(1)}
            title="Next helper"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* LiLa Modals */}
      <LilaAssist 
        isOpen={showAssist} 
        onClose={() => setShowAssist(false)} 
      />

      <LilaHelp 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />

      <LilaOptimizer 
        isOpen={showOptimizer} 
        onClose={() => setShowOptimizer(false)} 
      />
    </>
  );
};

export default LiLaPanel;