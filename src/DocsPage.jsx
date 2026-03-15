import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Upload, Trash2, Download, FileText, File,
  FileSpreadsheet, Image, FilePlus, FolderOpen, ChevronRight,
  Filter, SortAsc, Clock, TrendingUp, X, CheckCircle
} from "lucide-react";
import { useTheme } from "./ThemeContext";

const INITIAL_FILES = [
  { id: 1, name: "AAPL_Q2_2024_Earnings.pdf", type: "pdf", stock: "AAPL", size: "2.4 MB", date: "2024-05-02", tags: ["earnings", "quarterly"] },
  { id: 2, name: "NVDA_Annual_Report_2024.pdf", type: "pdf", stock: "NVDA", size: "8.1 MB", date: "2024-03-14", tags: ["annual", "report"] },
  { id: 3, name: "MSFT_Azure_Growth_Analysis.xlsx", type: "xlsx", stock: "MSFT", size: "1.2 MB", date: "2024-06-10", tags: ["analysis", "cloud"] },
  { id: 4, name: "TSLA_DeliveryNumbers_Q1.csv", type: "csv", stock: "TSLA", size: "340 KB", date: "2024-04-03", tags: ["delivery", "production"] },
  { id: 5, name: "BTC_Halving_Research.pdf", type: "pdf", stock: "BTC", size: "4.7 MB", date: "2024-05-19", tags: ["halving", "research"] },
  { id: 6, name: "META_AdRevenue_Breakdown.xlsx", type: "xlsx", stock: "META", size: "890 KB", date: "2024-06-01", tags: ["revenue", "ads"] },
  { id: 7, name: "Portfolio_Risk_Assessment.pdf", type: "pdf", stock: "ALL", size: "1.8 MB", date: "2024-07-01", tags: ["risk", "portfolio"] },
  { id: 8, name: "GOOGL_Waymo_Spinoff_Note.pdf", type: "pdf", stock: "GOOGL", size: "560 KB", date: "2024-06-22", tags: ["spinoff", "note"] },
  { id: 9, name: "JPM_StressTest_Results.pdf", type: "pdf", stock: "JPM", size: "3.2 MB", date: "2024-07-05", tags: ["stress-test", "fed"] },
  { id: 10, name: "XOM_OilProduction_Chart.png", type: "image", stock: "XOM", size: "1.1 MB", date: "2024-06-30", tags: ["production", "chart"] },
];

const TYPE_ICONS = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  image: Image,
  default: File,
};

const TYPE_COLORS = {
  pdf: "#ff6b6b",
  xlsx: "#4caf50",
  csv: "#26c6da",
  image: "#ab47bc",
  default: "#78909c",
};

const STOCK_LIST = ["ALL", "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "META", "JPM", "BTC", "XOM"];

export function DocsPage() {
  const { theme: t } = useTheme();
  const [files, setFiles] = useState(INITIAL_FILES);
  const [search, setSearch] = useState("");
  const [filterStock, setFilterStock] = useState("ALL");
  const [filterType, setFilterType] = useState("all");
  const [sort, setSort] = useState("date");
  const [selected, setSelected] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const nextId = useRef(11);

  const filtered = files
    .filter(f => {
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.stock.toLowerCase().includes(search.toLowerCase()) || f.tags.some(tag => tag.includes(search.toLowerCase()));
      const matchStock = filterStock === "ALL" || f.stock === filterStock;
      const matchType = filterType === "all" || f.type === filterType;
      return matchSearch && matchStock && matchType;
    })
    .sort((a, b) => {
      if (sort === "date") return new Date(b.date) - new Date(a.date);
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "size") return parseFloat(b.size) - parseFloat(a.size);
      return 0;
    });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const deleteSelected = () => {
    setFiles(prev => prev.filter(f => !selected.has(f.id)));
    setSelected(new Set());
  };

  const deleteOne = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    simulateUpload([...e.dataTransfer.files]);
  };

  const simulateUpload = (fileList) => {
    setUploading(true);
    setTimeout(() => {
      const newFiles = fileList.map(f => ({
        id: nextId.current++,
        name: f.name,
        type: f.name.split(".").pop().toLowerCase(),
        stock: "ALL",
        size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toISOString().split("T")[0],
        tags: ["uploaded"],
      }));
      setFiles(prev => [...newFiles, ...prev]);
      setUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2500);
    }, 1200);
  };

  const card = {
    background: t.glass, backdropFilter: "blur(12px)",
    borderRadius: t.cardRadius, border: `1px solid ${t.border}`,
    boxShadow: t.shadow,
  };

  return (
    <div style={{
      margin: "40px auto",
      maxWidth: 1100,
      padding: "30px 40px",
      background: t.glassStrong,
      backdropFilter: t.glassBlur,
      borderRadius: t.cardRadius * 2,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowFloat,
      display: "flex", flexDirection: "column", gap: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4 }}>
            Document Vault
          </h2>
          <p style={{ fontSize: 12, color: t.textSub, fontFamily: t.fontDisplay }}>
            {files.length} files · Research reports, earnings docs & analysis
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {selected.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={deleteSelected}
              style={{ padding: "8px 14px", borderRadius: 9, border: `1px solid ${t.red}40`,
                background: `${t.red}15`, color: t.red, cursor: "pointer",
                fontFamily: t.fontDisplay, fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 6 }}>
              <Trash2 size={13} /> Delete {selected.size}
            </motion.button>
          )}
          <button onClick={() => fileInputRef.current?.click()}
            style={{ padding: "8px 16px", borderRadius: 9, border: "none",
              background: `linear-gradient(135deg, ${t.accent}, ${t.green})`,
              color: "#000", cursor: "pointer", fontFamily: t.fontDisplay,
              fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <Upload size={13} /> Upload Files
          </button>
          <input ref={fileInputRef} type="file" multiple style={{ display: "none" }}
            onChange={e => simulateUpload([...e.target.files])} />
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        style={{ ...card, padding: "20px", textAlign: "center", cursor: "pointer",
          border: `2px dashed ${dragOver ? t.accent : t.border}`,
          background: dragOver ? `${t.accent}08` : t.glass,
          transition: "all 0.2s" }}
        onClick={() => fileInputRef.current?.click()}>
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ width: 18, height: 18, border: `2px solid ${t.accent}`, borderTopColor: "transparent",
                borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ color: t.accent, fontFamily: t.fontDisplay, fontSize: 13 }}>Uploading…</span>
            </motion.div>
          ) : uploadSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: t.green }}>
              <CheckCircle size={18} />
              <span style={{ fontFamily: t.fontDisplay, fontSize: 13, fontWeight: 700 }}>Files uploaded successfully!</span>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <FilePlus size={22} color={t.textSub} />
              <span style={{ color: t.textSub, fontFamily: t.fontDisplay, fontSize: 13 }}>
                Drop files here or <span style={{ color: t.accent, fontWeight: 700 }}>browse</span>
              </span>
              <span style={{ color: t.textDim, fontFamily: t.fontDisplay, fontSize: 11 }}>
                PDF, XLSX, CSV, PNG — linked to stock research
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={13} color={t.textSub} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search files, stocks, tags…"
            style={{ width: "100%", padding: "8px 10px 8px 30px", borderRadius: 9,
              background: t.glass, border: `1px solid ${t.border}`, backdropFilter: "blur(8px)",
              color: t.text, fontFamily: t.fontDisplay, fontSize: 12, outline: "none" }} />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: t.textSub }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Stock filter */}
        <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 9, background: t.glass, backdropFilter: "blur(8px)",
            border: `1px solid ${t.border}`, color: t.text, fontFamily: t.fontDisplay,
            fontSize: 12, cursor: "pointer", outline: "none" }}>
          {STOCK_LIST.map(s => <option key={s} value={s} style={{ background: t.bgSecondary }}>{s === "ALL" ? "All Stocks" : s}</option>)}
        </select>

        {/* Type filter */}
        {["all", "pdf", "xlsx", "csv", "image"].map(type => (
          <button key={type} onClick={() => setFilterType(type)}
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${filterType === type ? t.accent + "60" : t.border}`,
              background: filterType === type ? `${t.accent}18` : t.glass, backdropFilter: "blur(8px)",
              color: filterType === type ? t.accent : t.textSub,
              fontFamily: t.fontDisplay, fontSize: 11, fontWeight: filterType === type ? 700 : 400,
              cursor: "pointer", transition: "all 0.15s", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {type === "all" ? "All" : type.toUpperCase()}
          </button>
        ))}

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding: "8px 10px", borderRadius: 9, background: t.glass, backdropFilter: "blur(8px)",
            border: `1px solid ${t.border}`, color: t.textSub, fontFamily: t.fontDisplay,
            fontSize: 12, cursor: "pointer", outline: "none" }}>
          <option value="date" style={{ background: t.bgSecondary }}>Newest first</option>
          <option value="name" style={{ background: t.bgSecondary }}>Name A–Z</option>
          <option value="size" style={{ background: t.bgSecondary }}>Largest first</option>
        </select>
      </div>

      {/* File count */}
      <div style={{ fontSize: 11, color: t.textSub, fontFamily: t.fontDisplay }}>
        Showing {filtered.length} of {files.length} files
        {search && <span style={{ color: t.accent }}> · matching "{search}"</span>}
      </div>

      {/* File grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        <AnimatePresence>
          {filtered.map((file, i) => {
            const Icon = TYPE_ICONS[file.type] || TYPE_ICONS.default;
            const iconColor = TYPE_COLORS[file.type] || TYPE_COLORS.default;
            const isSelected = selected.has(file.id);
            return (
              <motion.div key={file.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggleSelect(file.id)}
                style={{ ...card, padding: "14px", cursor: "pointer",
                  border: `1px solid ${isSelected ? t.accent + "60" : t.border}`,
                  background: isSelected ? `${t.accent}08` : t.glass,
                  transition: "all 0.15s", position: "relative" }}>

                {/* Selection indicator */}
                <div style={{ position: "absolute", top: 10, right: 10,
                  width: 16, height: 16, borderRadius: "50%",
                  border: `1.5px solid ${isSelected ? t.accent : t.textDim}`,
                  background: isSelected ? t.accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s" }}>
                  {isSelected && <span style={{ fontSize: 9, color: "#000", fontWeight: 800 }}>✓</span>}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10,
                    background: `${iconColor}18`, border: `1px solid ${iconColor}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={iconColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text,
                      fontFamily: t.fontDisplay, marginBottom: 2,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {file.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 10, fontFamily: t.fontMono, color: t.accent,
                        background: `${t.accent}15`, padding: "1px 6px", borderRadius: 5,
                        fontWeight: 700 }}>{file.stock}</span>
                      <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontDisplay }}>{file.size}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {file.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 9, color: t.textSub, background: t.glass,
                      border: `1px solid ${t.border}`, padding: "2px 7px", borderRadius: 10,
                      fontFamily: t.fontDisplay }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={9} color={t.textDim} />
                    <span style={{ fontSize: 10, color: t.textDim, fontFamily: t.fontMono }}>{file.date}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => {}}
                      style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.border}`,
                        background: t.glass, cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", color: t.accent, transition: "all 0.15s" }}
                      title="Download">
                      <Download size={11} />
                    </button>
                    <button onClick={() => deleteOne(file.id)}
                      style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${t.border}`,
                        background: t.glass, cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", color: t.textSub, transition: "all 0.15s" }}
                      title="Delete">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <FolderOpen size={40} color={t.textDim} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: 14, color: t.textSub, fontFamily: t.fontDisplay }}>No documents found</div>
          <div style={{ fontSize: 12, color: t.textDim, fontFamily: t.fontDisplay, marginTop: 4 }}>
            Try adjusting your filters or upload new files
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
