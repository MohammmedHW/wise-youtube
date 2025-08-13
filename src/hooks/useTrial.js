import { useState, useEffect } from 'react';

export const useTrial = () => {
  const [trialStatus, setTrialStatus] = useState({
    isActive: true,      // always active
    daysRemaining: 9999, // arbitrary large number
    expiryDate: null,    // no expiry
  });
  const [loading, setLoading] = useState(false);

  const checkTrialStatus = async () => {
    // Bypass any API calls and just set trial as active
    setLoading(false);
    setTrialStatus({
      isActive: true,
      daysRemaining: 9999,
      expiryDate: null,
    });
  };

  // Run once on mount
  useEffect(() => {
    checkTrialStatus();
  }, []);

  return { trialStatus, loading, checkTrialStatus };
};
