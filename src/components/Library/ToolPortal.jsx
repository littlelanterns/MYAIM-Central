import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './ToolPortal.css';

const ToolPortal = ({ tool, user, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [usageToday, setUsageToday] = useState(0);
  const [usageThisMonth, setUsageThisMonth] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (tool.enable_usage_limits && user) {
      checkUsageLimit();
    }
  }, [tool.id, user?.id, tool.enable_usage_limits]);

  const checkUsageLimit = async () => {
    if (!user || !tool.enable_usage_limits) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Check daily usage
      if (tool.usage_limit_type === 'daily_uses') {
        const { count } = await supabase
          .from('tool_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('library_item_id', tool.id)
          .gte('started_at', `${today}T00:00:00`)
          .lte('started_at', `${today}T23:59:59`);

        setUsageToday(count || 0);
        if (count >= tool.usage_limit_amount) {
          setLimitReached(true);
        }
      }

      // Check monthly usage
      if (tool.usage_limit_type === 'monthly_uses') {
        const firstOfMonth = new Date();
        firstOfMonth.setDate(1);
        firstOfMonth.setHours(0, 0, 0, 0);

        const { count } = await supabase
          .from('tool_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('library_item_id', tool.id)
          .gte('started_at', firstOfMonth.toISOString());

        setUsageThisMonth(count || 0);
        if (count >= tool.usage_limit_amount) {
          setLimitReached(true);
        }
      }
    } catch (error) {
      console.error('Error checking usage limits:', error);
    }
  };

  const handleLaunchTool = async () => {
    setLoading(true);

    try {
      // Check usage limit if enabled
      if (tool.enable_usage_limits && limitReached) {
        const limitMessage = getLimitMessage(tool.usage_limit_type, tool.usage_limit_amount);
        alert(limitMessage);
        setLoading(false);
        return;
      }

      // Create session with IDLE timeout (tracks last_activity)
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (tool.session_timeout_minutes || 60));

      await supabase.from('tool_sessions').insert({
        user_id: user.id,
        library_item_id: tool.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      });

      setSessionActive(true);
    } catch (error) {
      console.error('Error launching tool:', error);
      alert('Failed to launch tool. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLimitMessage = (limitType, amount) => {
    switch (limitType) {
      case 'daily_uses':
        return `Daily limit reached. You can use this tool ${amount} times per day.`;
      case 'monthly_uses':
        return `Monthly limit reached. You can use this tool ${amount} times per month.`;
      case 'session_time':
        return `Session time limited to ${amount} minutes.`;
      case 'api_tokens':
        return `API token limit: ${amount} tokens per use.`;
      default:
        return 'Usage limit reached.';
    }
  };

  const generateSessionToken = () => {
    return `${user.id}-${tool.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  };

  if (sessionActive) {
    // Show tool embed
    return (
      <div className="tool-portal active">
        <div className="tool-header">
          <h2>{tool.title}</h2>
          <button onClick={onClose} className="close-btn">Close Tool</button>
        </div>

        <div className="tool-embed-container">
          {tool.embedding_method === 'portal-only' ? (
            <div className="external-link-notice">
              <p>This tool opens in a new window.</p>
              <a
                href={tool.tool_url}
                target="_blank"
                rel="noopener noreferrer"
                className="launch-external-btn"
              >
                Open {tool.title}
              </a>
            </div>
          ) : (
            <iframe
              src={tool.tool_url}
              title={tool.title}
              className="tool-iframe"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              allow="clipboard-read; clipboard-write"
            />
          )}
        </div>

        {tool.session_timeout_minutes && (
          <div className="session-timer">
            ⏱️ Session expires after {tool.session_timeout_minutes} minutes of inactivity
          </div>
        )}
      </div>
    );
  }

  // Show portal/prep screen
  return (
    <div className="tool-portal prep">
      <button onClick={onClose} className="portal-close-btn">×</button>

      <div className="portal-content">
        <div className="portal-header">
          {tool.thumbnail_url && (
            <img src={tool.thumbnail_url} alt={tool.title} className="portal-image" />
          )}
          <h1>{tool.title}</h1>
          {tool.portal_description && (
            <p className="portal-description">{tool.portal_description}</p>
          )}
        </div>

        {tool.prerequisites_text && (
          <div className="portal-section">
            <h3>Before You Start</h3>
            <p>{tool.prerequisites_text}</p>
          </div>
        )}

        {tool.portal_tips && tool.portal_tips.length > 0 && (
          <div className="portal-section">
            <h3>💡 Tips for Success</h3>
            <ul className="portal-tips">
              {tool.portal_tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {tool.requires_auth && (
          <div className="portal-section auth-notice">
            <h3>🔐 Authentication Required</h3>
            <p>This tool requires you to sign in with your {tool.auth_provider} account.</p>
            <p>Your session will be private and secure.</p>
          </div>
        )}

        {tool.enable_usage_limits && (
          <div className="portal-section usage-info">
            <h3>📊 Usage Information</h3>
            <p>
              {tool.usage_limit_type === 'daily_uses' && `Daily uses: ${usageToday} / ${tool.usage_limit_amount}`}
              {tool.usage_limit_type === 'monthly_uses' && `Monthly uses: ${usageThisMonth} / ${tool.usage_limit_amount}`}
              {tool.usage_limit_type === 'session_time' && `Session limited to ${tool.usage_limit_amount} minutes`}
              {tool.usage_limit_type === 'api_tokens' && `Maximum ${tool.usage_limit_amount} tokens per use`}
            </p>
          </div>
        )}

        <button
          onClick={handleLaunchTool}
          disabled={loading || limitReached}
          className="launch-tool-btn"
        >
          {loading ? 'Launching...' : limitReached ? 'Limit Reached' : 'Launch Tool'}
        </button>

        {limitReached && (
          <p className="limit-message">
            {getLimitMessage(tool.usage_limit_type, tool.usage_limit_amount)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ToolPortal;
