import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

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
        
        <div className="grid md:grid-cols-2 gap-8 items-start">
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
                  <span>Einfache manuelle Punkteingabe</span>
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
          
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Schnellstart</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-bold text-lg">1. Spieler einrichten</h3>
                  <p className="text-gray-600">Füge einen oder mehrere Spieler hinzu, um zu beginnen.</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-bold text-lg">2. Spielmodus wählen</h3>
                  <p className="text-gray-600">Wähle zwischen 501, 301 oder Cricket.</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-bold text-lg">3. Punkte erfassen</h3>
                  <p className="text-gray-600">Verwende die Kamera oder gib Punkte manuell ein.</p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-bold text-lg">4. Statistiken einsehen</h3>
                  <p className="text-gray-600">Verfolge Durchschnitte, Checkouts und mehr.</p>
                </div>
              </div>
              
              <div className="mt-6">
                <Link to="/setup">
                  <Button variant="primary" fullWidth>
                    Jetzt starten
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