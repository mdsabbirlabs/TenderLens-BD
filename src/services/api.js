
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const apiError = new Error(
        error.response.data?.message ||
        "Server error occurred."
      );

      // Preserve HTTP status code
      apiError.status = error.response.status;

      return Promise.reject(apiError);
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timed out. Please try again.")
      );
    }

    return Promise.reject(
      new Error("Unable to connect to the server.")
    );
  }
);


// Upload multiple PDFs as one tender
export async function uploadTender(files, onProgress) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(
    "/api/tenders/upload-multiple",
    formData,
    {
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          const percent = Math.round(
            (event.loaded * 100) / event.total
          );

          onProgress(percent);
        }
      },
    }
  );

  return response.data;
}


// Get tender details
export async function getTender(id) {
  const response = await api.get(`/api/tenders/${id}`);
  return response.data;
}


// Analyze tender
export async function analyzeTender(id) {
  const response = await api.post(
    `/api/tenders/${id}/analyze`,
    {},
    { timeout: 600000 }
  );

  return response.data;
}


// Get analysis results
export async function getAnalysisResults(id) {
  const response = await api.get(
    `/api/tenders/${id}/results`
  );

  return response.data;
}


// Get tender evidence
export async function getTenderEvidence(id) {
  const response = await api.get(
    `/api/tenders/${id}/evidence`
  );

  return response.data;
}


// Update evidence verification status
export async function updateEvidenceVerification(
  tenderId,
  evidenceId,
  verificationStatus
) {
  const response = await api.put(
    `/api/tenders/${tenderId}/evidence/${evidenceId}/verification`,
    {
      verificationStatus,
    }
  );

  return response.data;
}


// Get analysis history
export async function getAnalysisHistory() {
  const response = await api.get("/api/tenders/history");
  return response.data;
}

// Send message to TenderLens AI
export async function sendChatMessage(message, tenderId = null) {
  const response = await api.post("/api/chat", {
    message,
    tenderId,
  });

  return response.data;
}

export default api;
