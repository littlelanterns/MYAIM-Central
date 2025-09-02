import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const HitASnagButton = ({ className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueType, setIssueType] = useState('broken');
  const [priority, setPriority] = useState('annoying');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const issueTypes = {
    broken: {
      label: 'Broken Feature',
      description: 'Something isn\'t working as expected',
      icon: '🔧',
      examples: ['Button doesn\'t click', 'Page won\'t load', 'Error message appears']
    },
    confusing: {
      label: 'Confusing Flow',
      description: 'I\'m not sure how to do something',
      icon: '🤔',
      examples: ['Can\'t find a feature', 'Don\'t understand the interface', 'Unclear instructions']
    },
    missing: {
      label: 'Missing Feature',
      description: 'I need something that doesn\'t exist',
      icon: '➕',
      examples: ['Need a shortcut button', 'Want to organize differently', 'Missing an option']
    },
    suggestion: {
      label: 'Suggestion',
      description: 'I have an idea to improve this',
      icon: '💡',
      examples: ['Make this faster', 'Add a visual cue', 'Better wording']
    }
  };

  const priorityLevels = {
    blocking: {
      label: 'Can\'t Continue',
      description: 'I\'m completely stuck',
      color: 'text-red-600'
    },
    annoying: {
      label: 'Annoying',
      description: 'Slows me down but I can work around it',
      color: 'text-orange-600'
    },
    minor: {
      label: 'Minor',
      description: 'Small improvement, not urgent',
      color: 'text-blue-600'
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Collect context data
      const contextData = {
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        page_title: document.title,
        timestamp: new Date().toISOString(),
        screen_size: {
          width: window.screen.width,
          height: window.screen.height
        },
        viewport_size: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      // Submit feedback
      const { error } = await supabase
        .from('feedback_submissions')
        .insert({
          user_id: user.id,
          page_url: window.location.href,
          issue_type: issueType,
          priority: priority,
          description: description,
          context_data: contextData
        });

      if (error) throw error;

      // Log the feedback submission activity
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        page_visited: window.location.pathname,
        action_taken: `feedback_submitted_${issueType}_${priority}`,
        metadata: { issue_type: issueType, priority: priority }
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitted(false);
        setDescription('');
        setIssueType('broken');
        setPriority('annoying');
      }, 2000);

    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('There was an error submitting your feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    // Log that they clicked the button
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('user_activity_log').insert({
          user_id: user.id,
          page_visited: window.location.pathname,
          action_taken: 'hit_a_snag_clicked',
        });
      }
    });
  };

  if (!isModalOpen) {
    return (
      <button
        onClick={openModal}
        className={`fixed bottom-6 right-6 z-40 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 ${className}`}
        title="Report an issue or give feedback"
      >
        <span className="text-lg">🐛</span>
        <span className="font-medium hidden sm:inline">Hit a Snag?</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              Your feedback has been submitted. We'll review it and work on improvements!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="text-2xl mr-2">🐛</span>
                  Hit a Snag?
                </h2>
                <p className="text-gray-600">Help us improve AIMfM by reporting issues or sharing ideas</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Issue Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What type of issue is this?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(issueTypes).map(([key, type]) => (
                  <label
                    key={key}
                    className={`relative flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                      issueType === key 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={key}
                      checked={issueType === key}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-xl mr-2">{type.icon}</span>
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      <div className="text-xs text-gray-500">
                        Examples: {type.examples.join(', ')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How urgent is this?
              </label>
              <div className="space-y-2">
                {Object.entries(priorityLevels).map(([key, level]) => (
                  <label
                    key={key}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      priority === key 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={key}
                      checked={priority === key}
                      onChange={(e) => setPriority(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${level.color}`}>{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more about it
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="What were you trying to do? What happened? What did you expect to happen instead?"
              />
            </div>

            {/* Context Info */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <div className="font-medium flex items-center mb-1">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  We'll automatically include:
                </div>
                <ul className="text-xs text-blue-700 ml-5 list-disc">
                  <li>Current page: {window.location.pathname}</li>
                  <li>Your browser information (for technical issues)</li>
                  <li>Screen size and device type</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !description.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Feedback'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HitASnagButton;