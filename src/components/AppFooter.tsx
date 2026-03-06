export function AppFooter() {
  return (
    <footer className="bg-gray-100 py-6 sm:py-8 px-4 mt-auto border-t border-gray-200">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href="https://go.microsoft.com/fwlink/?LinkId=521839" className="hover:underline" target="_blank" rel="noopener noreferrer">Privacy</a>
          <a href="https://go.microsoft.com/fwlink/?LinkID=206977" className="hover:underline" target="_blank" rel="noopener noreferrer">Terms of Use</a>
          <a href="https://go.microsoft.com/fwlink/?linkid=2196228" className="hover:underline" target="_blank" rel="noopener noreferrer">Trademarks</a>
        </div>
        <div className="text-center md:text-right">
          © {new Date().getFullYear()} Microsoft
        </div>
      </div>
    </footer>
  );
}
