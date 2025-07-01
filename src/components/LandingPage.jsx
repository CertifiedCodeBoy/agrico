import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  Droplets,
  Brain,
  Smartphone,
  BarChart3,
  FlaskConical,
  ArrowRight,
  CheckCircle,
  Users,
  Globe,
  Zap,
  Shield,
  Play,
  Star,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/');
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Smart soil analysis with Gemini AI for optimal crop recommendations',
      color: 'text-purple-500 bg-purple-100',
    },
    {
      icon: Droplets,
      title: 'Smart Irrigation',
      description: 'Automated watering schedules based on real-time soil conditions',
      color: 'text-blue-500 bg-blue-100',
    },
    {
      icon: FlaskConical,
      title: 'Soil Laboratory',
      description: 'Comprehensive soil testing and pH management recommendations',
      color: 'text-green-500 bg-green-100',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Monitor field performance and water usage with detailed insights',
      color: 'text-orange-500 bg-orange-100',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access your farm data anywhere with responsive design',
      color: 'text-indigo-500 bg-indigo-100',
    },
    {
      icon: Shield,
      title: 'Reliable & Secure',
      description: 'Enterprise-grade security for your valuable farm data',
      color: 'text-red-500 bg-red-100',
    },
  ];

  const benefits = [
    'Save up to 40% on water usage',
    'Increase crop yields by 25%',
    'Reduce manual labor hours',
    'AI-optimized irrigation schedules',
    'Real-time field monitoring',
    'Weather-based adjustments',
  ];

  const testimonials = [
    {
      name: 'Ahmed Hassan',
      role: 'Farm Owner',
      content: 'AgroSmart transformed how we manage irrigation. The AI recommendations saved us thousands in water costs.',
      rating: 5,
    },
    {
      name: 'Sarah Mohamed',
      role: 'Agricultural Engineer',
      content: 'The soil analysis feature is incredibly accurate. It helped us optimize our crop selection perfectly.',
      rating: 5,
    },
    {
      name: 'Omar Ali',
      role: 'Greenhouse Manager',
      content: 'Simple to use, powerful insights. Our crop yields improved significantly in just one season.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AgroSmart</h1>
                <p className="text-xs text-gray-500">Smart Irrigation Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Features
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Testimonials
              </a>
              <button
                onClick={handleGetStarted}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Features
                </a>
                <a href="#benefits" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Benefits
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Testimonials
                </a>
                <button
                  onClick={handleGetStarted}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium w-full"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                <Zap className="h-4 w-4 mr-2" />
                Smart Farming Revolution
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transform Your Farm with{' '}
                <span className="text-green-500">AI-Powered</span>{' '}
                Irrigation
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Optimize water usage, increase crop yields, and reduce manual labor with our 
                intelligent irrigation management system powered by advanced AI technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleGetStarted}
                  className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
                >
                  <span>Go to website</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900">40%</div>
                  <div className="text-sm text-gray-600">Water Savings</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900">25%</div>
                  <div className="text-sm text-gray-600">Yield Increase</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-bold text-gray-900">1000+</div>
                  <div className="text-sm text-gray-600">Happy Farmers</div>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Leaf className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Field Dashboard</h3>
                    <p className="text-sm text-gray-500">Real-time monitoring</p>
                  </div>
                </div>

                {/* Mock Dashboard Content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Soil Moisture</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-2">73%</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">AI Health</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mt-2">Excellent</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">North Field - Tomatoes</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">2.5 hectares • Auto irrigation</div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
                <Droplets className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your irrigation system intelligently and efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Choose AgroSmart?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of farmers who have transformed their operations with our intelligent irrigation platform.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGetStarted}
                  className="bg-green-500 text-white px-8 py-4 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center space-x-2"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-6">
                  <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <Globe className="h-8 w-8 text-green-500 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Global Impact</h3>
                </div>

                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-500">50K+</div>
                    <div className="text-sm text-gray-600">Hectares Managed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-500">2M+</div>
                    <div className="text-sm text-gray-600">Liters Saved</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-500">15+</div>
                    <div className="text-sm text-gray-600">Countries</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-500">98%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Farmers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real farmers who transformed their operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of farmers using AgroSmart to optimize their irrigation and increase yields.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-green-500 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-bold text-lg flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-green-500 transition-colors font-bold text-lg">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AgroSmart</h3>
                  <p className="text-sm text-gray-400">Smart Irrigation Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Revolutionizing agriculture with AI-powered irrigation systems. 
                Help farmers save water, increase yields, and build sustainable operations.
              </p>
              <div className="text-sm text-gray-500">
                <p>Built with ❤️ by computer science students</p>
                <p>Making smart farming accessible to everyone</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Water Management</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AgroSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}