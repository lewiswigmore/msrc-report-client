'use client';

interface ReporterInfoSectionProps {
  reporterName: string;
  reporterEmail: string;
  isAnonymous: boolean;
  onAnonymousChange: (checked: boolean) => void;
}

export function ReporterInfoSection({
  reporterName, reporterEmail, isAnonymous, onAnonymousChange,
}: ReporterInfoSectionProps) {
  return (
    <section className="bg-white p-4 sm:p-6 shadow-sm border border-gray-200 rounded-sm">
      <h2 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Reporter Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="ms-label">Full Name</label>
          <input
            type="text"
            className="ms-input bg-gray-50"
            value={reporterName}
            readOnly
            placeholder="Populated from Microsoft account"
          />
        </div>
        <div>
          <label className="ms-label">Email Address</label>
          <input
            type="email"
            className="ms-input bg-gray-50"
            value={reporterEmail}
            readOnly
            placeholder="Populated from Microsoft account"
          />
          <p className="text-xs text-gray-500 mt-1">Authenticated Microsoft account</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => onAnonymousChange(e.target.checked)}
            className="w-4 h-4 text-[var(--ms-blue)] border-gray-300 rounded focus:ring-[var(--ms-blue)]"
          />
          <span className="text-sm text-gray-700">Submit report anonymously</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Your identity will be hidden from the reported party, but Microsoft will retain your information for investigation purposes.
        </p>
      </div>
    </section>
  );
}
