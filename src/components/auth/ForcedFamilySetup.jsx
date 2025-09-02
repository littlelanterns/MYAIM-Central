import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const ForcedFamilySetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Form data
  const [familyData, setFamilyData] = useState({
    primaryParentName: '',
    primaryParentRole: 'mom', // mom, dad, guardian
    setupType: 'solo', // solo or family
    familyName: '',
    partnerName: '',
    partnerRole: '',
    hasPartner: false,
    children: [],
    familyGoals: '',
    mainChallenges: '',
  });

  const [newChild, setNewChild] = useState({
    name: '',
    age: '',
    interests: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/beta/login');
      return;
    }
    setUser(user);
    
    // Pre-fill primary parent name if available
    if (user.user_metadata?.full_name) {
      setFamilyData(prev => ({ ...prev, primaryParentName: user.user_metadata.full_name }));
    }
  };

  const handleInputChange = (field, value) => {
    setFamilyData(prev => ({ ...prev, [field]: value }));
  };

  const addChild = () => {
    if (newChild.name && newChild.age) {
      setFamilyData(prev => ({
        ...prev,
        children: [...prev.children, { ...newChild, id: Date.now() }]
      }));
      setNewChild({ name: '', age: '', interests: '' });
    }
  };

  const removeChild = (id) => {
    setFamilyData(prev => ({
      ...prev,
      children: prev.children.filter(child => child.id !== id)
    }));
  };

  const getMaxSteps = () => {
    return familyData.setupType === 'solo' ? 2 : 4;
  };

  const handleNext = () => {
    const maxSteps = getMaxSteps();
    setCurrentStep(prev => Math.min(prev + 1, maxSteps));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Create family and family member records if family setup was chosen
      let familyId = null;
      if (familyData.setupType === 'family') {
        // Create family record
        // Generate a simple numeric ID from UUID for wordpress_user_id compatibility
        const numericId = parseInt(user.id.replace(/-/g, '').substring(0, 8), 16);
        
        const { data: newFamily, error: familyError } = await supabase
          .from('families')
          .insert({
            family_name: familyData.familyName,
            wordpress_user_id: numericId,
          })
          .select()
          .single();

        if (familyError) throw familyError;
        familyId = newFamily.id;

        // Add primary parent as family member
        await supabase
          .from('family_members')
          .insert({
            family_id: familyId,
            wordpress_user_id: numericId,
            name: familyData.primaryParentName,
            role: familyData.primaryParentRole,
            age: 30, // Default adult age
          });

        // Add partner if exists
        if (familyData.hasPartner && familyData.partnerName) {
          await supabase
            .from('family_members')
            .insert({
              family_id: familyId,
              name: familyData.partnerName,
              role: familyData.partnerRole === 'mom' || familyData.partnerRole === 'dad' ? familyData.partnerRole : 'guardian',
              age: 30, // Default adult age
            });
        }

        // Add children
        if (familyData.children.length > 0) {
          const childrenData = familyData.children.map(child => ({
            family_id: familyId,
            name: child.name,
            role: parseInt(child.age) < 13 ? 'child' : parseInt(child.age) < 18 ? 'teen' : 'guardian',
            age: parseInt(child.age),
            interests: child.interests ? [child.interests] : [],
          }));

          await supabase
            .from('family_members')
            .insert(childrenData);
        }
      } else {
        // Solo setup - create a simple family record for the individual
        // Generate a simple numeric ID from UUID for wordpress_user_id compatibility
        const numericId = parseInt(user.id.replace(/-/g, '').substring(0, 8), 16);
        
        const { data: newFamily, error: familyError } = await supabase
          .from('families')
          .insert({
            family_name: familyData.primaryParentName + "'s Family",
            wordpress_user_id: numericId,
          })
          .select()
          .single();

        if (familyError) throw familyError;
        familyId = newFamily.id;

        // Add them as the only family member
        await supabase
          .from('family_members')
          .insert({
            family_id: familyId,
            wordpress_user_id: numericId,
            name: familyData.primaryParentName,
            role: familyData.primaryParentRole,
            age: 30, // Default adult age
          });
      }

      // Mark beta setup as completed
      await supabase
        .from('beta_users')
        .update({ setup_completed: true })
        .eq('user_id', user.id);

      // Log the completion
      await supabase.from('user_activity_log').insert({
        user_id: user.id,
        page_visited: '/beta/family-setup',
        action_taken: `family_setup_completed_${familyData.setupType}`,
        metadata: { 
          setup_type: familyData.setupType,
          family_id: familyId,
          family_name: familyData.setupType === 'family' ? familyData.familyName : familyData.primaryParentName + "'s Family"
        }
      });

      navigate('/');
    } catch (error) {
      console.error('Family setup error:', error);
      alert('There was an error setting up your family. Please try again: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return familyData.primaryParentName && 
               (familyData.setupType === 'solo' || familyData.familyName);
      case 2:
        return familyData.setupType === 'solo' || true; // Partner is optional
      case 3:
        return familyData.setupType === 'solo' || true; // Children are optional
      case 4:
        return true; // Goals are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Beta Testing Setup
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AIMfM!</h1>
          <p className="text-gray-600">Let's set up your family profile to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {getMaxSteps()}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / getMaxSteps()) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / getMaxSteps()) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Let's Get You Set Up!</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={familyData.primaryParentName}
                  onChange={(e) => handleInputChange('primaryParentName', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role
                </label>
                <select
                  value={familyData.primaryParentRole}
                  onChange={(e) => handleInputChange('primaryParentRole', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="mom">Mom</option>
                  <option value="dad">Dad</option>
                  <option value="guardian">Guardian</option>
                  <option value="individual">Individual User</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Setup Type Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to set up your account?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="setupType"
                      value="solo"
                      checked={familyData.setupType === 'solo'}
                      onChange={(e) => handleInputChange('setupType', e.target.value)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Just me for now</span>
                      <p className="text-sm text-gray-600">Get started quickly and add family members later</p>
                    </div>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="radio"
                      name="setupType"
                      value="family"
                      checked={familyData.setupType === 'family'}
                      onChange={(e) => handleInputChange('setupType', e.target.value)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Set up my family</span>
                      <p className="text-sm text-gray-600">Add family members and set up the full experience</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Family Name - only if family setup */}
              {familyData.setupType === 'family' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Family Name (e.g., "The Smith Family")
                  </label>
                  <input
                    type="text"
                    value={familyData.familyName}
                    onChange={(e) => handleInputChange('familyName', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your family name"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && familyData.setupType === 'family' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Partner Information</h2>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="hasPartner"
                  checked={familyData.hasPartner}
                  onChange={(e) => handleInputChange('hasPartner', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="hasPartner" className="ml-2 block text-sm text-gray-900">
                  I have a spouse/partner
                </label>
              </div>

              {familyData.hasPartner && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner's Name
                    </label>
                    <input
                      type="text"
                      value={familyData.partnerName}
                      onChange={(e) => handleInputChange('partnerName', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter partner's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Partner's Role
                    </label>
                    <select
                      value={familyData.partnerRole}
                      onChange={(e) => handleInputChange('partnerRole', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select role</option>
                      <option value="mom">Mom</option>
                      <option value="dad">Dad</option>
                      <option value="partner">Partner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && familyData.setupType === 'family' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Children Information</h2>
              
              {/* Add Child Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Add a Child</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Child's name"
                    value={newChild.name}
                    onChange={(e) => setNewChild(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={newChild.age}
                    onChange={(e) => setNewChild(prev => ({ ...prev, age: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Interests (optional)"
                    value={newChild.interests}
                    onChange={(e) => setNewChild(prev => ({ ...prev, interests: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addChild}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Add Child
                </button>
              </div>

              {/* Children List */}
              {familyData.children.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Your Children</h3>
                  <div className="space-y-2">
                    {familyData.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
                        <div>
                          <span className="font-medium">{child.name}</span>
                          <span className="text-gray-600 ml-2">({child.age} years old)</span>
                          {child.interests && (
                            <span className="text-purple-600 ml-2">• {child.interests}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeChild(child.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && familyData.setupType === 'solo' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Just a few more details...</h2>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">You can always add family members later!</p>
                    <p className="mt-1">
                      You can add family members, set up permissions, and customize the experience anytime 
                      from your Family Settings page.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your main goals with AIMfM? (Optional)
                </label>
                <textarea
                  value={familyData.familyGoals}
                  onChange={(e) => handleInputChange('familyGoals', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Better organization, productivity, managing tasks..."
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Ready to Get Started!</h3>
                <p className="text-green-800 text-sm">
                  You're all set to explore AIMfM! Remember to use the "Hit a Snag?" button 
                  whenever you encounter any issues or have suggestions for improvement.
                </p>
              </div>
            </div>
          )}

          {currentStep === 4 && familyData.setupType === 'family' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Goals & Challenges</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your main family goals? (Optional)
                </label>
                <textarea
                  value={familyData.familyGoals}
                  onChange={(e) => handleInputChange('familyGoals', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Better organization, more quality time together, less screen time..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are your biggest family challenges? (Optional)
                </label>
                <textarea
                  value={familyData.mainChallenges}
                  onChange={(e) => handleInputChange('mainChallenges', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Busy schedules, keeping everyone organized, homework battles..."
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Ready to Get Started!</h3>
                <p className="text-green-800 text-sm">
                  You're all set to explore AIMfM! Remember to use the "Hit a Snag?" button 
                  whenever you encounter any issues or have suggestions for improvement.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep === getMaxSteps() ? (
            <button
              type="button"
              onClick={handleComplete}
              disabled={loading || !isStepValid()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Setting Up...
                </div>
              ) : (
                'Complete Setup'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForcedFamilySetup;