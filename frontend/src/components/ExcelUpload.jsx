import React, { useState, useEffect } from "react";
import { Upload, Download, FileSpreadsheet, Eye, EyeOff, Filter, X, Check, CheckSquare, Square } from "lucide-react";

const ExcelUpload = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFileChange = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/leads/import", {
        headers: { Authorization: `Bearer ${token}` },
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setColumns(data.columns);
      setData(data.rows);
      setSelectedColumns(data.columns); // All visible by default
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleColumnToggle = (colName) => {
    setSelectedColumns((prev) =>
      prev.includes(colName)
        ? prev.filter((col) => col !== colName)
        : [...prev, colName]
    );
  };

  const handleSelectAll = () => setSelectedColumns(columns);
  const handleDeselectAll = () => setSelectedColumns([]);

  const getVisibleData = () => {
    if (selectedColumns.length === 0) return [];
    return data.map((row) =>
      selectedColumns.map((col) => {
        const idx = columns.indexOf(col);
        return row[idx];
      })
    );
  };

  const filteredColumns = columns.filter(col => 
    col.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const visibleData = getVisibleData();
    const csvContent = [
      selectedColumns.join(','),
      ...visibleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Mock Excel export - in real app, you'd use a library like xlsx
    console.log("Exporting to Excel...");
    alert("Excel export functionality would be implemented here using libraries like xlsx or SheetJS");
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (isDropdownOpen && !e.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, [isDropdownOpen]);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Excel File Management</h2>
          </div>
        </div>

        <div className="p-6">
          {/* Drag & Drop Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600 font-medium">Processing your file...</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload Excel File
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer transform hover:scale-105"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports .xlsx and .xls files up to 10MB
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{uploadError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Management Section */}
      {columns.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Data Preview</h3>
                <p className="text-sm text-gray-600">{data.length} rows • {selectedColumns.length} of {columns.length} columns visible</p>
              </div>
              
              {/* Export Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 transform hover:scale-105"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>

          {/* Column Filter */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="dropdown relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Column Visibility ({selectedColumns.length}/{columns.length})
                {isDropdownOpen ? <X className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <input
                      type="text"
                      placeholder="Search columns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between">
                      <button
                        onClick={handleSelectAll}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        <Square className="h-4 w-4" />
                        Deselect All
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {filteredColumns.map((col) => (
                      <label key={col} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(col)}
                            onChange={() => handleColumnToggle(col)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedColumns.includes(col) 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}>
                            {selectedColumns.includes(col) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {selectedColumns.map((col) => (
                    <th key={col} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getVisibleData().slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {row.map((cell, j) => (
                      <td key={j} className="px-6 py-4 text-sm text-gray-900">
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.length > 10 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Showing first 10 rows of {data.length} total rows
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;