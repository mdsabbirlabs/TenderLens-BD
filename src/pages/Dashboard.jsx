
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PDFUploader from "../components/PDFUploader";
import { uploadTender } from "../services/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function Dashboard() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [platformStatus, setPlatformStatus] = useState("Checking");

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/tenders/history`,
          { method: "GET" }
        );

        if (isMounted) {
          setPlatformStatus(response.ok ? "Online" : "Offline");
        }
      } catch {
        if (isMounted) {
          setPlatformStatus("Offline");
        }
      }
    };

    checkBackend();

    const interval = setInterval(checkBackend, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStartAnalysis = async () => {
    if (!files.length || isUploading) return;

    setIsUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      const response = await uploadTender(files, setUploadProgress);
      const tenderId = response.id;

      if (!tenderId) {
        throw new Error("Backend did not return a Tender ID.");
      }

      const historyItem = {
        id: tenderId,
        name: files.map((file) => file.name).join(", "),
        date: new Date().toLocaleString(),
        status: "Uploaded",
        files: files.map((file) => file.name),
        totalPages: response.totalPages,
      };

      try {
        const previousHistory = JSON.parse(
          localStorage.getItem("tenderHistory") || "[]"
        );

        localStorage.setItem(
          "tenderHistory",
          JSON.stringify([historyItem, ...previousHistory])
        );
      } catch (historyError) {
        console.error("History save failed:", historyError);
      }

      navigate("/tender-details", {
        state: {
          tenderId,
          files: files.map((file) => ({
            name: file.name,
            size: file.size,
          })),
          uploadData: response,
        },
      });
    } catch (uploadError) {
      console.error("Upload failed:", uploadError);

      setError(
        uploadError.message ||
          "PDF upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="page-content dashboard-page">

      {/* HERO AND STATISTICS */}

      <div className="dashboard-main-header">

        <section className="dashboard-hero">
          <div className="dashboard-hero-content">

            <span className="hero-label">
              WELCOME TO TENDERLENS BD
            </span>

            <h2>Make Smarter Tender Decisions.</h2>

            <p>
              Understand tender requirements and discover better
              business opportunities with AI-powered analysis.
            </p>

          </div>

          <div className="dashboard-hero-icon">✦</div>
        </section>

        <div className="dashboard-stats">

          <div className="dashboard-stat">
            <span>Selected Documents</span>
            <strong>
              {String(files.length).padStart(2, "0")}
            </strong>
          </div>

          <div className="dashboard-stat">
            <span>Maximum Files</span>
            <strong>05</strong>
          </div>

          <div className="dashboard-stat">
            <span>Maximum Size</span>
            <strong>10 MB</strong>
          </div>

          <div className="dashboard-stat platform-stat">
            <span>Platform Status</span>

            <strong
              className={
                platformStatus === "Online"
                  ? "status-online"
                  : platformStatus === "Offline"
                  ? "status-offline"
                  : "status-checking"
              }
            >
              <i />
              {platformStatus}
            </strong>
          </div>

        </div>
      </div>

      {/* DOCUMENT UPLOAD */}

      <section className="dashboard-panel">

        <div className="dashboard-section-heading">
          <div>
            <span className="section-label">
              DOCUMENT MANAGEMENT
            </span>

            <h2>Upload Tender Documents</h2>

            <p>
              Select your tender PDF files to start AI-powered analysis.
            </p>
          </div>

          <span className="section-step">STEP 01</span>
        </div>

        <div className="dashboard-upload-area">
          <PDFUploader onFilesChange={setFiles} />
        </div>

        {error && (
          <div className="upload-error dashboard-error">
            {error}
          </div>
        )}

        {isUploading && (
          <div className="dashboard-progress">
            <div className="progress-heading">
              <span>Uploading documents...</span>
              <strong>{uploadProgress}%</strong>
            </div>

            <progress value={uploadProgress} max="100">
              {uploadProgress}%
            </progress>

            <p>Please wait. Do not close this page.</p>
          </div>
        )}

        <div className="dashboard-upload-footer">
          <p>
            <span>✓</span>
            Secure document upload
            <span>·</span>
            AI-powered analysis
          </p>

          <button
            type="button"
            className="primary-btn dashboard-continue-btn"
            disabled={files.length === 0 || isUploading}
            onClick={handleStartAnalysis}
          >
            {isUploading
              ? `Uploading... ${uploadProgress}%`
              : "Continue to Tender Details →"}
          </button>
        </div>

      </section>

      

      {/* FOOTER */}

      <footer className="dashboard-footer">
        <span>© 2026 TenderLens BD.</span>
        <span>Built for smarter tender decisions.</span>
      </footer>

    </div>
  );
}

export default Dashboard;
