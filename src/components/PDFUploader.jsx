
import { useRef, useState } from "react";
import {
  validatePDF,
  validateFileCount,
} from "../utils/fileValidation";

function PDFUploader({ onFilesChange }) {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const addFiles = (selectedFiles) => {
    const incoming = Array.from(selectedFiles);

    setError("");

    const countError = validateFileCount(
      files.length,
      incoming.length
    );

    if (countError) {
      setError(countError);
      return;
    }

    const validFiles = [];
    const errors = [];

    incoming.forEach((file) => {
      const validationError = validatePDF(file);

      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        return;
      }

      const duplicate = [...files, ...validFiles].some(
        (item) =>
          item.name === file.name &&
          item.size === file.size &&
          item.lastModified === file.lastModified
      );

      if (duplicate) {
        errors.push(`${file.name}: Already selected.`);
        return;
      }

      validFiles.push(file);
    });

    const updatedFiles = [...files, ...validFiles];

    setFiles(updatedFiles);
    onFilesChange(updatedFiles);

    if (errors.length) {
      setError(errors.join(" "));
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter(
      (_, i) => i !== index
    );

    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setError("");
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className="pdf-uploader">

      <div
        className={`upload-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">⇧</div>

        <h3>Drag & Drop Tender PDFs</h3>

        <p>
          Upload your tender documents for analysis.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <button
          type="button"
          className="primary-btn"
          onClick={() => inputRef.current.click()}
        >
          Browse PDF Files
        </button>

        <small>
          PDF only · Maximum 10 MB each · Maximum 5 files
        </small>
      </div>

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="uploaded-files">

          <h3>
            Selected Documents ({files.length})
          </h3>

          {files.map((file, index) => (
            <div className="file-item" key={`${file.name}-${file.lastModified}-${index}`}>

              <div className="file-info">
                <span className="file-icon">PDF</span>

                <div>
                  <strong>{file.name}</strong>
                  <small>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeFile(index)}
              >
                Remove
              </button>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default PDFUploader;
