/**
 * VictoryList Component
 * Displays a list of recorded victories with filtering and search
 */

import React, { useState } from 'react';
import './VictoryList.css';

interface Victory {
  id: string;
  family_member_id: string;
  description: string;
  category?: string;
  celebration_message?: string;
  voice_url?: string;
  created_at: string;
}

interface VictoryListProps {
  familyMemberId?: string;
  showAllFamily?: boolean;
}

const VictoryList: React.FC<VictoryListProps> = ({
  familyMemberId,
  showAllFamily = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  return (
    <div className="victory-list">
      <div className="victory-list-header">
        <h2>🏆 Victory History</h2>
        <div className="victory-filters">
          <input
            type="text"
            className="victory-search"
            placeholder="Search victories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="chores">Chores</option>
            <option value="homework">Homework</option>
            <option value="kindness">Kindness</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="victory-list-content">
        <div className="placeholder-message">
          <div className="placeholder-icon">📋</div>
          <h3>Victory List Coming Soon!</h3>
          <p>
            {showAllFamily
              ? "See all family victories here"
              : "Your personal victory history"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VictoryList;
