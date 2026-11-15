
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import React from "react";





import {
  analyzeTender,
  getAnalysisResults,
  getTenderEvidence,
  updateEvidenceVerification,
} from "../services/api";

function AnalysisResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const tenderId = location.state?.tenderId;
  const demo = location.state?.demo === true;

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
 
  const [analysisResult, setAnalysisResult] = useState("");
  const [error, setError] = useState("");

  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(true);
  const [evidenceError, setEvidenceError] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [savingEvidence, setSavingEvidence] = useState({});
  const [verificationErrors, setVerificationErrors] = useState({});

  const getErrorStatus = (err) => {
    return err.response?.status ?? err.status;
  };

  useEffect(() => {
    let active = true;

    const loadAnalysis = async () => {
      if (demo) {
        setLoading(false);
        setEvidenceLoading(false);
        return;
      }

      if (!tenderId) {
        setError("Tender ID not found. Please upload a tender first.");
        setLoading(false);
        setEvidenceLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setEvidenceLoading(true);
      setEvidenceError("");

      try {
        let response;

        try {
          response = await getAnalysisResults(tenderId);
        } catch (err) {
          if (getErrorStatus(err) !== 404) {
            throw err;
          }

          try {
            response = await analyzeTender(tenderId);
          } catch (analysisError) {
            if (getErrorStatus(analysisError) === 409) {
              response = await getAnalysisResults(tenderId);
            } else {
              throw analysisError;
            }
          }
        }

        if (active) {
          setAnalysisResult(response.analysisResult || "");
        }
      } catch (err) {
        if (active) {
          console.error("Analysis Loading Error:", err);

          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load the analysis report."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }

      try {
        const evidenceResponse = await getTenderEvidence(tenderId);

        if (active) {
          const loadedEvidence = Array.isArray(evidenceResponse.evidence)
            ? evidenceResponse.evidence
            : [];

          setEvidence(loadedEvidence);

          const initialStatuses = {};

          loadedEvidence.forEach((item) => {
            initialStatuses[item.id] =
              item.verificationStatus || "UNKNOWN";
          });

          setSelectedStatuses(initialStatuses);
        }
      } catch (err) {
        if (active) {
          console.error("Evidence Loading Error:", err);

          setEvidenceError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load tender evidence."
          );
        }
      } finally {
        if (active) {
          setEvidenceLoading(false);
        }
      }
    };

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [tenderId, demo]);


const handleDownloadClick = () => {
  window.print();
};

  const handleCopyTenderId = async () => {
  try {
    await navigator.clipboard.writeText(tenderId);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch (err) {
    console.error("Copy failed:", err);
  }
};

  const handleStatusChange = (evidenceId, newStatus) => {
    setSelectedStatuses((previous) => ({
      ...previous,
      [evidenceId]: newStatus,
    }));

    setVerificationErrors((previous) => ({
      ...previous,
      [evidenceId]: "",
    }));
  };

  const handleVerificationUpdate = async (item) => {
    const newStatus = selectedStatuses[item.id];

    if (!newStatus || newStatus === item.verificationStatus) {
      return;
    }

    setSavingEvidence((previous) => ({
      ...previous,
      [item.id]: true,
    }));

    setVerificationErrors((previous) => ({
      ...previous,
      [item.id]: "",
    }));

    try {
      const response = await updateEvidenceVerification(
        tenderId,
        item.id,
        newStatus
      );

      if (response.status !== "success" || !response.evidence) {
        throw new Error(
          response.message || "Unable to update verification status."
        );
      }

      setEvidence((previous) =>
        previous.map((evidenceItem) =>
          evidenceItem.id === item.id ? response.evidence : evidenceItem
        )
      );

      setSelectedStatuses((previous) => ({
        ...previous,
        [item.id]: response.evidence.verificationStatus,
      }));
    } catch (err) {
      setVerificationErrors((previous) => ({
        ...previous,
        [item.id]:
          err.response?.data?.message ||
          err.message ||
          "Failed to update verification status.",
      }));
    } finally {
      setSavingEvidence((previous) => ({
        ...previous,
        [item.id]: false,
      }));
    }
  };

  const projectSpecificEvidence = evidence.filter(
    (item) => item.evidenceType === "PROJECT_SPECIFIC"
  );

  const standardRuleEvidence = evidence.filter(
    (item) => item.evidenceType === "STANDARD_RULE"
  );

  const unknownEvidence = evidence.filter(
    (item) =>
      item.evidenceType !== "PROJECT_SPECIFIC" &&
      item.evidenceType !== "STANDARD_RULE"
  );

  const possibleDuplicateEvidence = evidence.filter(
    (item) => item.possibleDuplicate === true
  );

  const duplicateGroupCount = new Set(
    possibleDuplicateEvidence
      .map((item) => item.duplicateGroupId)
      .filter(Boolean)
  ).size;


const renderColoredReferences = (children) => {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      const pattern = /(\(\*?[^()\n]*(?:\.pdf|e-TD)[^()\n]*?\*?\))/gi;

      return child.split(pattern).map((part, index) => {
        if (!/^\(\*?[^()\n]*(?:\.pdf|e-TD)[^()\n]*?\*?\)$/i.test(part)) {
          return part;
        }

        const isStandard = /e-TD/i.test(part);

        return (
          <span
            key={index}
            className={
              isStandard
                ? "source-reference standard-reference"
                : "source-reference document-reference"
            }
          >
            {part}
          </span>
        );
      });
    }

    if (React.isValidElement(child) && child.props.children) {
      return React.cloneElement(child, {
        children: renderColoredReferences(child.props.children),
      });
    }

    return child;
  });
};

  const renderEvidenceCard = (item) => {
    const currentStatus = item.verificationStatus || "UNKNOWN";
    const selectedStatus = selectedStatuses[item.id] || currentStatus;
    const isSaving = savingEvidence[item.id] === true;
    const hasChanges = selectedStatus !== currentStatus;

    return (
      <article
        key={item.id}
        className={`evidence-card ${
          item.possibleDuplicate ? "duplicate-card" : ""
        }`}
      >
        <div className="evidence-card-header">
          <strong className="evidence-category">
            {item.category || "Uncategorized"}
          </strong>

          <div className="evidence-badges">
            {item.possibleDuplicate && (
              <span className="duplicate-badge">
                POSSIBLE DUPLICATE
              </span>
            )}

            <span
              className={`verification-badge status-${currentStatus.toLowerCase()}`}
            >
              {currentStatus}
            </span>
          </div>
        </div>

        <p className="evidence-finding">
          {item.finding || "No finding available."}
        </p>

        <div className="exact-value">
          <strong>Exact Value:</strong>{" "}
          {item.exactValue || "Not specified"}
        </div>

        <div className="verification-panel pdf-hide">
          <p className="verification-title">
            Update Verification Status
          </p>

          <div className="verification-controls">
            <select
              value={selectedStatus}
              disabled={isSaving}
              onChange={(e) =>
                handleStatusChange(item.id, e.target.value)
              }
            >
              <option value="VERIFIED">VERIFIED</option>
              <option value="UNVERIFIED">UNVERIFIED</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>

            <button
              className="primary-btn pdf-hide"
              disabled={!hasChanges || isSaving}
              onClick={() => handleVerificationUpdate(item)}
            >
              {isSaving ? "Saving..." : "Save Status"}
            </button>
          </div>

          {hasChanges && !isSaving && (
            <p className="unsaved-message">
              You have an unsaved status change.
            </p>
          )}

          {verificationErrors[item.id] && (
            <p className="verification-error">
              {verificationErrors[item.id]}
            </p>
          )}
        </div>

        {item.possibleDuplicate && (
          <div className="duplicate-info">
            <strong>Duplicate Detection Information</strong>

            {item.duplicateGroupId && (
              <p>
                <strong>Duplicate Group ID:</strong>{" "}
                {item.duplicateGroupId}
              </p>
            )}

            {item.duplicateReason && (
              <p>
                <strong>Reason:</strong> {item.duplicateReason}
              </p>
            )}
          </div>
        )}

        <div className="evidence-meta">
          <span>
            <strong>Page:</strong> {item.pageNumber ?? "N/A"}
          </span>

          <span>
            <strong>Clause:</strong> {item.clauseNumber || "N/A"}
          </span>
        </div>

        {item.sourceDocument && (
          <p className="evidence-source">
            <strong>Source:</strong> {item.sourceDocument}
          </p>
        )}
      </article>
    );
  };

  const renderEvidenceSection = (title, description, items) => (
    <section className="details-card evidence-section">
      <div className="evidence-section-heading">
        <h2>
          {title} <span>({items.length})</span>
        </h2>

        <p>{description}</p>
      </div>

      {items.length > 0 ? (
        <div className="evidence-list">
          {items.map(renderEvidenceCard)}
        </div>
      ) : (
        <p className="empty-evidence">
          No evidence found in this category.
        </p>
      )}
    </section>
  );

  return (
    <div className="page-content analysis-results-page">
      <header className="page-header">
        <div>
          <span className="eyebrow">SMART ANALYSIS</span>
          <h1>Analysis Results</h1>
          <p>AI-powered tender document analysis.</p>
        </div>

        <span className="sample-badge">
          {loading
            ? "LOADING..."
            : error
            ? "ANALYSIS FAILED"
            : demo
            ? "PREVIEW MODE"
            : "ANALYSIS COMPLETED"}
        </span>
      </header>

      {demo && (
        <div className="notice-card">
          <strong>Preview Mode</strong>
          <p>
            This is a UI preview. Open this page from an uploaded tender
            to run actual AI analysis.
          </p>
        </div>
      )}

      {loading && !demo && (
        <div className="notice-card">
          <h3>Loading Analysis Report</h3>
          <p>
            Checking your saved analysis report. If no previous report
            exists, a new AI analysis will start automatically.
          </p>
        </div>
      )}

      {error && (
        <div className="notice-card">
          <strong>Analysis Error</strong>
          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {!loading && !error && !demo && analysisResult && (
        <>
          
<div className="analysis-grid results-overview">

  <div className="analysis-card overview-status-card">
    <span>Analysis Status</span>
    <h3 className="online-text">Completed</h3>
    <p>Gemini AI analysis successful.</p>
  </div>

  <div className="analysis-card tender-id-card overview-tender-card">
    <div className="tender-id-heading">
      <span>Tender ID</span>

      <button
  type="button"
  className="copy-tender-btn pdf-hide"
  onClick={handleCopyTenderId}
  title="Copy Tender ID"
  aria-label="Copy Tender ID"
>
  {copied ? "✓" : "▢"}
</button>
    </div>

    <h3>{tenderId}</h3>

    <p>{copied ? "Copied successfully!" : "Backend tender reference."}</p>
  </div>

</div>


          <section className="details-card report-card pdf-report-only">
            <div className="report-heading">
  <div>
    <span className="eyebrow">AI GENERATED REPORT</span>
    <h2>AI Tender Analysis Report</h2>
  </div>

  <button
    type="button"
    className="primary-btn"
    onClick={handleDownloadClick}
  >
    ↓ Download PDF
  </button>
</div>

            
<div className="markdown-report">
  <ReactMarkdown
  components={{
    em: ({ children }) => {
      const text = String(children);

      if (text.includes(".pdf")) {
        return <span className="source-reference document-reference">{children}</span>;
      }

      if (text.includes("e-TD")) {
        return <span className="source-reference standard-reference">{children}</span>;
      }

      return <em>{children}</em>;
    },
  }}
>
  {analysisResult}
</ReactMarkdown>
</div>

          </section>

          <section className="evidence-analysis">
            <div className="evidence-main-heading">
              <span className="eyebrow">EVIDENCE ANALYSIS</span>
              <h2>Tender Evidence Classification</h2>
              <p>
                Evidence extracted from the tender document, separated
                by evidence type and verification status.
              </p>
            </div>

            {evidenceLoading && (
              <div className="notice-card">
                <h3>Loading Tender Evidence</h3>
                <p>Fetching evidence from the backend.</p>
              </div>
            )}

            {evidenceError && (
              <div className="notice-card">
                <strong>Evidence Loading Error</strong>
                <p>{evidenceError}</p>
              </div>
            )}

            {!evidenceLoading && !evidenceError && (
              <>
                <div className="analysis-grid evidence-summary-grid">
                  <div className="analysis-card">
                    <span>Total Evidence</span>
                    <h3>{evidence.length}</h3>
                  </div>

                  <div className="analysis-card">
                    <span>Project-Specific</span>
                    <h3>{projectSpecificEvidence.length}</h3>
                  </div>

                  <div className="analysis-card">
                    <span>Standard Rules</span>
                    <h3>{standardRuleEvidence.length}</h3>
                  </div>

                  <div className="analysis-card">
                    <span>Unclassified</span>
                    <h3>{unknownEvidence.length}</h3>
                  </div>

                  <div className="analysis-card">
                    <span>Possible Duplicates</span>
                    <h3 className={possibleDuplicateEvidence.length > 0 ? "duplicate-count" : ""}>
                      {possibleDuplicateEvidence.length}
                    </h3>
                    <p>{duplicateGroupCount} duplicate group(s) detected.</p>
                  </div>
                </div>

                {possibleDuplicateEvidence.length > 0 && (
                  <div className="notice-card duplicate-notice">
                    <strong>Possible Duplicates Detected</strong>
                    <p>
                      The system found {possibleDuplicateEvidence.length}
                      {" "}evidence record(s) that may contain repeated
                      information. These records have been kept and
                      marked for review. No evidence has been deleted
                      or merged.
                    </p>
                  </div>
                )}

                {renderEvidenceSection(
                  "Project-Specific Information",
                  "Information identified as specific to this tender project.",
                  projectSpecificEvidence
                )}

                {renderEvidenceSection(
                  "Standard e-GP Rules",
                  "Standard clauses, template instructions and general procurement rules.",
                  standardRuleEvidence
                )}

                {renderEvidenceSection(
                  "Unclassified Evidence",
                  "Evidence that has not yet been classified into a specific category.",
                  unknownEvidence
                )}
              </>
            )}
          </section>
        </>
      )}

      {!loading && !error && !demo && !analysisResult && (
        <div className="notice-card">
          <strong>No Analysis Report</strong>
          <p>The backend did not return an analysis report.</p>
        </div>
      )}

      <div className="action-row results-action-row pdf-hide">
        <button
          className="secondary-btn"
          onClick={() => navigate("/tender-details")}
        >
          ← Tender Details
        </button>

        <button
          className="primary-btn"
          onClick={() => navigate("/history")}
        >
          Analysis History →
        </button>
      </div>
    </div>
  );
}

export default AnalysisResults;
