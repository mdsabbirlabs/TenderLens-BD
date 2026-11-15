
import { useLocation, useNavigate } from "react-router-dom";

function TenderDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const files = location.state?.files || [];
  const tenderId = location.state?.tenderId || "Not available";
  const uploadData = location.state?.uploadData || {};

  return (
    <div className="page-content">

      <div className="page-header">
        <div>
          <span className="eyebrow">TENDER MANAGEMENT</span>
          <h1>Tender Details</h1>
          <p>Review your tender information.</p>
        </div>
      </div>

      <div className="details-card">
        <h2>Uploaded Documents</h2>

        {files.length > 0 ? (
          files.map((item, index) => (
            <div className="file-item" key={index}>
              <div className="file-info">
                <span className="file-icon">PDF</span>
                <div>
                  <strong>{item.name}</strong>
                  <small>
                    {(item.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No documents received. Please upload PDFs first.</p>
        )}
      </div>

      <div className="details-card">
        <h2>Tender Information</h2>

        <p className="info-note">
          Basic information received from the backend.
        </p>

        <div className="details-grid">
          <div>
            <label>Tender Name</label>
            <input value={files.map(file => file.name).join(", ")} disabled />
          </div>

          <div>
            <label>Tender ID</label>
            <input value={tenderId} disabled />
          </div>

          <div>
            <label>Total Documents</label>
            <input value={uploadData.totalFiles ?? files.length} disabled />
          </div>

          <div>
            <label>Total Pages</label>
            <input value={uploadData.totalPages ?? "Not available"} disabled />
          </div>

          <div>
            <label>Organization</label>
            <input value="Awaiting AI analysis" disabled />
          </div>

          <div>
            <label>Submission Deadline</label>
            <input value="Awaiting AI analysis" disabled />
          </div>
        </div>
      </div>

      <div className="action-row">
        <button
          className="secondary-btn"
          onClick={() => navigate("/")}
        >
          Back to Dashboard
        </button>

        <button
          className="primary-btn"
          disabled={!files.length || tenderId === "Not available"}
          onClick={() =>
            navigate("/analysis-results", {
              state: { tenderId },
            })
          }
        >
          Preview Analysis Page →
        </button>
      </div>

    </div>
  );
}

export default TenderDetails;
