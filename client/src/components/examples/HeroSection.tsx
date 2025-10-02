import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <HeroSection 
      onStartChat={() => console.log('Start chat clicked')}
      onGetStarted={() => console.log('Get started clicked')}
    />
  );
}