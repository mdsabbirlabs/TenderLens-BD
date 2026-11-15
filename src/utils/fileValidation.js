
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

export function validatePDF(file) {
  if (!file) {
    return "Please select a file.";
  }

  const isPDF =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPDF) {
    return "Only PDF files are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size must not exceed 10 MB.";
  }

  if (file.size === 0) {
    return "This file is empty.";
  }

  return null;
}

export function validateFileCount(current, incoming) {
  if (current + incoming > MAX_FILES) {
    return `You can upload a maximum of ${MAX_FILES} PDF files.`;
  }

  return null;
}

export { MAX_FILE_SIZE, MAX_FILES };
