import html2canvas from 'html2canvas';

export interface ChartToImageOptions {
  quality?: number;
  format?: 'png' | 'jpeg';
  width?: number;
  height?: number;
  backgroundColor?: string;
}

/**
 * Convert a chart element to an image
 * @param elementId - ID of the element to convert
 * @param options - Image generation options
 * @returns Promise with the image blob
 */
export async function chartToImage(
  elementId: string,
  options: ChartToImageOptions = {}
): Promise<Blob> {
  const {
    quality = 0.95,
    format = 'png',
    width,
    height,
    backgroundColor = '#0f0c29'
  } = options;

  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with ID "${elementId}" not found`);
  }

  try {
    // Generate canvas from element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width,
      height
    });

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  } catch (error) {
    console.error('Error generating chart image:', error);
    throw error;
  }
}

/**
 * Download chart as image file
 * @param elementId - ID of the element to convert
 * @param filename - Name of the file to download
 * @param options - Image generation options
 */
export async function downloadChartImage(
  elementId: string,
  filename: string = 'human-design-chart',
  options: ChartToImageOptions = {}
): Promise<void> {
  try {
    const blob = await chartToImage(elementId, options);
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${options.format || 'png'}`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading chart image:', error);
    throw error;
  }
}

/**
 * Share chart image via Web Share API
 * @param elementId - ID of the element to convert
 * @param title - Title for the share
 * @param options - Image generation options
 */
export async function shareChartImage(
  elementId: string,
  title: string = 'Mein Human Design Chart',
  options: ChartToImageOptions = {}
): Promise<void> {
  if (!navigator.share) {
    throw new Error('Web Share API is not supported');
  }

  try {
    const blob = await chartToImage(elementId, options);
    const file = new File([blob], 'chart.png', { type: 'image/png' });

    await navigator.share({
      title,
      files: [file]
    });
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing chart image:', error);
      throw error;
    }
  }
}

