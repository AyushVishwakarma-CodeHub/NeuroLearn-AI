import React, { useState, useRef } from 'react';
import API_BASE, { authFetch } from '../config';
import './AIExtractor.css';

function AIExtractor({ user, setActiveTab, setActiveQuizData }) {
  const [files, setFiles] = useState([]); // Support multiple files
  const [extractMode, setExtractMode] = useState('pdf'); // 'pdf' or 'image'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const validateAndAddFiles = (selectedFiles) => {
    setError('');
    const newValidFiles = [];

    selectedFiles.forEach(file => {
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');

      if (extractMode === 'pdf' && !isPDF) {
        setError('One or more files are not valid PDFs.');
        return;
      }
      if (extractMode === 'image' && !isImage) {
        setError('One or more files are not valid Images.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('One or more files exceed 10MB limit.');
        return;
      }
      newValidFiles.push(file);
    });

    if (extractMode === 'pdf') {
      setFiles(newValidFiles.slice(0, 1)); // Only 1 PDF at a time for now
    } else {
      setFiles(prev => [...prev, ...newValidFiles].slice(0, 5)); // Max 5 images
    }
    setResult(null);
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    const endpoint = extractMode === 'pdf' ? '/api/generate/from-pdf' : '/api/generate/from-image';
    
    // For images, we handle them as an array if needed, but the current backend 
    // expects 'image' (single). I will send the first one or we can expand.
    // Let's assume we send the first one for now or combine them if I update the backend.
    
    if (extractMode === 'pdf') {
      formData.append('document', files[0]);
    } else {
      formData.append('image', files[0]); // Sending first image
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to process file');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!result || !user) return;
    setSaving(true);
    try {
      const response = await authFetch(`${API_BASE}/api/library/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: result.topicName,
          flashcards: result.flashcards,
          quizzes: result.quizzes
        })
      });
      if (!response.ok) throw new Error('Failed to save');
      alert('📚 Success! Study set saved to your library.');
      setActiveTab('library');
    } catch (err) {
      alert('Failed to save to library.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="extractor-container animate-fade-in">
      <div className="extractor-header">
        <h1>🪄 AI Knowledge Extractor</h1>
        <p>Convert your syllabus, notes, or <strong>photos of textbooks</strong> into personalized study materials.</p>
      </div>

      {!result ? (
        <div className="extractor-main">
          <div className="mode-selector glass-card">
            <button 
              className={extractMode === 'pdf' ? 'active' : ''} 
              onClick={() => { setExtractMode('pdf'); setFiles([]); setError(''); }}
            >
              📄 PDF Document
            </button>
            <button 
              className={extractMode === 'image' ? 'active' : ''} 
              onClick={() => { setExtractMode('image'); setFiles([]); setError(''); }}
            >
              📸 Image/Photo
            </button>
          </div>

          <div 
            className={`drop-zone glass-card ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => files.length === 0 && fileInputRef.current.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept={extractMode === 'pdf' ? 'application/pdf' : 'image/*'}
              style={{ display: 'none' }} 
              multiple={extractMode === 'image'}
            />
            
            <div className="drop-zone-content">
              {files.length > 0 ? (
                <div className="file-preview-grid">
                  {files.map((file, idx) => (
                    <div key={idx} className="file-info-mini animate-pop">
                      <div className="file-icon-mini">{extractMode === 'pdf' ? '📄' : '📸'}</div>
                      <div className="file-name-mini">{file.name}</div>
                      <button className="btn-clear-mini" onClick={(e) => { 
                        e.stopPropagation(); 
                        setFiles(prev => prev.filter((_, i) => i !== idx)); 
                      }}>✕</button>
                    </div>
                  ))}
                  {extractMode === 'image' && files.length < 5 && (
                    <div className="add-more-file" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                      <span>+</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="upload-icon">☁️</div>
                  <p>Drag & Drop or <span>Click to Upload</span></p>
                  <small>{extractMode === 'pdf' ? 'Supports PDF up to 10MB' : 'Supports up to 5 Images'}</small>
                </>
              )}
            </div>
          </div>

          {error && <div className="extractor-error animate-shake">⚠️ {error}</div>}

          <button 
            className={`btn-generate ${loading || files.length === 0 ? 'disabled' : ''}`}
            disabled={loading || files.length === 0}
            onClick={handleGenerate}
          >
            {loading ? (
              <><span className="spinner"></span> AI is reading your {extractMode === 'pdf' ? 'document' : 'files'}...</>
            ) : (
              `✨ Generate Study Set from ${files.length} ${extractMode === 'pdf' ? 'File' : 'Images'}`
            )}
          </button>
        </div>
      ) : (
        <div className="extractor-result animate-slide-up">
          <div className="result-header glass-card">
            <div className="topic-badge">Generated Topic</div>
            <h2>{result.topicName}</h2>
            <div className="stats-row">
              <span className="stat-pill">🎴 {result.flashcards.length} Flashcards</span>
              <span className="stat-pill">📝 {result.quizzes.length} Quiz Questions</span>
            </div>
            <div className="result-actions">
              <button className="btn-save-lib" onClick={handleSaveToLibrary} disabled={saving}>
                {saving ? 'Saving...' : '📚 Save to Library'}
              </button>
              <button className="btn-secondary" onClick={() => { setResult(null); setFiles([]); }}>
                🔄 Try Another
              </button>
            </div>
          </div>

          <div className="result-preview">
            <div className="preview-section glass-card">
              <h3>Flashcards Preview</h3>
              <div className="preview-list">
                {result.flashcards.slice(0, 3).map((f, i) => (
                  <div key={i} className="preview-item">
                    <strong>Q: {f.question}</strong>
                    <p>A: {f.answer}</p>
                  </div>
                ))}
                {result.flashcards.length > 3 && <p className="more-count">+ {result.flashcards.length - 3} more...</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIExtractor;
