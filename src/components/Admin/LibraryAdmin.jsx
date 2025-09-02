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
    gamma_page_url: '',
    thumbnail_url: '',
    preview_image_url: '',
    tags: '',
    prerequisites: '',
    learning_outcomes: '',
    tools_mentioned: '',
    is_featured: false,
    is_new: true
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
      const { data, error } = await supabase.storage
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
    if (!formData.gamma_page_url.trim()) errors.push('Gamma Page URL is required');
    if (!formData.short_description.trim()) errors.push('Short description is required');
    
    // Validate URL format
    try {
      new URL(formData.gamma_page_url);
    } catch {
      errors.push('Gamma Page URL must be a valid URL');
    }

    if (formData.thumbnail_url && formData.thumbnail_url.trim()) {
      try {
        new URL(formData.thumbnail_url);
      } catch {
        errors.push('Thumbnail URL must be a valid URL');
      }
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
        estimated_time_minutes: formData.estimated_time_minutes ? 
          parseInt(formData.estimated_time_minutes) : null,
        sort_order: 0,
        view_count: 0,
        bookmark_count: 0,
        status: 'published'
      };

      // Remove empty string fields
      Object.keys(tutorialData).forEach(key => {
        if (tutorialData[key] === '') {
          delete tutorialData[key];
        }
      });

      const { data, error } = await supabase
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
        gamma_page_url: '',
        thumbnail_url: '',
        preview_image_url: '',
        tags: '',
        prerequisites: '',
        learning_outcomes: '',
        tools_mentioned: '',
        is_featured: false,
        is_new: true
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

            {/* Subscription Tier */}
            <div className="form-group">
              <label htmlFor="required_tier">Required Subscription Tier</label>
              <select
                id="required_tier"
                name="required_tier"
                value={formData.required_tier}
                onChange={handleInputChange}
              >
                <option value="essential">Essential ($9.99)</option>
                <option value="enhanced">Enhanced ($16.99)</option>
                <option value="full_magic">Full Magic ($24.99)</option>
                <option value="creator">Creator ($39.99)</option>
              </select>
              <small>Only users with this subscription level or higher can access this tutorial</small>
            </div>

            {/* URLs */}
            <div className="form-group">
              <label htmlFor="gamma_page_url">Gamma Page URL *</label>
              <input
                type="url"
                id="gamma_page_url"
                name="gamma_page_url"
                value={formData.gamma_page_url}
                onChange={handleInputChange}
                placeholder="https://gamma.app/docs/your-tutorial-id"
                required
              />
            </div>

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
                    <img src={formData.preview_image_url} alt="Preview image" />
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