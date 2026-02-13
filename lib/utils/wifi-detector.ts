/**
 * WiFi Detection Utility
 * Detects when user connects to WiFi
 */

export function isConnectedToWiFi(): boolean {
  try {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (!connection) {
      // Fallback: assume connected if connection API not available
      return true;
    }
    return connection.type === 'wifi' || connection.effectiveType === '4g';
  } catch (error) {
    console.error('[v0] Error checking WiFi connection:', error);
    return true;
  }
}

/**
 * Monitor WiFi connection changes
 */
export function onConnectionChange(callback: (isConnected: boolean) => void): () => void {
  try {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) {
      // Connection API not supported
      return () => {};
    }

    const handleChange = () => {
      const isWiFi = isConnectedToWiFi();
      callback(isWiFi);
    };

    connection.addEventListener('change', handleChange);

    return () => {
      connection.removeEventListener('change', handleChange);
    };
  } catch (error) {
    console.error('[v0] Error monitoring WiFi connection:', error);
    return () => {};
  }
}
