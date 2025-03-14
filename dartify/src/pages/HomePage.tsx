import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import DartBoard from '../components/dartboard/DartBoard';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Willkommen bei Dartify</h1>
          <p className="text-xl text-gray-600 mb-6">
            Dein intelligentes Kamera-basiertes Dart-Zählsystem
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/setup">
              <Button variant="primary" size="lg">
                Spieler einrichten
              </Button>
            </Link>
            <Link to="/game">
              <Button variant="secondary" size="lg">
                Zum Spiel
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Funktionen</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatische Erkennung von Dart-Würfen mit Kamera</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unterstützung für verschiedene Spielmodi (501, 301, Cricket)</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Spieler-Management und Statistiken</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Interaktives Dartboard für manuelle Punkteingabe</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Checkout-Vorschläge und Spielanalyse</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4">Kamera-Funktionalität</h2>
              <p className="mb-4">
                Die Kamera-Erkennung wird durch ein maschinelles Lernmodell ermöglicht, 
                das Dart-Würfe in Echtzeit erkennt und punktet.
              </p>
              <p className="text-sm text-gray-600">
                Hinweis: In diesem Prototyp werden Dart-Würfe simuliert. 
                Die tatsächliche Kameraerkennung wird in einer späteren Version implementiert.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <DartBoard size={320} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;