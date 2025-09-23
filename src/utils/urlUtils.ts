/**
 * Utility functions for URL handling and validation
 */

/**
 * Formats a URL by adding https:// protocol if it doesn't already have one
 * @param url - The URL to format
 * @returns Formatted URL with protocol
 */
export const formatUrl = (url: string): string => {
  if (!url || url.trim() === '') {
    return '';
  }
  
  const trimmedUrl = url.trim();
  
  // If URL already has a protocol, return as is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Add https:// protocol
  return `https://${trimmedUrl}`;
};

/**
 * Validates if a string is a valid URL
 * @param url - The URL to validate
 * @returns True if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') {
    return false;
  }
  
  try {
    const formattedUrl = formatUrl(url);
    new URL(formattedUrl);
    return true;
  } catch {
    return false;
  }
};

/**
 * Formats all document URLs in an employee object
 * @param employee - The employee object to format
 * @returns Employee object with formatted URLs
 */
export const formatEmployeeDocumentUrls = (employee: any): any => {
  if (!employee.documents) {
    return employee;
  }

  const formattedDocuments = { ...employee.documents };

  // Format drive link
  if (formattedDocuments.driveLink) {
    formattedDocuments.driveLink = formatUrl(formattedDocuments.driveLink);
  }

  return {
    ...employee,
    documents: formattedDocuments
  };
};
