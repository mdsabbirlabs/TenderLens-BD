
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAnalysisHistory } from "../services/api";

const RECORDS_PER_PAGE = 5;

function AnalysisHistory() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Separate pagination for both sections
  const [completedPage, setCompletedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAnalysisHistory();

        const records = response.map((item) => ({
          id: item.id,
          name: item.fileName,
          date: item.uploadedAt,
          totalPages: item.pageCount,
          analysisStatus: item.analysisStatus,
        }));

        // Show newest records first
        records.sort((a, b) => {
          return (
            new Date(b.date || 0).getTime() -
            new Date(a.date || 0).getTime()
          );
        });

        setHistory(records);
      } catch (err) {
        setError(
          err.message || "Unable to load tender history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Check whether analysis is completed
  const isAnalysisCompleted = (status) => {
    return (
      status?.toLowerCase().includes("completed") ||
      status?.toLowerCase().includes("complete")
    );
  };

  // Separate records into two sections
  const completedRecords = history.filter((item) =>
    isAnalysisCompleted(item.analysisStatus)
  );

  const pendingRecords = history.filter(
    (item) => !isAnalysisCompleted(item.analysisStatus)
  );

  // Pagination calculation
  const getPaginatedRecords = (records, currentPage) => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

    return records.slice(
      startIndex,
      startIndex + RECORDS_PER_PAGE
    );
  };

  const getTotalPages = (records) => {
    return Math.max(
      1,
      Math.ceil(records.length / RECORDS_PER_PAGE)
    );
  };

  const completedTotalPages = getTotalPages(completedRecords);
  const pendingTotalPages = getTotalPages(pendingRecords);

  const visibleCompletedRecords = getPaginatedRecords(
    completedRecords,
    completedPage
  );

  const visiblePendingRecords = getPaginatedRecords(
    pendingRecords,
    pendingPage
  );

  // Pagination controls
  const renderPagination = (
    currentPage,
    totalPages,
    onPrevious,
    onNext
  ) => {
    return (
      <div className="history-pagination">

        <button
          type="button"
          className="secondary-btn pagination-btn"
          disabled={currentPage === 1}
          onClick={onPrevious}
        >
          ← Previous
        </button>

        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          className="secondary-btn pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={onNext}
        >
          Next →
        </button>

      </div>
    );
  };

  // Render individual history records
  const renderHistoryRecords = (records, isCompleted) => {
    if (records.length === 0) {
      return (
        <div className="empty-state history-empty">
          <h3>
            {isCompleted
              ? "No Completed Analysis"
              : "No Pending Documents"}
          </h3>

          <p>
            {isCompleted
              ? "Your completed tender analyses will appear here."
              : "Your uploaded documents waiting for analysis will appear here."}
          </p>
        </div>
      );
    }

    return records.map((item) => (
      <div className="history-item" key={item.id}>

        <div className="history-record-info">
          <strong>{item.name || "Untitled Tender"}</strong>

          <small>
            {item.date
              ? new Date(item.date).toLocaleString()
              : "Date unavailable"}
          </small>

          <small>
            {item.totalPages ?? 0} Total Pages
          </small>
        </div>

        <div className="history-record-actions">

          <span
            className={
              isCompleted
                ? "success-badge"
                : "pending-badge"
            }
          >
            {isCompleted ? "Analysis Completed" : "Not Analyzed"}
          </span>

          <button
            type="button"
            className="secondary-btn"
            onClick={() =>
              navigate("/analysis-results", {
                state: { tenderId: item.id },
              })
            }
          >
            {isCompleted
              ? "View Analysis →"
              : "Start Analysis →"}
          </button>

        </div>

      </div>
    ));
  };

  return (
    <div className="page-content">

      {/* Page Header */}
      <header className="page-header">
        <div>
          <span className="eyebrow">WORKSPACE RECORDS</span>

          <h1>Analysis History</h1>

          <p>
            Manage your uploaded documents and completed tender analyses.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="details-card">
          <div className="empty-state">
            <h3>Loading History...</h3>
            <p>Fetching records from the database.</p>
          </div>
        </div>
      ) : error ? (
        <div className="details-card">
          <div className="empty-state">
            <h3>Unable to Load History</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Section 1: Completed Analysis */}
          <section className="details-card history-section">

            <div className="history-heading">
              <div>
                <h2>Completed Analysis</h2>
                <p>
                  Your successfully analyzed tender documents.
                </p>
              </div>

              <span>
                {completedRecords.length} Records
              </span>
            </div>

            {renderHistoryRecords(
              visibleCompletedRecords,
              true
            )}

            {completedRecords.length > RECORDS_PER_PAGE &&
              renderPagination(
                completedPage,
                completedTotalPages,
                () =>
                  setCompletedPage((page) =>
                    Math.max(1, page - 1)
                  ),
                () =>
                  setCompletedPage((page) =>
                    Math.min(completedTotalPages, page + 1)
                  )
              )}
          </section>

          {/* Section 2: Uploaded but Not Analyzed */}
          <section className="details-card history-section">

            <div className="history-heading">
              <div>
                <h2>Uploaded – Not Analyzed</h2>
                <p>
                  Documents that are uploaded but waiting for analysis.
                </p>
              </div>

              <span>
                {pendingRecords.length} Records
              </span>
            </div>

            {renderHistoryRecords(
              visiblePendingRecords,
              false
            )}

            {pendingRecords.length > RECORDS_PER_PAGE &&
              renderPagination(
                pendingPage,
                pendingTotalPages,
                () =>
                  setPendingPage((page) =>
                    Math.max(1, page - 1)
                  ),
                () =>
                  setPendingPage((page) =>
                    Math.min(pendingTotalPages, page + 1)
                  )
              )}
          </section>
        </>
      )}

      {/* Back to Dashboard */}
      <button
        type="button"
        className="secondary-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Dashboard
      </button>

    </div>
  );
}

export default AnalysisHistory;
