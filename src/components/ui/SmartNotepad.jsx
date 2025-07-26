// src/components/ui/SmartNotepad.jsx - UPDATED to be self-contained
import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Plus, X } from 'lucide-react';
import './SmartNotepad.css';

// THE FIX: We remove all props from the definition.
// It no longer expects 'onUseAsPrompt' or any other props.
const SmartNotepad = () => {
  const editorRef = useRef(null);
  const [sections, setSections] = useState([
    { id: 1, title: 'General Notes', content: '' },
    { id: 2, title: 'Meal Planning', content: '' }
  ]);
  const [activeSectionId, setActiveSectionId] = useState(1);
  const [copyButtonText, setCopyButtonText] = useState('Copy text');
  const [usePromptButtonText, setUsePromptButtonText] = useState('Use as Prompt');

  // THE FIX: We remove the 'useEffect' that was listening for props,
  // as this component no longer needs them.

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
  };

  const copyText = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      navigator.clipboard.writeText(text);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy text'), 1500);
    }
  };

  const clearPage = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      saveCurrentSection();
    }
  };

  const handleUseClick = () => {
    // THE FIX: Instead of calling a prop, this is now a placeholder.
    alert('This feature will be connected soon!');
    
    // We can still keep the nice visual feedback.
    setUsePromptButtonText('...');
    setTimeout(() => setUsePromptButtonText('Use as Prompt'), 1500);
  };

  // ... (The rest of your functions are perfect and need no changes) ...
  const handleSaveAs = () => {
    if (editorRef.current) {
      const textToSave = editorRef.current.innerText;
      const activeSection = sections.find(s => s.id === activeSectionId);
      const filename = `${activeSection?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'notes'}.txt`;
      const blob = new Blob([textToSave], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  const handleSummarize = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      if (text.trim()) {
        const summary = `📝 SUMMARY:\n\nKey points from "${sections.find(s => s.id === activeSectionId)?.title}":\n• ${text.substring(0, 100)}...\n• [Additional summarized points would appear here]`;
        const newId = Date.now();
        const summarySection = { id: newId, title: `Summary - ${sections.find(s => s.id === activeSectionId)?.title}`, content: summary };
        setSections(prev => [...prev, summarySection]);
        setActiveSectionId(newId);
        if (editorRef.current) {
          editorRef.current.innerHTML = summary.replace(/\n/g, '<br>');
        }
      }
    }
  };
  const handleSendToMindSweep = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      console.log('Sending to MindSweep:', text);
      alert('Coming Soon! MindSweep integration is in development.');
    }
  };
  const saveCurrentSection = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML;
      setSections(prev => prev.map(s => s.id === activeSectionId ? { ...s, content: currentContent } : s));
    }
  };
  const addSection = () => {
    saveCurrentSection();
    const newId = Date.now();
    const newSection = { id: newId, title: `New Tab ${sections.length + 1}`, content: '' };
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newId);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };
  const switchSection = (sectionId) => {
    if (sectionId === activeSectionId) return;
    saveCurrentSection();
    setActiveSectionId(sectionId);
    const section = sections.find(s => s.id === sectionId);
    if (editorRef.current) {
      editorRef.current.innerHTML = section?.content || '';
    }
  };
  const deleteSection = (sectionId, e) => {
    e.stopPropagation();
    if (sections.length <= 1) return;
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (sectionId === activeSectionId) {
      const remainingSections = sections.filter(s => s.id !== sectionId);
      const newActiveId = remainingSections[0]?.id;
      setActiveSectionId(newActiveId);
      if (editorRef.current) {
        editorRef.current.innerHTML = remainingSections[0]?.content || '';
      }
    }
  };
  const editSectionTitle = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    const newTitle = prompt('Enter new tab name:', section?.title);
    if (newTitle && newTitle.trim()) {
      setSections(prev => prev.map(s => s.id === sectionId ? { ...s, title: newTitle.trim() } : s));
    }
  };


  return (
    <div className="clipboard-container">
      {/* All the JSX from here down is perfect, no changes needed */}
      <div className="clipboard-paper">
        <div className="document-sections">
          <button className="add-section-btn" onClick={addSection} title="Add new tab"><Plus size={14} /></button>
          {sections.map(section => (
            <div key={section.id} className="section-tab-container">
              <button className={`section-tab ${section.id === activeSectionId ? 'active' : ''}`} onClick={() => switchSection(section.id)} onDoubleClick={() => editSectionTitle(section.id)} title="Double-click to rename">
                {section.title}
              </button>
              {sections.length > 1 && (<button className="delete-tab" onClick={(e) => deleteSection(section.id, e)} title="Delete tab"><X size={12} /></button>)}
            </div>
          ))}
        </div>
        <div className="formatting-toolbar">
          <button onClick={() => handleFormat('bold')} title="Bold"><Bold size={16} /></button>
          <button onClick={() => handleFormat('italic')} title="Italic"><Italic size={16} /></button>
          <button onClick={() => handleFormat('underline')} title="Underline"><Underline size={16} /></button>
          <div className="format-divider"></div>
          <button onClick={() => handleFormat('insertUnorderedList')} title="Bullet List"><List size={16} /></button>
          <button onClick={() => handleFormat('insertOrderedList')} title="Numbered List"><ListOrdered size={16} /></button>
        </div>
        <div ref={editorRef} className="rich-editor" contentEditable suppressContentEditableWarning placeholder="Start typing..." onBlur={saveCurrentSection} onInput={saveCurrentSection}/>
        <div className="label-stickers">
          <button className="label-sticker sticker-sage" onClick={copyText}>{copyButtonText}</button>
          <button className="label-sticker sticker-honey" onClick={clearPage}>Clear Page</button>
          <button className="label-sticker sticker-sage" onClick={handleSummarize}>Summarize</button>
          <button className="label-sticker sticker-honey" onClick={handleUseClick}>{usePromptButtonText}</button>
          <button className="label-sticker sticker-gold" onClick={handleSaveAs}>Save As...</button>
          <button className="label-sticker sticker-gold" onClick={handleSendToMindSweep} title="Coming Soon!">Send to MindSweep</button>
        </div>
      </div>
    </div>
  );
};

export default SmartNotepad;