/**
 * Utility function to download PDF files from binary data
 * @param data - ArrayBuffer containing PDF data
 * @param filename - Name for the downloaded file
 */
export const downloadPDF = (data: ArrayBuffer, filename: string): void => {
  try {
    // Create blob from array buffer
    const blob = new Blob([data], { type: 'application/pdf' });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF file');
  }
};

/**
 * Utility function to open PDF in new tab
 * @param data - ArrayBuffer containing PDF data
 */
export const openPDFInNewTab = (data: ArrayBuffer): void => {
  try {
    // Create blob from array buffer
    const blob = new Blob([data], { type: 'application/pdf' });
    
    // Create URL and open in new tab
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Cleanup URL after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('Error opening PDF:', error);
    throw new Error('Failed to open PDF file');
  }
};
