import React from 'react';

interface AboutSectionProps {
  isOpen: boolean;
  htmlContent: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ isOpen, htmlContent }) => {
  if (!isOpen) return null;

  return (
    <div className="w-full mb-8 animate-slide-up overflow-hidden">
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* 
          DangerouslySetInnerHTML is used here to allow the Admin to upload custom HTML/CSS 
          for their profile. Since only the Admin can upload this, it is considered a 
          trusted source for this specific application context.
        */}
        <div 
          className="prose prose-invert max-w-none prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:rounded-xl prose-headings:text-zinc-100 prose-p:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>
    </div>
  );
};

export default AboutSection;