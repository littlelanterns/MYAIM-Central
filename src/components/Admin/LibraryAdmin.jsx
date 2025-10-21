import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import VCModerationPanel from '../Library/VCModerationPanel';
import BetaAdmin from './BetaAdmin';
import './LibraryAdmin.css';

const LibraryAdmin = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category: '',
    subcategory: '',
    difficulty_level: 'beginner',
    estimated_time_minutes: '',
    content_type: 'tutorial',
    required_tier: 'essential',
    content_url: '',  // Renamed from gamma_page_url
    thumbnail_url: '',
    preview_image_url: '',
    tags: '',
    prerequisites: '',
    learning_outcomes: '',
    tools_mentioned: '',
    is_featured: false,
    is_new: true,

    // New tool type fields
    tool_type: 'tutorial',
    tool_url: '',
    embedding_method: 'direct-iframe',
    requires_auth: false,
    auth_provider: '',

    // Portal information
    portal_description: '',
    portal_tips: '',  // Will be split into array
    prerequisites_text: '',

    // Enhanced "New" badge
    first_seen_tracking: true,
    new_badge_duration_days: 30,

    // Holiday/Gift tagging
    seasonal_tags: '',  // Will be split into array
    gift_idea_tags: '',  // Will be split into array
    seasonal_priority: 0,

    // Multi-tier access
    allowed_tiers: ['essential'],  // Array of selected tiers

    // Flexible usage limits
    enable_usage_limits: false,
    usage_limit_type: 'daily_uses',
    usage_limit_amount: 0,
    usage_limit_notes: '',
    session_timeout_minutes: 60,

    // LiLa Optimization
    enable_lila_optimization: false,
    lila_optimization_prompt: ''
  });

  const [existingCategories, setExistingCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recentTutorials, setRecentTutorials] = useState([]);
  const [activeView, setActiveView] = useState('tutorials'); // 'tutorials' or 'moderation'

  useEffect(() => {
    loadCategories();
    loadRecentTutorials();
  }, []);

  const loadCategories = async () => {
    try {
      // Get unique categories from existing tutorials
      const { data: tutorials } = await supabase
        .from('library_items')
        .select('category')
        .not('category', 'is', null);
      
      // Get predefined categories
      const { data: predefined } = await supabase
        .from('library_categories')
        .select('id, display_name')
        .eq('is_active', true);

      // Combine and deduplicate
      const uniqueCategories = new Set();
      
      if (tutorials) {
        tutorials.forEach(t => uniqueCategories.add(t.category));
      }
      
      if (predefined) {
        predefined.forEach(c => uniqueCategories.add(c.id));
      }

      setExistingCategories(Array.from(uniqueCategories).sort());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadRecentTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('library_items')
        .select('id, title, category, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentTutorials(data || []);
    } catch (error) {
      console.error('Error loading recent tutorials:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim() && !existingCategories.includes(newCategory.trim())) {
      const categoryId = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
      setExistingCategories([...existingCategories, categoryId]);
      setFormData({...formData, category: categoryId});
      setNewCategory('');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'Please select a valid image file (JPG, PNG, etc.)'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Image file must be smaller than 5MB'
      });
      return;
    }

    try {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `library-images/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('library-assets')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to upload image. Please try again.'
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('library-assets')
        .getPublicUrl(filePath);

      // Update form data based on which input was used
      const fieldName = e.target.name === 'thumbnail_image' ? 'thumbnail_url' : 'preview_image_url';
      setFormData(prev => ({
        ...prev,
        [fieldName]: publicUrl
      }));

      setMessage({
        type: 'success',
        text: 'Image uploaded successfully!'
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({
        type: 'error',
        text: 'Error uploading image. Please try again.'
      });
    }
  };

  const removeImage = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  const processArrayField = (fieldValue) => {
    if (!fieldValue.trim()) return [];
    return fieldValue
      .split(/[,\n]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  const processTagsField = (tagsValue) => {
    if (!tagsValue.trim()) return [];
    return tagsValue
      .split(/[#\s,\n]/)
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.category.trim()) errors.push('Category is required');
    if (!formData.short_description.trim()) errors.push('Short description is required');

    // For tutorials, content_url is required. For other types, either content_url or tool_url
    if (formData.tool_type === 'tutorial') {
      if (!formData.content_url.trim()) errors.push('Content URL is required for tutorials');
      try {
        new URL(formData.content_url);
      } catch {
        errors.push('Content URL must be a valid URL');
      }
    } else {
      if (!formData.tool_url.trim()) errors.push('Tool URL is required for non-tutorial content');
      try {
        new URL(formData.tool_url);
      } catch {
        errors.push('Tool URL must be a valid URL');
      }
    }

    if (formData.thumbnail_url && formData.thumbnail_url.trim()) {
      try {
        new URL(formData.thumbnail_url);
      } catch {
        errors.push('Thumbnail URL must be a valid URL');
      }
    }

    // Validate multi-tier selection
    if (!formData.allowed_tiers || formData.allowed_tiers.length === 0) {
      errors.push('At least one subscription tier must be selected');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setMessage({
        type: 'error',
        text: 'Please fix the following errors:\n' + errors.join('\n')
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Process array fields
      const tutorialData = {
        ...formData,
        tags: processTagsField(formData.tags),
        prerequisites: processArrayField(formData.prerequisites),
        learning_outcomes: processArrayField(formData.learning_outcomes),
        tools_mentioned: processArrayField(formData.tools_mentioned),
        portal_tips: processArrayField(formData.portal_tips),
        seasonal_tags: processArrayField(formData.seasonal_tags),
        gift_idea_tags: processArrayField(formData.gift_idea_tags),
        estimated_time_minutes: formData.estimated_time_minutes ?
          parseInt(formData.estimated_time_minutes) : null,
        seasonal_priority: parseInt(formData.seasonal_priority) || 0,
        new_badge_duration_days: parseInt(formData.new_badge_duration_days) || 30,
        usage_limit_amount: parseInt(formData.usage_limit_amount) || 0,
        session_timeout_minutes: parseInt(formData.session_timeout_minutes) || 60,
        sort_order: 0,
        view_count: 0,
        bookmark_count: 0,
        status: 'published'
      };

      // Remove empty string fields
      Object.keys(tutorialData).forEach(key => {
        if (tutorialData[key] === '' || tutorialData[key] === null) {
          delete tutorialData[key];
        }
      });

      const { error } = await supabase
        .from('library_items')
        .insert([tutorialData])
        .select();

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Tutorial "${tutorialData.title}" added successfully!`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        short_description: '',
        category: '',
        subcategory: '',
        difficulty_level: 'beginner',
        estimated_time_minutes: '',
        content_type: 'tutorial',
        required_tier: 'essential',
        content_url: '',
        thumbnail_url: '',
        preview_image_url: '',
        tags: '',
        prerequisites: '',
        learning_outcomes: '',
        tools_mentioned: '',
        is_featured: false,
        is_new: true,
        tool_type: 'tutorial',
        tool_url: '',
        embedding_method: 'direct-iframe',
        requires_auth: false,
        auth_provider: '',
        portal_description: '',
        portal_tips: '',
        prerequisites_text: '',
        first_seen_tracking: true,
        new_badge_duration_days: 30,
        seasonal_tags: '',
        gift_idea_tags: '',
        seasonal_priority: 0,
        allowed_tiers: ['essential'],
        enable_usage_limits: false,
        usage_limit_type: 'daily_uses',
        usage_limit_amount: 0,
        usage_limit_notes: '',
        session_timeout_minutes: 60,
        enable_lila_optimization: false,
        lila_optimization_prompt: ''
      });

      // Reload data
      loadCategories();
      loadRecentTutorials();

    } catch (error) {
      console.error('Error adding tutorial:', error);
      setMessage({
        type: 'error',
        text: `Error adding tutorial: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>AIM-Administration Console</h1>
        <p>Manage tutorials and community discussions</p>
        
        <div className="admin-nav">
          <button
            className={`nav-btn ${activeView === 'tutorials' ? 'active' : ''}`}
            onClick={() => setActiveView('tutorials')}
          >
            Tutorials
          </button>
          <button
            className={`nav-btn ${activeView === 'moderation' ? 'active' : ''}`}
            onClick={() => setActiveView('moderation')}
          >
            Comment Moderation
          </button>
          <button
            className={`nav-btn ${activeView === 'beta' ? 'active' : ''}`}
            onClick={() => setActiveView('beta')}
          >
            Beta Testing
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}

      {activeView === 'moderation' ? (
        <VCModerationPanel />
      ) : activeView === 'beta' ? (
        <BetaAdmin />
      ) : (
        <div className="admin-layout">
        <div className="form-section">
          <h2>Add New Tutorial</h2>
          <form onSubmit={handleSubmit} className="tutorial-form">
            
            {/* Basic Information */}
            <div className="form-group">
              <label htmlFor="title">Tutorial Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Master ChatGPT Prompting for Busy Moms"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="short_description">Short Description * (for cards)</label>
              <textarea
                id="short_description"
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                rows={2}
                placeholder="Brief description shown on tutorial cards (max 150 chars)"
                maxLength={150}
                required
              />
              <small>{formData.short_description.length}/150 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Full Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Detailed description shown in preview modal"
              />
            </div>

            {/* Tool Type Selection */}
            <div className="form-group">
              <label htmlFor="tool_type">Content/Tool Type *</label>
              <select
                id="tool_type"
                name="tool_type"
                value={formData.tool_type}
                onChange={handleInputChange}
                required
              >
                <option value="tutorial">Tutorial (Gamma Page)</option>
                <option value="custom-gpt">Custom GPT (ChatGPT)</option>
                <option value="gemini-gem">Gemini Gem (Google)</option>
                <option value="opal-app">Opal App (Google AI Studio)</option>
                <option value="caffeine-app">Caffeine App (Custom Built)</option>
                <option value="perplexity-app">Perplexity Tool</option>
                <option value="custom-link">Custom Link (Other)</option>
                <option value="tool-collection">Tool Collection</option>
                <option value="workflow">Workflow</option>
                <option value="prompt-pack">Prompt Pack</option>
              </select>
              <small>
                {formData.tool_type === 'custom-link' &&
                  "For any external tool or hosted app not listed above"}
                {formData.tool_type === 'tutorial' &&
                  "Standard Gamma presentation or tutorial"}
                {formData.tool_type === 'custom-gpt' &&
                  "ChatGPT Custom GPT (users will need their own ChatGPT account)"}
                {formData.tool_type === 'gemini-gem' &&
                  "Google Gemini Gem (users will need their own Google account)"}
              </small>
            </div>

            {/* Category Selection */}
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {existingCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
              
              <div className="add-category">
                <input
                  type="text"
                  placeholder="Or create new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewCategory();
                    }
                  }}
                />
                <button type="button" onClick={handleAddNewCategory}>
                  Add Category
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="difficulty_level">Difficulty Level</label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="content_type">Content Type</label>
                <select
                  id="content_type"
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleInputChange}
                >
                  <option value="tutorial">Tutorial</option>
                  <option value="tool-collection">Tool Collection</option>
                  <option value="workflow">Workflow</option>
                  <option value="prompt-pack">Prompt Pack</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estimated_time_minutes">Duration (minutes)</label>
                <input
                  type="number"
                  id="estimated_time_minutes"
                  name="estimated_time_minutes"
                  value={formData.estimated_time_minutes}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="15"
                />
              </div>
            </div>

            {/* Multi-Tier Access Control */}
            <div className="form-section">
              <h3>Subscription Access *</h3>
              <p style={{fontSize: '0.9rem', marginBottom: '1rem', color: '#666'}}>
                Select all tiers that can access this content. Higher tiers automatically include lower tier content.
              </p>
              <div className="tier-checkboxes" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem'}}>
                {['essential', 'enhanced', 'full_magic', 'creator'].map(tier => (
                  <label key={tier} style={{display: 'flex', alignItems: 'center', padding: '0.5rem', background: '#f8f9fa', borderRadius: '4px', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={formData.allowed_tiers.includes(tier)}
                      onChange={(e) => {
                        const newTiers = e.target.checked
                          ? [...formData.allowed_tiers, tier]
                          : formData.allowed_tiers.filter(t => t !== tier);
                        setFormData({...formData, allowed_tiers: newTiers});
                      }}
                      style={{marginRight: '0.5rem'}}
                    />
                    {tier === 'essential' && 'Essential ($9.99)'}
                    {tier === 'enhanced' && 'Enhanced ($16.99)'}
                    {tier === 'full_magic' && 'Full Magic ($24.99)'}
                    {tier === 'creator' && 'Creator ($39.99)'}
                  </label>
                ))}
              </div>
            </div>

            {/* URLs - Conditional based on tool type */}
            {formData.tool_type === 'tutorial' ? (
              <div className="form-group">
                <label htmlFor="content_url">Content URL * (Gamma Page)</label>
                <input
                  type="url"
                  id="content_url"
                  name="content_url"
                  value={formData.content_url}
                  onChange={handleInputChange}
                  placeholder="https://gamma.app/docs/your-tutorial-id"
                  required
                />
                <small>Public URL to your Gamma presentation</small>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="tool_url">Tool URL * (Hidden from users)</label>
                  <input
                    type="url"
                    id="tool_url"
                    name="tool_url"
                    value={formData.tool_url}
                    onChange={handleInputChange}
                    placeholder="https://chatgpt.com/g/g-abc123... or other tool URL"
                    required
                  />
                  <small>This URL will be embedded in an iframe and kept private from users</small>
                </div>

                <div className="form-group">
                  <label htmlFor="embedding_method">How to display this tool</label>
                  <select
                    id="embedding_method"
                    name="embedding_method"
                    value={formData.embedding_method}
                    onChange={handleInputChange}
                  >
                    <option value="direct-iframe">Direct Iframe (No auth needed)</option>
                    <option value="authenticated-iframe">Authenticated Iframe (User logs in)</option>
                    <option value="portal-only">Portal Only (No embed, opens in new tab)</option>
                  </select>
                  <small>
                    {formData.embedding_method === 'direct-iframe' && 'Tool loads directly in iframe'}
                    {formData.embedding_method === 'authenticated-iframe' && 'User will need to authenticate first'}
                    {formData.embedding_method === 'portal-only' && 'Tool opens in new browser tab/window'}
                  </small>
                </div>

                {formData.embedding_method === 'authenticated-iframe' && (
                  <div className="form-group">
                    <label htmlFor="auth_provider">Authentication Provider</label>
                    <select
                      id="auth_provider"
                      name="auth_provider"
                      value={formData.auth_provider}
                      onChange={handleInputChange}
                    >
                      <option value="">Select provider...</option>
                      <option value="google">Google</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="perplexity">Perplexity</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="thumbnail_image">Thumbnail Image</label>
                <input
                  type="file"
                  id="thumbnail_image"
                  name="thumbnail_image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <small>Recommended: 300x200px, JPG or PNG</small>
                {formData.thumbnail_url && (
                  <div className="image-preview">
                    <img src={formData.thumbnail_url} alt="Thumbnail preview" />
                    <button type="button" onClick={() => removeImage('thumbnail_url')}>Remove</button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="preview_image">Preview Image</label>
                <input
                  type="file"
                  id="preview_image"
                  name="preview_image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <small>Recommended: 800x600px, JPG or PNG</small>
                {formData.preview_image_url && (
                  <div className="image-preview">
                    <img src={formData.preview_image_url} alt="Tool preview" />
                    <button type="button" onClick={() => removeImage('preview_image_url')}>Remove</button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="form-group">
              <label htmlFor="learning_outcomes">Learning Outcomes (one per line)</label>
              <textarea
                id="learning_outcomes"
                name="learning_outcomes"
                value={formData.learning_outcomes}
                onChange={handleInputChange}
                rows={3}
                placeholder="How to craft effective prompts&#10;Understanding AI response patterns&#10;Building complex conversation flows"
              />
            </div>

            <div className="form-group">
              <label htmlFor="prerequisites">Prerequisites (one per line)</label>
              <textarea
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                rows={2}
                placeholder="Basic familiarity with ChatGPT&#10;Understanding of family time management"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tools_mentioned">Tools & Platforms (comma-separated)</label>
              <input
                type="text"
                id="tools_mentioned"
                name="tools_mentioned"
                value={formData.tools_mentioned}
                onChange={handleInputChange}
                placeholder="ChatGPT, Claude, n8n, MidJourney"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tags">Hashtags for Search</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="#chatgpt #prompting #beginner #automation #family"
              />
              <small>Type hashtags like: #chatgpt #prompting #beginner (these will be searchable)</small>
            </div>

            {/* Display Options */}
            <div className="form-group checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                />
                Featured Tutorial (show in hero section)
              </label>

              <label>
                <input
                  type="checkbox"
                  name="is_new"
                  checked={formData.is_new}
                  onChange={handleInputChange}
                />
                Mark as "NEW"
              </label>
            </div>

            {/* LiLa Optimization */}
            <div className="form-section" style={{marginTop: '2rem', padding: '1.5rem', background: '#fef6ff', borderRadius: '8px', border: '2px solid #e0d4f7'}}>
              <h3 style={{marginTop: 0, color: '#68a395'}}>✨ LiLa Optimization</h3>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
                Add an "Optimize with LiLa" button that personalizes this tool with the family's context (kids' names, learning styles, preferences, etc.)
              </p>

              <div className="form-group checkboxes">
                <label>
                  <input
                    type="checkbox"
                    name="enable_lila_optimization"
                    checked={formData.enable_lila_optimization}
                    onChange={handleInputChange}
                  />
                  ✨ Enable "Optimize with LiLa" button on this tool
                </label>
              </div>

              {formData.enable_lila_optimization && (
                <div className="form-group">
                  <label htmlFor="lila_optimization_prompt">Custom Instructions for LiLa (Optional)</label>
                  <textarea
                    id="lila_optimization_prompt"
                    name="lila_optimization_prompt"
                    value={formData.lila_optimization_prompt}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="e.g., 'Focus on visual learning strategies' or 'Emphasize time management tips' - Leave blank for general optimization"
                  />
                  <small>These instructions tell LiLa how to personalize this tool for each family</small>
                </div>
              )}
            </div>

            {/* Portal/Prep Information (for non-tutorial tools) */}
            {formData.tool_type !== 'tutorial' && (
              <div className="form-section" style={{marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px'}}>
                <h3 style={{marginTop: 0}}>Portal Information</h3>
                <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
                  This information is shown to users before they launch the tool
                </p>

                <div className="form-group">
                  <label htmlFor="portal_description">Portal Description</label>
                  <textarea
                    id="portal_description"
                    name="portal_description"
                    value={formData.portal_description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Explain what this tool does and how it helps..."
                  />
                  <small>What users see before launching the tool</small>
                </div>

                <div className="form-group">
                  <label htmlFor="portal_tips">Tips for Using (one per line)</label>
                  <textarea
                    id="portal_tips"
                    name="portal_tips"
                    value={formData.portal_tips}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Have your family preferences ready&#10;Consider your week's schedule&#10;Keep a notepad handy for ideas"
                  />
                  <small>Helpful tips shown in the portal</small>
                </div>

                <div className="form-group">
                  <label htmlFor="prerequisites_text">Prerequisites (Before you start...)</label>
                  <textarea
                    id="prerequisites_text"
                    name="prerequisites_text"
                    value={formData.prerequisites_text}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="What users should know or have ready before using this tool"
                  />
                </div>
              </div>
            )}

            {/* Enhanced "New" Badge Settings */}
            <div className="form-section" style={{marginTop: '2rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px'}}>
              <h3 style={{marginTop: 0}}>"New" Badge Settings</h3>

              <div className="form-group checkboxes">
                <label>
                  <input
                    type="checkbox"
                    name="first_seen_tracking"
                    checked={formData.first_seen_tracking}
                    onChange={handleInputChange}
                  />
                  Show "NEW" badge for 30 days after user's first library visit
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="new_badge_duration_days">Duration (days to show "NEW" badge)</label>
                <input
                  type="number"
                  id="new_badge_duration_days"
                  name="new_badge_duration_days"
                  value={formData.new_badge_duration_days}
                  onChange={handleInputChange}
                  min="1"
                  max="90"
                  style={{maxWidth: '150px'}}
                />
                <small>Default: 30 days from when user first sees it in their library</small>
              </div>
            </div>

            {/* Holiday & Gift Tagging */}
            <div className="form-section" style={{marginTop: '2rem', padding: '1.5rem', background: '#fef3f2', borderRadius: '8px'}}>
              <h3 style={{marginTop: 0}}>Seasonal & Gift Tagging</h3>

              <div className="form-group">
                <label htmlFor="seasonal_tags">Seasonal Tags (comma-separated)</label>
                <input
                  type="text"
                  id="seasonal_tags"
                  name="seasonal_tags"
                  value={formData.seasonal_tags}
                  onChange={handleInputChange}
                  placeholder="christmas, mothers-day, back-to-school, valentines-day"
                />
                <small>Helps surface content during relevant seasons</small>
              </div>

              <div className="form-group">
                <label htmlFor="gift_idea_tags">Gift Idea Tags (comma-separated)</label>
                <input
                  type="text"
                  id="gift_idea_tags"
                  name="gift_idea_tags"
                  value={formData.gift_idea_tags}
                  onChange={handleInputChange}
                  placeholder="gifts-for-teachers, handmade-gifts, gift-wrapping, diy-gifts"
                />
                <small>Shows in gift idea browsing and searches</small>
              </div>

              <div className="form-group">
                <label htmlFor="seasonal_priority">Seasonal Priority (0-10, higher = more prominent)</label>
                <input
                  type="number"
                  id="seasonal_priority"
                  name="seasonal_priority"
                  value={formData.seasonal_priority}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  style={{maxWidth: '150px'}}
                />
                <small>Boost visibility during relevant season (0 = normal, 10 = highest priority)</small>
              </div>
            </div>

            {/* Session & Usage Limits */}
            <div className="form-section" style={{marginTop: '2rem', padding: '1.5rem', background: '#fff7ed', borderRadius: '8px'}}>
              <h3 style={{marginTop: 0}}>Usage Limits (Optional)</h3>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>
                Only enable limits for tools that cost you money (API calls, hosting, etc.)
                <br />Tools using user's own accounts (ChatGPT, Gemini) don't need limits.
              </p>

              <div className="form-group checkboxes">
                <label>
                  <input
                    type="checkbox"
                    name="enable_usage_limits"
                    checked={formData.enable_usage_limits}
                    onChange={handleInputChange}
                  />
                  Enable usage limits for this tool
                </label>
              </div>

              {formData.enable_usage_limits && (
                <>
                  <div className="form-group">
                    <label htmlFor="usage_limit_type">Limit Type</label>
                    <select
                      id="usage_limit_type"
                      name="usage_limit_type"
                      value={formData.usage_limit_type}
                      onChange={handleInputChange}
                    >
                      <option value="daily_uses">Daily Uses (e.g., 10 uses per day)</option>
                      <option value="session_time">Session Time (e.g., 30 minutes per session)</option>
                      <option value="monthly_uses">Monthly Uses (e.g., 50 uses per month)</option>
                      <option value="api_tokens">API Tokens (e.g., 5000 tokens per use)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="usage_limit_amount">Limit Amount</label>
                    <input
                      type="number"
                      id="usage_limit_amount"
                      name="usage_limit_amount"
                      value={formData.usage_limit_amount}
                      onChange={handleInputChange}
                      min="1"
                      placeholder="Enter limit amount"
                      style={{maxWidth: '200px'}}
                    />
                    <small>
                      {formData.usage_limit_type === 'daily_uses' && 'Number of times users can use this per day'}
                      {formData.usage_limit_type === 'session_time' && 'Maximum minutes per session'}
                      {formData.usage_limit_type === 'monthly_uses' && 'Number of times users can use this per month'}
                      {formData.usage_limit_type === 'api_tokens' && 'Maximum API tokens allowed per use'}
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="usage_limit_notes">Notes (Why this limit exists - for your reference)</label>
                    <textarea
                      id="usage_limit_notes"
                      name="usage_limit_notes"
                      value={formData.usage_limit_notes}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="e.g., 'Each use costs $0.02 in OpenAI API calls' or 'Cloudflare limits free tier'"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="session_timeout_minutes">Session Idle Timeout (minutes)</label>
                <input
                  type="number"
                  id="session_timeout_minutes"
                  name="session_timeout_minutes"
                  value={formData.session_timeout_minutes}
                  onChange={handleInputChange}
                  min="5"
                  max="480"
                  style={{maxWidth: '150px'}}
                />
                <small>Session ends after this many minutes of inactivity (default: 60)</small>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding Tutorial...' : 'Add Tutorial'}
            </button>
          </form>
        </div>

        {/* Recent Tutorials Sidebar */}
        <div className="sidebar">
          <h3>Recent Tutorials</h3>
          <div className="recent-tutorials">
            {recentTutorials.map(tutorial => (
              <div key={tutorial.id} className="recent-tutorial">
                <h4>{tutorial.title}</h4>
                <div className="tutorial-meta">
                  <span className="category">{tutorial.category}</span>
                  <span className="date">{formatDate(tutorial.created_at)}</span>
                  <span className={`status ${tutorial.status}`}>
                    {tutorial.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default LibraryAdmin;