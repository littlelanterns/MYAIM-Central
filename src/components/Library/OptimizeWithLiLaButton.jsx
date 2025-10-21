// src/components/Library/OptimizeWithLiLaButton.jsx - Button to optimize library tools with LiLa
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lilaContextService } from '../../lib/lilaContextService';
import './OptimizeWithLiLaButton.css';

export function OptimizeWithLiLaButton({
  libraryItem,
  customPrompt = '',
  className = ''
}) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const navigate = useNavigate();

  const handleOptimize = async () => {
    setIsOptimizing(true);

    try {
      // Gather family context
      const context = await lilaContextService.getFamilyContextForOptimization();

      // Build the optimization request
      const optimizationData = {
        toolTitle: libraryItem.title,
        toolDescription: libraryItem.description || libraryItem.short_description,
        toolType: libraryItem.tool_type || libraryItem.content_type,
        toolUrl: libraryItem.tool_url || libraryItem.content_url,
        customInstructions: customPrompt || libraryItem.lila_optimization_prompt,
        familyContext: context
      };

      // Store in sessionStorage so LiLa page can access it
      sessionStorage.setItem('lilaOptimization', JSON.stringify(optimizationData));

      // Navigate to LiLa with optimization flag
      navigate('/lila?optimize=true');

    } catch (error) {
      console.error('Error optimizing with LiLa:', error);
      alert('Unable to optimize with LiLa. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <button
      onClick={handleOptimize}
      disabled={isOptimizing}
      className={`optimize-lila-button ${className}`}
    >
      <span className="optimize-lila-icon">✨</span>
      <span className="optimize-lila-text">
        {isOptimizing ? 'Preparing...' : 'Optimize with LiLa'}
      </span>
    </button>
  );
}
