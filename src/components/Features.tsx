import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

interface FeaturesProps {
  features: Feature[];
}

const Features: React.FC<FeaturesProps> = ({ features }) => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {' '}Land Your Dream Job
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Our comprehensive suite of AI-powered tools helps you optimize every aspect of your job search, 
            from resume writing to interview preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={feature.onClick}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 sm:p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-200 group cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              disabled={!feature.onClick}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;