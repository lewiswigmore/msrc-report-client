'use client';

interface SubmissionSidebarProps {
  logs: string[];
  onClearLogs: () => void;
}

export function SubmissionSidebar({ logs, onClearLogs }: SubmissionSidebarProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200 rounded-sm">
        <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Submission Logs</h3>
        {logs.length === 0 ? (
          <div className="text-sm text-gray-500 italic py-8 text-center border-2 border-dashed border-gray-100 rounded">
            Logs will appear here after submission starts.
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-4 h-[300px] sm:h-[400px] lg:h-[500px] overflow-y-auto text-xs font-mono">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`mb-1.5 pb-1.5 border-b border-gray-100 last:border-0 ${
                  log.includes('[ERROR]') ? 'text-red-600' : 'text-green-700'
                }`}
              >
                <span className="opacity-50 mr-2">{i + 1}.</span>
                {log}
              </div>
            ))}
          </div>
        )}
        {logs.length > 0 && (
          <div className="mt-4 text-right">
            <button onClick={onClearLogs} className="text-xs text-[var(--ms-blue)] hover:underline">
              Clear Logs
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 border border-gray-200 rounded-sm">
        <h4 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Help & Guidance</h4>
        <p className="text-sm text-gray-600 mb-2">For high-severity incidents, please ensure immediate mitigation steps are taken locally.</p>
        <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
          <li>Check MSRC guidelines for evidence requirements.</li>
          <li>Bulk limits may apply to API throughput.</li>
          <li>Use Test Mode to validate format first.</li>
        </ul>
      </div>
    </div>
  );
}
