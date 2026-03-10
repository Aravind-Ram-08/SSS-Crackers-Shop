import { useState, useRef } from "react";
import {
    HiOutlineUpload, HiOutlineDocumentText, HiOutlineX,
    HiOutlineCheck, HiOutlineTrash, HiOutlineExclamationCircle,
    HiOutlineDownload, HiOutlinePencil,
} from "react-icons/hi";
import { useAdminData } from "../../context/AdminDataContext";
import { categories } from "../../data/products";
import "./AdminBulkImport.css";

// Parse CSV text into rows
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/\s+/g, ""));
    return lines.slice(1).map((line, idx) => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (values[i] || "").trim(); });
        obj._rowNum = idx + 2;
        return obj;
    });
}

function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += line[i];
        }
    }
    result.push(current);
    return result;
}

const FIELD_MAP = {
    name: ["name", "productname", "product_name", "product"],
    category: ["category", "categoryname", "category_name"],
    price: ["price", "rate", "amount"],
    boxContents: ["boxcontents", "box_contents", "boxcontent", "box_content", "content", "contents", "packing"],
    stock: ["stock", "stockqty", "stock_qty", "quantity", "qty"],
    description: ["description", "desc"],
    imageUrl: ["imageurl", "image_url", "image", "img"],
};

function mapRow(raw) {
    const mapped = {};
    for (const [field, aliases] of Object.entries(FIELD_MAP)) {
        for (const alias of aliases) {
            if (alias in raw) { mapped[field] = raw[alias]; break; }
        }
    }
    return mapped;
}

function validateRow(row, idx) {
    const errors = [];
    if (!row.name?.trim()) errors.push("Name is required");
    if (!row.category?.trim()) errors.push("Category is required");
    if (!row.price || isNaN(Number(row.price)) || Number(row.price) <= 0) errors.push("Valid price required");
    if (row.stock !== undefined && row.stock !== "" && (isNaN(Number(row.stock)) || Number(row.stock) < 0)) errors.push("Stock must be ≥ 0");
    return errors;
}

function inferCategorySlug(categoryName) {
    const name = (categoryName || "").toLowerCase().trim();
    const cat = categories.find(c =>
        c.name.toLowerCase() === name ||
        c.slug === name.replace(/\s+/g, "-")
    );
    return cat ? { category: cat.name, categorySlug: cat.slug } : { category: categoryName, categorySlug: name.replace(/\s+/g, "-") };
}

const SAMPLE_CSV = `name,category,price,boxContents,stock,description
5" Jallikattu,One Sound Crackers,160,1 PKT,100,Powerful single-sound cracker
4½" Bahubali,One Sound Crackers,150,1 PKT,100,Named after the legendary warrior
Red Bijili,Bijili Crackers,68,1 BOX,200,Classic red bijili crackers
Sky Shot 10 Shots,Aerial Fancy,450,1 BOX,50,Ten magnificent sky shots
Gold Fountain,Special Fountain,200,1 PKT,75,Rich golden sparks cascade upward`;

export default function AdminBulkImport() {
    const { addProduct, products } = useAdminData();
    const fileRef = useRef();

    const [step, setStep] = useState(1); // 1=upload, 2=preview, 3=result
    const [fileName, setFileName] = useState("");
    const [rawRows, setRawRows] = useState([]);
    const [rows, setRows] = useState([]); // { ...mapped, _errors, _valid, _rowNum, _removed }
    const [editingIdx, setEditingIdx] = useState(null);
    const [editBuf, setEditBuf] = useState({});
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null); // { success, failed, details }
    const [dragOver, setDragOver] = useState(false);
    const [parseError, setParseError] = useState("");

    function handleFile(file) {
        if (!file) return;
        const ext = file.name.split(".").pop().toLowerCase();
        if (!["csv", "xlsx", "xls"].includes(ext)) {
            setParseError("Unsupported format. Please upload a CSV or XLSX file.");
            return;
        }
        setParseError("");
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let parsed;
                if (ext === "csv") {
                    parsed = parseCSV(e.target.result);
                } else {
                    // For Excel: we just show a helpful message since we don't have a library
                    setParseError("Excel support requires SheetJS. Please convert your Excel file to CSV format and re-upload.");
                    return;
                }
                if (parsed.length === 0) {
                    setParseError("File appears empty or has no data rows.");
                    return;
                }
                processRows(parsed);
                setStep(2);
            } catch (err) {
                setParseError("Error reading file: " + err.message);
            }
        };
        if (ext === "csv") {
            reader.readAsText(file, "UTF-8");
        }
    }

    function processRows(parsed) {
        const existingNames = new Set(products.map(p => p.name.toLowerCase().trim()));
        const processed = parsed.slice(0, 1000).map((raw, idx) => {
            const mapped = mapRow(raw);
            const errors = validateRow(mapped, idx);
            const isDuplicate = mapped.name && existingNames.has(mapped.name.toLowerCase().trim());
            if (isDuplicate) errors.push("Duplicate: product already exists");
            return {
                ...mapped,
                _rowNum: raw._rowNum,
                _errors: errors,
                _valid: errors.length === 0,
                _removed: false,
                _duplicate: isDuplicate,
            };
        });
        setRows(processed);
    }

    function removeRow(idx) {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, _removed: true } : r));
    }

    function restoreRow(idx) {
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, _removed: false } : r));
    }

    function startEdit(idx) {
        const r = rows[idx];
        setEditingIdx(idx);
        setEditBuf({
            name: r.name || "",
            category: r.category || "",
            price: r.price || "",
            boxContents: r.boxContents || "",
            stock: r.stock || "100",
            description: r.description || "",
        });
    }

    function saveEdit(idx) {
        const existingNames = new Set(products.map(p => p.name.toLowerCase().trim()));
        const updated = { ...rows[idx], ...editBuf };
        const errors = validateRow(updated, idx);
        const isDuplicate = updated.name && existingNames.has(updated.name.toLowerCase().trim());
        if (isDuplicate && !rows[idx]._duplicate) errors.push("Duplicate: product already exists");
        updated._errors = errors;
        updated._valid = errors.length === 0;
        updated._duplicate = isDuplicate;
        setRows(prev => prev.map((r, i) => i === idx ? updated : r));
        setEditingIdx(null);
    }

    async function handleImport() {
        setImporting(true);
        const toImport = rows.filter(r => !r._removed && r._valid);
        const failed = rows.filter(r => !r._removed && !r._valid);
        const removed = rows.filter(r => r._removed);

        const details = [];
        for (const row of toImport) {
            const { category, categorySlug } = inferCategorySlug(row.category);
            const slug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            addProduct({
                name: row.name.trim(),
                slug,
                category,
                categorySlug,
                price: Number(row.price),
                boxContent: row.boxContents || "",
                stock: row.stock ? Number(row.stock) : 100,
                description: row.description || `Premium quality ${row.name} from SSS Crackers.`,
                rating: 4.5,
                numReviews: 0,
                imageUrl: row.imageUrl || "",
            });
            details.push({ name: row.name, success: true });
        }

        for (const row of failed) {
            details.push({ name: row.name || `Row ${row._rowNum}`, success: false, error: row._errors.join(", ") });
        }

        setResult({
            success: toImport.length,
            failed: failed.length,
            removed: removed.length,
            details,
        });
        setImporting(false);
        setStep(3);
    }

    function reset() {
        setStep(1);
        setFileName("");
        setRawRows([]);
        setRows([]);
        setResult(null);
        setParseError("");
        setEditingIdx(null);
    }

    function downloadSample() {
        const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample_products.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    const activeRows = rows.filter(r => !r._removed);
    const validCount = activeRows.filter(r => r._valid).length;
    const invalidCount = activeRows.filter(r => !r._valid).length;
    const removedCount = rows.filter(r => r._removed).length;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Bulk Product Import</h1>
                    <p className="admin-page-sub">Upload CSV files to add up to 1,000 products at once</p>
                </div>
                <button className="btn btn-outline" onClick={downloadSample} id="download-sample-csv">
                    <HiOutlineDownload /> Download Sample CSV
                </button>
            </div>

            {/* ── Step Indicator ───────────────────────────────────── */}
            <div className="import-steps">
                {["Upload File", "Preview & Edit", "Import Result"].map((label, i) => (
                    <div key={i} className={`import-step ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
                        <div className="import-step-num">
                            {step > i + 1 ? <HiOutlineCheck /> : i + 1}
                        </div>
                        <span className="import-step-label">{label}</span>
                        {i < 2 && <div className="import-step-line" />}
                    </div>
                ))}
            </div>

            {/* ── STEP 1: Upload ───────────────────────────────────── */}
            {step === 1 && (
                <div className="admin-card">
                    <div
                        className={`import-dropzone ${dragOver ? "drag-over" : ""}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                            e.preventDefault();
                            setDragOver(false);
                            handleFile(e.dataTransfer.files[0]);
                        }}
                        onClick={() => fileRef.current?.click()}
                        id="import-dropzone"
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            style={{ display: "none" }}
                            onChange={e => handleFile(e.target.files[0])}
                            id="file-upload-input"
                        />
                        <HiOutlineUpload className="import-drop-icon" />
                        <p className="import-drop-title">Drop your CSV file here</p>
                        <p className="import-drop-sub">or click to browse · Supports CSV, XLSX</p>
                        <div className="import-drop-btn">Choose File</div>
                    </div>

                    {parseError && (
                        <div className="import-error-banner">
                            <HiOutlineExclamationCircle />
                            {parseError}
                        </div>
                    )}

                    <div className="import-format-info">
                        <h4 className="import-format-title">📋 Required CSV Format</h4>
                        <div className="import-format-table-wrap">
                            <table className="import-format-table">
                                <thead>
                                    <tr>
                                        <th>Column</th>
                                        <th>Required</th>
                                        <th>Example</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>name</td><td><span className="req-yes">Required</span></td><td>5" Jallikattu</td></tr>
                                    <tr><td>category</td><td><span className="req-yes">Required</span></td><td>One Sound Crackers</td></tr>
                                    <tr><td>price</td><td><span className="req-yes">Required</span></td><td>160</td></tr>
                                    <tr><td>boxContents</td><td><span className="req-opt">Optional</span></td><td>1 PKT</td></tr>
                                    <tr><td>stock</td><td><span className="req-opt">Optional</span></td><td>100 (default: 100)</td></tr>
                                    <tr><td>description</td><td><span className="req-opt">Optional</span></td><td>Premium quality cracker...</td></tr>
                                    <tr><td>imageUrl</td><td><span className="req-opt">Optional</span></td><td>https://...</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="import-format-note">
                            💡 Maximum 1000 rows per upload. Duplicate product names will be flagged.
                        </p>
                    </div>
                </div>
            )}

            {/* ── STEP 2: Preview & Edit ───────────────────────────── */}
            {step === 2 && (
                <div>
                    <div className="import-preview-stats">
                        <div className="imp-stat">
                            <span className="imp-stat-num" style={{ color: "#e0e0e8" }}>{rows.length}</span>
                            <span className="imp-stat-label">Total Rows</span>
                        </div>
                        <div className="imp-stat">
                            <span className="imp-stat-num" style={{ color: "#10b981" }}>{validCount}</span>
                            <span className="imp-stat-label">Ready to Import</span>
                        </div>
                        <div className="imp-stat">
                            <span className="imp-stat-num" style={{ color: "#ef4444" }}>{invalidCount}</span>
                            <span className="imp-stat-label">Has Errors</span>
                        </div>
                        <div className="imp-stat">
                            <span className="imp-stat-num" style={{ color: "#8888aa" }}>{removedCount}</span>
                            <span className="imp-stat-label">Removed</span>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="import-preview-header">
                            <span className="import-file-name">
                                <HiOutlineDocumentText /> {fileName}
                            </span>
                            <div className="import-preview-actions">
                                <button className="btn btn-outline" onClick={reset}>← Re-upload</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleImport}
                                    disabled={importing || validCount === 0}
                                    id="start-import-btn"
                                >
                                    {importing ? "Importing..." : `Import ${validCount} Products`}
                                </button>
                            </div>
                        </div>

                        <div className="admin-table-wrap">
                            <table className="admin-table import-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Box Content</th>
                                        <th>Stock</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, idx) => {
                                        const isEditing = editingIdx === idx;
                                        return (
                                            <tr
                                                key={idx}
                                                className={`import-row ${row._removed ? "row-removed" : row._valid ? "row-valid" : "row-invalid"}`}
                                            >
                                                <td className="text-muted">{row._rowNum}</td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            className="import-edit-input"
                                                            value={editBuf.name}
                                                            onChange={e => setEditBuf(b => ({ ...b, name: e.target.value }))}
                                                        />
                                                    ) : (
                                                        <span className={row._valid ? "import-name-valid" : "import-name-invalid"}>
                                                            {row.name || <em className="text-muted">—</em>}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <select
                                                            className="import-edit-input"
                                                            value={editBuf.category}
                                                            onChange={e => setEditBuf(b => ({ ...b, category: e.target.value }))}
                                                        >
                                                            <option value="">Select...</option>
                                                            {categories.map(c => (
                                                                <option key={c.slug} value={c.name}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : row.category || <em className="text-muted">—</em>}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="import-edit-input"
                                                            value={editBuf.price}
                                                            onChange={e => setEditBuf(b => ({ ...b, price: e.target.value }))}
                                                            min="1"
                                                        />
                                                    ) : row.price ? `₹${row.price}` : <em className="text-muted">—</em>}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            className="import-edit-input"
                                                            value={editBuf.boxContents}
                                                            onChange={e => setEditBuf(b => ({ ...b, boxContents: e.target.value }))}
                                                            placeholder="1 PKT"
                                                        />
                                                    ) : row.boxContents || <em className="text-muted">—</em>}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="import-edit-input"
                                                            value={editBuf.stock}
                                                            onChange={e => setEditBuf(b => ({ ...b, stock: e.target.value }))}
                                                            min="0"
                                                        />
                                                    ) : row.stock || "100"}
                                                </td>
                                                <td>
                                                    {row._removed ? (
                                                        <span className="import-badge removed">Removed</span>
                                                    ) : row._valid ? (
                                                        <span className="import-badge valid">
                                                            <HiOutlineCheck /> Ready
                                                        </span>
                                                    ) : (
                                                        <span className="import-badge invalid" title={row._errors.join(", ")}>
                                                            <HiOutlineExclamationCircle /> Error
                                                        </span>
                                                    )}
                                                    {!row._removed && row._errors.length > 0 && (
                                                        <div className="import-error-tip">{row._errors.join(" · ")}</div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="action-btns">
                                                        {!row._removed && (
                                                            isEditing ? (
                                                                <>
                                                                    <button className="action-btn primary" onClick={() => saveEdit(idx)} title="Save">
                                                                        <HiOutlineCheck />
                                                                    </button>
                                                                    <button className="action-btn" onClick={() => setEditingIdx(null)} title="Cancel">
                                                                        <HiOutlineX />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <button className="action-btn primary" onClick={() => startEdit(idx)} title="Edit">
                                                                    <HiOutlinePencil />
                                                                </button>
                                                            )
                                                        )}
                                                        {!row._removed ? (
                                                            <button className="action-btn danger" onClick={() => removeRow(idx)} title="Remove">
                                                                <HiOutlineTrash />
                                                            </button>
                                                        ) : (
                                                            <button className="action-btn primary" onClick={() => restoreRow(idx)} title="Restore">
                                                                ↩
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── STEP 3: Result ───────────────────────────────────── */}
            {step === 3 && result && (
                <div className="admin-card">
                    <div className="import-result-hero">
                        <div className="import-result-icon">🎉</div>
                        <h2 className="import-result-title">Import Complete!</h2>
                        <p className="import-result-sub">
                            Your product catalog has been updated successfully.
                        </p>
                    </div>

                    <div className="import-result-stats">
                        <div className="imp-result-stat success">
                            <HiOutlineCheck className="imp-rs-icon" />
                            <span className="imp-rs-num">{result.success}</span>
                            <span className="imp-rs-label">Products Added</span>
                        </div>
                        <div className="imp-result-stat error">
                            <HiOutlineExclamationCircle className="imp-rs-icon" />
                            <span className="imp-rs-num">{result.failed}</span>
                            <span className="imp-rs-label">Failed Records</span>
                        </div>
                        <div className="imp-result-stat neutral">
                            <HiOutlineTrash className="imp-rs-icon" />
                            <span className="imp-rs-num">{result.removed}</span>
                            <span className="imp-rs-label">Rows Removed</span>
                        </div>
                    </div>

                    {result.failed > 0 && (
                        <div className="import-failed-list">
                            <h4 style={{ color: "#ef4444", margin: "0 0 0.75rem", fontSize: "0.9rem" }}>
                                Failed Records
                            </h4>
                            {result.details.filter(d => !d.success).map((d, i) => (
                                <div key={i} className="import-failed-row">
                                    <span>{d.name}</span>
                                    <span className="import-failed-err">{d.error}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="import-result-actions">
                        <button className="btn btn-primary" onClick={reset} id="import-again-btn">
                            Import Another File
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
