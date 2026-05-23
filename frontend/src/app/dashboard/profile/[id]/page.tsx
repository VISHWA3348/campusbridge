import React from 'react';
import ProfileClient from './ProfileClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function PublicProfileView() {
  return <ProfileClient />;
}

