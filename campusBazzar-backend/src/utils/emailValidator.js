// src/utils/emailValidator.js

const ALLOWED_DOMAINS = process.env.ALLOWED_COLLEGE_DOMAINS?.split(',').map(d => d.trim().toLowerCase()) || [];
console.log('ALLOWED_DOMAINS ENV:', process.env.ALLOWED_COLLEGE_DOMAINS);

export function isCollegeEmail(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return ALLOWED_DOMAINS.includes(domain);
}

export function getCollegeFromEmail(email) {
  if (!email || !email.includes('@')) return '';
  const domain = email.split('@')[1]?.toLowerCase().trim();
  // vcet.edu.in → vcet
  return domain?.split('.')[0] || '';
}

export function getDomainFromEmail(email) {
  if (!email || !email.includes('@')) return '';
  // student@vcet.edu.in → vcet.edu.in
  return email.split('@')[1]?.toLowerCase().trim() || '';
}