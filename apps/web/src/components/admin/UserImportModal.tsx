'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, Loader2, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ParsedUserRow {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password?: string;
  isValid: boolean;
  error?: string;
}

interface ImportSummary {
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errors: Array<{ row: number; email: string; error: string }>;
}

interface UserImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserImportModal({ open, onOpenChange, onSuccess }: UserImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedUserRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overwrite, setOverwrite] = useState(true);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const resetState = () => {
    setFile(null);
    setRows([]);
    setLoading(false);
    setSummary(null);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const parseFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setSummary(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.SheetNames[0];
      if (!firstSheet) {
        toast.error('The selected file is empty.');
        setLoading(false);
        return;
      }

      const sheet = workbook.Sheets[firstSheet];
      const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rawData || rawData.length === 0) {
        toast.error('No rows found in the spreadsheet.');
        setLoading(false);
        return;
      }

      const parsed: ParsedUserRow[] = rawData.map((row) => {
        // Flexibly map column headers
        const keys = Object.keys(row);
        const getKey = (...possible: string[]) => {
          const found = keys.find((k) => possible.some((p) => k.trim().toLowerCase() === p.toLowerCase()));
          return found ? String(row[found]).trim() : '';
        };

        const email = getKey('email', 'email address', 'user email', 'e-mail');
        let firstName = getKey('first name', 'firstname', 'first_name', 'name', 'full name');
        let lastName = getKey('last name', 'lastname', 'last_name');

        // Split name if first name contains full name and last name is missing
        if (firstName && !lastName && firstName.includes(' ')) {
          const parts = firstName.split(' ');
          firstName = parts[0];
          lastName = parts.slice(1).join(' ');
        }

        const roleRaw = getKey('role', 'user role', 'access role').toUpperCase();
        const validRoles = ['GUEST', 'CLIENT', 'TALENT', 'EDITOR', 'EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
        const role = validRoles.includes(roleRaw) ? roleRaw : 'CLIENT';
        const password = getKey('password', 'pass', 'user password');

        const isValidEmail = Boolean(email && email.includes('@') && email.includes('.'));

        return {
          email,
          firstName: firstName || 'User',
          lastName: lastName || '',
          role,
          password: password || undefined,
          isValid: isValidEmail,
          error: !isValidEmail ? 'Missing or invalid email' : undefined,
        };
      });

      setRows(parsed);
      const validCount = parsed.filter((r) => r.isValid).length;
      toast.success(`Parsed ${parsed.length} rows (${validCount} valid).`);
    } catch (err: any) {
      toast.error(`Failed to parse file: ${err?.message || 'Invalid Excel format'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) parseFile(droppedFile);
  };

  const downloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Email,First Name,Last Name,Role,Password\n' +
      'client.demo@mpproduction.com,Demo,Client,CLIENT,Password123!\n' +
      'talent.demo@mpproduction.com,Demo,Talent,TALENT,Password123!\n' +
      'editor.demo@mpproduction.com,Demo,Editor,EDITOR,Password123!';
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = 'users_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const executeImport = async () => {
    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid user rows to import.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: validRows.map(({ email, firstName, lastName, role, password }) => ({
            email,
            firstName,
            lastName,
            role,
            password,
          })),
          overwriteExisting: overwrite,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Import failed');
      }

      setSummary(json.data);
      toast.success(`🎉 Bulk import completed! Created: ${json.data.createdCount}, Updated: ${json.data.updatedCount}`);
      onSuccess();
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validCount = rows.filter((r) => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl w-[92vw] max-h-[85vh] flex flex-col p-6 rounded-2xl bg-background border border-border shadow-2xl">
        <DialogHeader className="flex flex-row justify-between items-center pb-4 border-b border-border">
          <div>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Import Users from Excel / CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Upload an Excel (.xlsx, .xls) or CSV (.csv) file to import users directly into database.
            </DialogDescription>
          </div>
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Sample CSV
          </Button>
        </DialogHeader>

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={`my-6 border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 bg-background/50'
            }`}
            onClick={() => document.getElementById('excel-import-file-input')?.click()}
          >
            <input
              id="excel-import-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) parseFile(selected);
              }}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-medium">Parsing spreadsheet file...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    Click to upload or drag & drop file here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports Excel (.xlsx, .xls) and CSV (.csv) files with headers: Email, First Name, Last Name, Role
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : summary ? (
          <div className="my-4 flex flex-col gap-4 overflow-y-auto max-h-[50vh] pr-1">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Bulk Import Finished Successfully</h4>
                <p className="text-xs mt-0.5">
                  Processed {summary.totalProcessed} records. {summary.createdCount} new users created, {summary.updatedCount} users updated.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <div className="text-xl font-bold text-foreground">{summary.createdCount}</div>
                <div className="text-xs text-muted-foreground">New Created</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <div className="text-xl font-bold text-foreground">{summary.updatedCount}</div>
                <div className="text-xs text-muted-foreground">Updated</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <div className="text-xl font-bold text-amber-500">{summary.skippedCount}</div>
                <div className="text-xs text-muted-foreground">Skipped / Failed</div>
              </div>
            </div>

            {summary.errors && summary.errors.length > 0 && (
              <div className="border border-border rounded-xl p-3 bg-destructive/5 flex flex-col gap-2">
                <div className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings / Errors ({summary.errors.length}):
                </div>
                <div className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1 text-xs">
                  {summary.errors.map((err, idx) => (
                    <div key={idx} className="flex justify-between text-muted-foreground font-mono">
                      <span>Row #{err.row}: {err.email}</span>
                      <span className="text-destructive">{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="my-4 flex flex-col gap-4 overflow-hidden flex-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center gap-2 text-sm font-medium truncate">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">({rows.length} total rows)</span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetState} className="h-7 text-xs">
                Change File
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-3">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="text-amber-500 font-medium">
                    ⚠ {invalidCount} invalid (will be skipped)
                  </span>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                Overwrite existing users by email
              </label>
            </div>

            {/* Preview Table */}
            <div className="border border-border rounded-xl overflow-y-auto max-h-[35vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/70 sticky top-0 border-b border-border">
                  <tr>
                    <th className="p-2.5 font-semibold">Status</th>
                    <th className="p-2.5 font-semibold">Email</th>
                    <th className="p-2.5 font-semibold">Name</th>
                    <th className="p-2.5 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {rows.map((r, i) => (
                    <tr key={i} className={!r.isValid ? 'bg-destructive/5' : 'hover:bg-muted/20'}>
                      <td className="p-2.5 font-sans">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-medium text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" /> {r.error}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 truncate max-w-[200px]">{r.email || '-'}</td>
                      <td className="p-2.5 font-sans">{r.firstName} {r.lastName}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-bold">
                          {r.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4 mt-auto">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            {summary ? 'Close' : 'Cancel'}
          </Button>
          {!summary && file && (
            <Button
              size="sm"
              onClick={executeImport}
              disabled={loading || validCount === 0}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing ({validCount} users)...
                </>
              ) : (
                `Import ${validCount} Users`
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
