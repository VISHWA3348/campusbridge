import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a secure, formatted invite code.
 * Format: [COLLEGE]-[DEPT/ROLE]-[YEAR]-[RANDOM]
 * Example: ABC-CSE-2026-X7A92
 */
export const generateInviteCodeString = (collegeCode, subIdentifier, year) => {
  const randomPart = uuidv4().split('-')[0].substring(0, 5).toUpperCase();
  const collegePart = (collegeCode || 'CB').toUpperCase();
  const subPart = (subIdentifier || 'GEN').toUpperCase();
  const yearPart = year || new Date().getFullYear();

  return `${collegePart}-${subPart}-${yearPart}-${randomPart}`;
};
