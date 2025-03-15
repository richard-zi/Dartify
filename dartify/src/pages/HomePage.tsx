import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Welcome to Dartify</h1>
          <p className="text-xl text-gray-600 mb-6">
            Your intelligent camera-based dart scoring system
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/setup">
              <Button variant="primary" size="lg">
                Setup Players
              </Button>
            </Link>
            <Link to="/game">
              <Button variant="secondary" size="lg">
                To Game
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Features</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic detection of dart throws with camera</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Support for different game modes (501, 301, Cricket)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Player management and statistics</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Simple manual score entry</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Checkout suggestions and game analysis</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Camera Functionality</h2>
              <p className="mb-4">
                The camera detection is enabled by a machine learning model that recognizes 
                dart throws in real-time and scores them.
              </p>
              <p className="text-sm text-gray-600">
                Note: In this prototype, dart throws are simulated. 
                Actual camera detection will be implemented in a later version.
              </p>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Quick Start</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-gray-800">1. Setup Players</h3>
                  <p className="text-gray-600">Add one or more players to begin.</p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-gray-800">2. Choose Game Mode</h3>
                  <p className="text-gray-600">Select between 501, 301, or Cricket.</p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-gray-800">3. Record Scores</h3>
                  <p className="text-gray-600">Use the camera or enter scores manually.</p>
                </div>
                
                <div className="border-l-4 border-indigo-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-gray-800">4. View Statistics</h3>
                  <p className="text-gray-600">Track averages, checkouts, and more.</p>
                </div>
              </div>
              
              <div className="mt-6">
                <Link to="/setup">
                  <Button variant="primary" fullWidth>
                    Start Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;