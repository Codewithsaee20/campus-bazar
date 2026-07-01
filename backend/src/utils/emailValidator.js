// src/utils/emailValidator.js

const ALLOWED_DOMAINS = process.env.ALLOWED_COLLEGE_DOMAINS
  ?.split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean) || [];

const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS
  ?.split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean) || [];

const getDomainFromEmailInternal = (email) => {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1]?.toLowerCase().trim() || '';
};

const getMatchingAllowedDomain = (domain) => {
  if (!domain) return '';

  // Prefer exact/longest suffix match so subdomains map to the same college domain.
  const matches = ALLOWED_DOMAINS.filter(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  );

  if (matches.length === 0) return '';
  return matches.sort((a, b) => b.length - a.length)[0];
};

export function isCollegeEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const domain = getDomainFromEmailInternal(email);

  if (ALLOWED_EMAILS.includes(normalizedEmail)) return true;
  return Boolean(getMatchingAllowedDomain(domain));
}

export function getCollegeFromEmail(email) {
  const domain = getDomainFromEmailInternal(email);
  const canonicalAllowedDomain = getMatchingAllowedDomain(domain);

  if (canonicalAllowedDomain) return canonicalAllowedDomain;
  return domain;
}

export function getDomainFromEmail(email) {
  return getDomainFromEmailInternal(email);
}