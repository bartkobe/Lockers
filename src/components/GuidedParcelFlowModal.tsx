import React, { useState, useEffect } from 'react';

// Parcel statuses
const PARCEL_STATUSES = [
  'Avizo', 'Claimed', 'Created', 'CustomerDelivering', 'CustomerSent', 'Delivered',
  'DeliveredToAgency', 'DeliveredToSortingCenter', 'Expired', 'HomeDelivering', 'InTransit',
  'LabelDestroyed', 'LabelExpired', 'Missing', 'NotDelivered', 'PayForParcels',
  'ReturnedToAgency', 'ReturnedToSender', 'ReturnedToSortingCenter', 'Sent',
  'CustomerStored', 'Stored', 'Prepared', 'Oversized'
];

// Example flows (can be extended)
const FLOW_CATEGORIES = [
  {
    category: 'Label refresh (Customer)',
    flows: [
      ['CustomerStored', 'Delivered', 'Missing', 'LabelExpired', 'CustomerDelivering'],
      ['LabelExpired', 'CustomerDelivering']
    ]
  },
  {
    category: 'Store again (Courier)',
    flows: [
      ['Stored', 'Expired', 'ReturnedToAgency', 'InTransit'],
      ['Avizo', 'Expired', 'ReturnedToAgency', 'InTransit'],
      ['Stored', 'Delivered', 'Missing', 'InTransit'],
      ['Avizo', 'Delivered', 'Missing', 'InTransit'],
      ['Missing', 'InTransit'],
      ['DeliveredToAgency', 'Delivered', 'Missing', 'InTransit'],
      ['Prepared', 'Sent', 'InTransit'],
      ['Sent', 'InTransit']
    ]
  },
  {
    category: 'Issue with storing again (Courier)',
    flows: [
      ['InTransit', 'Delivered', 'Missing', 'InTransit']
    ]
  },
  {
    category: 'Accidentally marked oversized (Courier)',
    flows: [
      ['Oversized', 'Delivered', 'Missing', 'InTransit']
    ]
  },
  {
    category: 'Lost base box machine',
    flows: [
      ['CustomerStored', 'Delivered', 'Missing'],
      ['Stored', 'Delivered', 'Missing'],
      ['Avizo', 'Delivered', 'Missing']
    ]
  }
];

const REASONS = [
  'Customer mistake',
  'Courier mistake',
  'Technical issue',
  'Other'
];

interface GuidedParcelFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteStep: (status: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  initialStatus: string;
}

const GuidedParcelFlowModal: React.FC<GuidedParcelFlowModalProps> = ({ isOpen, onClose, onExecuteStep, initialStatus }) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedFlow, setSelectedFlow] = useState(0);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<{ step: number; status: string; message: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Get the current flow steps
  const flowSteps = FLOW_CATEGORIES[selectedCategory].flows[selectedFlow];

  // Find the starting step based on initialStatus
  useEffect(() => {
    if (!isOpen) return;
    setCompleted(false);
    setError(null);
    setCurrentStep(Math.max(0, flowSteps.indexOf(initialStatus)));
    setInProgress(false);
    setReason('');
    setOtherReason('');
  }, [isOpen, selectedCategory, selectedFlow, initialStatus]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const canStart = reason && (reason !== 'Other' || otherReason.trim());

  const handleStart = async () => {
    setInProgress(true);
    setError(null);
    setCompleted(false);
    let step = currentStep;
    for (; step < flowSteps.length; step++) {
      setCurrentStep(step);
      const res = await onExecuteStep(flowSteps[step], reason === 'Other' ? otherReason : reason);
      if (!res.success) {
        setError({ step, status: flowSteps[step], message: res.error || 'Unknown error' });
        setInProgress(false);
        return;
      }
    }
    setInProgress(false);
    setCompleted(true);
  };

  const handleRetry = () => {
    if (error) {
      setCurrentStep(error.step);
      setError(null);
      setInProgress(true);
      handleStart();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>
          Guided Parcel Flow
          <span className="modal-shortcut">ESC to close</span>
        </h2>
        <div className="modal-body">
          {/* Category and Flow selection */}
          <div className="form-group">
            <label>Flow Category</label>
            <select className="form-control" value={selectedCategory} onChange={e => { setSelectedCategory(Number(e.target.value)); setSelectedFlow(0); }}>
              {FLOW_CATEGORIES.map((cat, idx) => (
                <option key={cat.category} value={idx}>{cat.category}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Flow</label>
            <select className="form-control" value={selectedFlow} onChange={e => setSelectedFlow(Number(e.target.value))}>
              {FLOW_CATEGORIES[selectedCategory].flows.map((flow, idx) => (
                <option key={flow.join('>')} value={idx}>{flow.join(' > ')}</option>
              ))}
            </select>
          </div>
          {/* Reason selection */}
          <div className="form-group">
            <label>Reason for status change <span style={{ color: 'red' }}>*</span></label>
            {REASONS.map(r => (
              <div key={r} style={{ marginBottom: 4 }}>
                <label>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />{' '}{r}
                </label>
                {r === 'Other' && reason === 'Other' && (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter reason"
                    value={otherReason}
                    onChange={e => setOtherReason(e.target.value)}
                    style={{ marginLeft: 8, marginTop: 4 }}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Progress and error/success feedback */}
          {inProgress && !error && !completed && (
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <div className="spinner" style={{ marginBottom: 12 }} />
              <p>Transition in progress…</p>
            </div>
          )}
          {completed && (
            <div style={{ textAlign: 'center', color: 'green', margin: '24px 0' }}>
              <b>Flow completed successfully!</b>
            </div>
          )}
          {error && (
            <div style={{ textAlign: 'center', color: 'red', margin: '24px 0' }}>
              <b>Error: Could not set status to {error.status}.</b><br />
              The flow stopped at step {error.step + 1} of {flowSteps.length}.
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={handleRetry}>Retry step</button>
                <button className="btn btn-secondary" onClick={onClose} style={{ marginLeft: 8 }}>Handle manually</button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={inProgress}>Cancel</button>
          {!inProgress && !completed && !error && (
            <button className="btn btn-primary" onClick={handleStart} disabled={!canStart}>Start Flow</button>
          )}
          {completed && (
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedParcelFlowModal; 