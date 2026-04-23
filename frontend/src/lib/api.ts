function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}
export interface DenoiseResponse {
  original_b64: string;
  noise_map_b64: string;
  unet_b64: string;
  enhanced_b64: string;
  routing_message: string;
  noise_variance: number;
  was_bypassed: boolean;
  width: number;
  height: number;
  processing_time_ms: number;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function denoiseImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<DenoiseResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${getApiUrl()}/api/denoise`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Denoising failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}