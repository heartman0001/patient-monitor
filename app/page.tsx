import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero */}
      <section className="border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
          <div className="w-full sm:max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#D4D4D8] text-[12px] font-medium uppercase tracking-[0.05em] text-[#71717A] mb-8">
              <span className="w-1.5 h-1.5 bg-[#0A0A0A]" />
              Real-Time Patient Monitoring
            </div>
            <h1 className="text-[48px] sm:text-[64px] font-bold text-[#0A0A0A] leading-[1.05] tracking-tight mb-6">
              Patient Monitor
            </h1>
            <p className="text-[16px] font-light text-[#71717A] leading-relaxed max-w-lg mx-auto mb-10">
              A real-time system that synchronizes patient form data instantly with the staff monitoring dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/patient" className="inline-flex items-center justify-center h-10 px-6 text-[14px] font-medium bg-[#0A0A0A] text-[#FAFAFA] border border-transparent hover:bg-[#333333] transition-all duration-150">Patient Form</Link>
              <Link href="/staff" className="inline-flex items-center justify-center h-10 px-6 text-[14px] font-medium bg-transparent text-[#0A0A0A] border border-[#0A0A0A] hover:bg-[#E1E1ED] hover:border-[#3B82F6] transition-colors duration-150">Staff Dashboard</Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-[#E5E5E5]">
            <div className="py-6 md:py-0 md:pr-8">
              <span className="text-[13px] font-medium text-[#A1A1AA] uppercase tracking-[0.05em]">01</span>
              <h3 className="text-[18px] font-semibold text-[#0A0A0A] mt-3 mb-2 tracking-tight">Patient Form</h3>
              <p className="text-[14px] text-[#71717A] leading-relaxed">Patients fill in their details through a clean, validated form.</p>
            </div>
            <div className="py-6 md:py-0 md:px-8">
              <span className="text-[13px] font-medium text-[#A1A1AA] uppercase tracking-[0.05em]">02</span>
              <h3 className="text-[18px] font-semibold text-[#0A0A0A] mt-3 mb-2 tracking-tight">Staff Dashboard</h3>
              <p className="text-[14px] text-[#71717A] leading-relaxed">Staff monitor patient inputs in real-time with live status indicators.</p>
            </div>
            <div className="py-6 md:py-0 md:pl-8">
              <span className="text-[13px] font-medium text-[#A1A1AA] uppercase tracking-[0.05em]">03</span>
              <h3 className="text-[18px] font-semibold text-[#0A0A0A] mt-3 mb-2 tracking-tight">Real-Time Sync</h3>
              <p className="text-[14px] text-[#71717A] leading-relaxed">Powered by Socket.io, all updates are synchronized instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-b border-[#E5E5E5]">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-[13px] font-medium text-[#71717A] uppercase tracking-[0.05em] mb-6">Technology</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {['Next.js', 'TypeScript', 'TailwindCSS', 'React Hook Form', 'Zod', 'Socket.io', 'Express'].map((tech) => (
              <span key={tech} className="px-3 py-1.5 text-[12px] font-medium text-[#71717A] border border-[#D4D4D8] uppercase tracking-[0.05em]">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] py-6">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[12px] text-[#71717A]">Patient Monitor</p>
        </div>
      </footer>
    </div>
  );
}
