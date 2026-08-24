'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  Plus,
  Compass,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { AISummary } from '@/lib/db';
import MapContainer from '@/components/MapContainer';

const CATEGORIES = [
  'Roads',
  'Water Supply',
  'Electricity',
  'Sanitation',
  'Street Lights',
  'Public Safety',
  'Environment',
  'Other'
];

export default function ReportIssue() {
  const { user } = useAuth();
  const router = useRouter();

  // Multi-step state
  const [step, setStep] = useState(1);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=120' // Initial seeded image matching Stitch mockup
  ]);
  
  // Coordinates
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);

  // AI assist states
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  
  // Interaction states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Set default phone from user profile
  useEffect(() => {
    if (user) {
      setContactPhone(user.phone || '');
    }
  }, [user]);

  // Convert uploaded image to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setError('');
    
    if (files.length + images.length > 4) {
      setError('You can upload a maximum of 4 images.');
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Images must be smaller than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // AI analysis click handler
  const handleAIAnalyze = async () => {
    if (!description || description.trim().length < 10) {
      setError('Please type a description before invoking the AI helper.');
      return;
    }

    setError('');
    setAiAnalyzing(true);
    setAiSummary(null);

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI analysis failed');
      }

      setAiSummary(data.aiSummary);
      if (CATEGORIES.includes(data.aiSummary.category)) {
        setCategory(data.aiSummary.category);
      } else {
        setCategory('Other');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze text.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Autodetect GPS Location
  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocation(`GPS Pin Coordinates (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        () => {
          setError('GPS location lookup failed. Please enter location manually.');
        }
      );
    } else {
      setError('Geolocation not supported by browser.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || `Civic issue regarding ${category}`,
          description,
          category,
          location,
          latitude,
          longitude,
          images,
          contactPhone,
          aiSummary: aiSummary || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/citizen/track?id=${data.complaint.id}`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save complaint.');
      setSubmitting(false);
    }
  };

  const handleNextStep1 = () => {
    if (!category || !description) {
      setError('Please select a category and fill in the description.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!location) {
      setError('Please input a location landmark or address.');
      return;
    }
    setError('');
    setStep(3);
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {success ? (
        <div className="report-success animate-fade-in">
          <CheckCircle size={56} style={{ color: 'var(--status-resolved)' }} />
          <h3>Complaint Filed Successfully!</h3>
          <p>Redirecting you to track its resolution timeline...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header titles */}
          <div className="report-header-stitch">
            <h1 className="report-title-stitch">Report an Issue</h1>
            <p className="report-sub-stitch">Help us improve your city. Document the problem below, and we'll route it to the correct department immediately.</p>
          </div>

          {/* Step indicators row */}
          <div className="step-indicators-row-stitch">
            <button className={`step-btn-stitch ${step === 1 ? 'active' : ''}`} onClick={() => step > 1 && setStep(1)}>
              1. Details
            </button>
            <button className={`step-btn-stitch ${step === 2 ? 'active' : ''}`} onClick={() => step > 2 && setStep(2)}>
              2. Location
            </button>
            <button className={`step-btn-stitch ${step === 3 ? 'active' : ''}`}>
              3. Review
            </button>
          </div>

          {error && (
            <div className="form-error-banner animate-fade-in">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Step Contents */}
          {step === 1 && (
            <div className="form-step-container animate-fade-in">
              {/* Category card */}
              <div className="form-input-card-stitch">
                <label className="input-card-label">Issue Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description card */}
              <div className="form-input-card-stitch">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="input-card-label" style={{ marginBottom: 0 }}>Description</label>
                  <button type="button" className="btn-ai-spark-stitch" onClick={handleAIAnalyze} disabled={aiAnalyzing || !description}>
                    <Sparkles size={12} />
                    <span>{aiAnalyzing ? 'Analyzing...' : 'AI Analyze'}</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  placeholder="Describe the issue in detail (e.g., specific landmark, size of pothole)..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* AI results if compiled */}
              {aiAnalyzing && (
                <div className="ai-shimmer-card">
                  <div className="shimmer-bar header" />
                  <div className="shimmer-bar text" />
                </div>
              )}

              {aiSummary && (
                <div className="ai-preview-card animate-fade-in">
                  <div className="ai-preview-header">
                    <Sparkles size={14} />
                    <span>AI Classification Recommendations</span>
                  </div>
                  <div className="ai-preview-grid">
                    <div className="preview-item">
                      <span className="p-label">Department:</span>
                      <span className="p-val">{aiSummary.recommendedDepartment}</span>
                    </div>
                    <div className="preview-item">
                      <span className="p-label">Detected Priority:</span>
                      <span className="p-val" style={{ color: 'var(--priority-high)' }}>{aiSummary.priority}</span>
                    </div>
                    <div className="preview-item full">
                      <span className="p-label">Summary:</span>
                      <p className="p-summary">"{aiSummary.summary}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload evidence card */}
              <div className="form-input-card-stitch">
                <label className="input-card-label">Upload Evidence</label>
                
                <div className="upload-options-grid-stitch">
                  <input
                    type="file"
                    id="camera-up"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="camera-up" className="upload-box-stitch">
                    <Camera size={22} style={{ color: 'var(--primary)' }} />
                    <span className="box-title">Open Camera</span>
                  </label>

                  <input
                    type="file"
                    id="gallery-up"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="gallery-up" className="upload-box-stitch">
                    <ImageIcon size={22} style={{ color: '#10B981' }} />
                    <span className="box-title">From Gallery</span>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="uploaded-thumbnails-row-stitch">
                    {images.map((img, idx) => (
                      <div key={idx} className="thumb-item-stitch">
                        <img src={img} alt="Evidence" />
                        <button type="button" className="btn-thumb-remove" onClick={() => removeImage(idx)}>
                          &times;
                        </button>
                      </div>
                    ))}
                    <label htmlFor="gallery-up" className="thumb-add-box-stitch">
                      <Plus size={20} />
                    </label>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="step-actions-footer">
                <button type="button" className="btn btn-outline" onClick={() => router.push('/citizen/dashboard')}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNextStep1}>
                  <span>Next: Location</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step-container animate-fade-in">
              {/* Location search card */}
              <div className="form-input-card-stitch">
                <label className="input-card-label">Location Selection</label>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <div className="input-icon-wrapper" style={{ flex: 1 }}>
                    <MapPin className="input-icon" size={16} />
                    <input
                      type="text"
                      placeholder="Enter address or landmark (e.g., Outside 142 Pine St)..."
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      style={{ paddingLeft: '40px' }}
                      required
                    />
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={handleGPSLocation} style={{ gap: '6px' }}>
                    <Compass size={16} />
                    <span>GPS</span>
                  </button>
                </div>
              </div>

              {/* Mock map selection container */}
              <div className="form-input-card-stitch">
                <label className="input-card-label">Map Picker coordinates</label>
                <div className="map-picker-canvas-stitch">
                  <div className="mock-map-marker blue-marker" style={{ top: '48%', left: '50%' }}>
                    <span className="marker-dot-center" />
                  </div>
                  <span className="map-picker-coordinates">
                    Pin positioned at SF Area ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="step-actions-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} style={{ gap: '6px' }}>
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={handleNextStep2}>
                  <span>Next: Review</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step-container animate-fade-in">
              {/* Review summary card */}
              <div className="form-input-card-stitch">
                <label className="input-card-label">Review Submission Details</label>
                
                <div className="review-summary-details">
                  <div className="review-meta-row">
                    <span className="r-label">Category:</span>
                    <span className="r-val">{category}</span>
                  </div>

                  <div className="review-meta-row">
                    <span className="r-label">Description:</span>
                    <span className="r-val" style={{ whiteSpace: 'pre-wrap' }}>{description}</span>
                  </div>

                  <div className="review-meta-row">
                    <span className="r-label">Location Landmark:</span>
                    <span className="r-val">{location}</span>
                  </div>

                  <div className="review-meta-row">
                    <span className="r-label">Estimated Routing:</span>
                    <span className="r-val">
                      {aiSummary ? aiSummary.recommendedDepartment : 'Auto-routes to department based on category'}
                    </span>
                  </div>

                  {images.length > 0 && (
                    <div className="review-meta-row" style={{ flexDirection: 'column', gap: '8px' }}>
                      <span className="r-label">Attached Evidence:</span>
                      <div className="review-previews-row">
                        {images.map((img, idx) => (
                          <div key={idx} className="review-thumb">
                            <img src={img} alt="review" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact number details */}
              <div className="form-input-card-stitch">
                <label htmlFor="phone-contact" className="input-card-label">Contact phone for updates</label>
                <input
                  type="text"
                  id="phone-contact"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+1 555-0100"
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="step-actions-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)} style={{ gap: '6px' }}>
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                  <span>{submitting ? 'Filing Grievance...' : 'Submit Complaint'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .report-header-stitch {
          margin-bottom: 4px;
        }

        .report-title-stitch {
          font-size: 26px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.02em;
        }

        .report-sub-stitch {
          font-size: 14px;
          color: var(--muted);
          margin-top: 4px;
          line-height: 1.5;
        }

        /* Step Buttons */
        .step-indicators-row-stitch {
          display: flex;
          background-color: #F1F5F9;
          padding: 4px;
          border-radius: var(--radius-md);
          gap: 4px;
        }

        .step-btn-stitch {
          flex: 1;
          background: none;
          border: none;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .step-btn-stitch.active {
          background-color: var(--primary);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .form-step-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-input-card-stitch {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-card-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 2px;
        }

        .btn-ai-spark-stitch {
          background-color: var(--primary-light);
          color: var(--primary);
          border: 1px solid rgba(22, 93, 255, 0.12);
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 11.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }

        .btn-ai-spark-stitch:hover:not(:disabled) {
          background-color: var(--primary);
          color: white;
        }

        /* Upload grids */
        .upload-options-grid-stitch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 4px;
        }

        .upload-box-stitch {
          border: 1.5px dashed var(--card-border);
          border-radius: var(--radius-md);
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          background-color: #F8FAFC;
          transition: all var(--transition-fast);
        }

        .upload-box-stitch:hover {
          border-color: var(--primary);
          background-color: var(--card-hover);
        }

        .box-title {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--foreground);
        }

        /* Thumbnails styling */
        .uploaded-thumbnails-row-stitch {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .thumb-item-stitch {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          position: relative;
          border: 1px solid var(--card-border);
        }

        .thumb-item-stitch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-thumb-remove {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 16px;
          height: 16px;
          border-radius: var(--radius-full);
          background-color: rgba(0,0,0,0.6);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-thumb-remove:hover {
          background-color: var(--priority-high);
        }

        .thumb-add-box-stitch {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-sm);
          border: 1.5px dashed var(--card-border);
          background-color: #F8FAFC;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--muted);
          transition: all var(--transition-fast);
        }

        .thumb-add-box-stitch:hover {
          border-color: var(--primary);
          background-color: var(--card-hover);
        }

        /* Map picker styles */
        .map-picker-canvas-stitch {
          height: 220px;
          background-color: #cbd5e1;
          border-radius: var(--radius-md);
          position: relative;
          overflow: hidden;
          border: 1px solid var(--card-border);
        }

        .mock-map-marker {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .blue-marker { background-color: #165DFF; }

        .marker-dot-center {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background-color: white;
        }

        .map-picker-coordinates {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background-color: rgba(0,0,0,0.65);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        /* Review summary lists */
        .review-summary-details {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .review-meta-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-bottom: 1px solid #F1F5F9;
          padding-bottom: 12px;
        }

        .review-meta-row:last-child {
          border-bottom: none;
        }

        .r-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
        }

        .r-val {
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
        }

        .review-previews-row {
          display: flex;
          gap: 10px;
        }

        .review-thumb {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 1px solid var(--card-border);
        }

        .review-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .step-actions-footer {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          border-top: 1px solid var(--card-border);
          padding-top: 20px;
          margin-top: 10px;
        }

        .report-success {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 16px;
          box-shadow: var(--shadow-lg);
        }

        .form-error-banner {
          background-color: var(--priority-high-bg);
          color: var(--priority-high);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 600;
        }

        .input-icon-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }

        /* AI preview details */
        .ai-preview-card {
          background-color: rgba(22, 93, 255, 0.03);
          border: 1px dashed rgba(22, 93, 255, 0.25);
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .ai-preview-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
        }

        .ai-preview-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preview-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .p-label {
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
        }

        .p-val {
          font-size: 13px;
          font-weight: 700;
          color: var(--foreground);
        }

        .p-summary {
          font-size: 13px;
          font-style: italic;
          color: var(--foreground);
        }
      `}</style>
    </div>
  );
}
