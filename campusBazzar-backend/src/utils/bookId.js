import crypto from "node:crypto";

const normalizeField = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const generateBookId = (isbn, title, subject, dept, college) => {
  if (isbn && String(isbn).trim() !== "") {
    return String(isbn).trim().toLowerCase();
  }

  const normalizedTitle = normalizeField(title);
  const normalizedSubject = normalizeField(subject);
  const normalizedDept = normalizeField(dept);
  const normalizedCollege = normalizeField(college);

  const hash = crypto
    .createHash("sha256")
    .update(normalizedTitle + normalizedSubject + normalizedDept + normalizedCollege)
    .digest("hex");

  return "book_" + hash.slice(0, 16);
};

export { generateBookId };