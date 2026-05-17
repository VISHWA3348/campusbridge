'use client';

import React, { useEffect, useState } from 'react';
import { fetchFeatures } from '@/lib/api';

interface FeatureGateProps {
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureGate({ featureName, children, fallback = null }: FeatureGateProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFeature = async () => {
      try {
        const features = await fetchFeatures();
        const feature = features.find((f: any) => f.featureName === featureName);
        setEnabled(feature ? feature.enabled : true); // Default to true if not found
      } catch (error) {
        console.error(`Error checking feature ${featureName}:`, error);
        setEnabled(true);
      }
    };
    checkFeature();
  }, [featureName]);

  if (enabled === null) return null; // Or a skeleton
  if (!enabled) return <>{fallback}</>;

  return <>{children}</>;
}
