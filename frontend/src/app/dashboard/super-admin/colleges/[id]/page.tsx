import React from 'react';
import CollegeClient from './CollegeClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function CollegeDetailsPage() {
  return <CollegeClient />;
}
