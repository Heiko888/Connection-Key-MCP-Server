/**
 * Coach Readings Create Page
 * Seite für das Erstellen von Readings und Beziehungsanalysen
 */

import { RelationshipAnalysisGenerator } from '@/components/RelationshipAnalysisGenerator';
import { ReadingGenerator } from '@/components/ReadingGenerator';

export default function CreateReadingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Readings & Analysen erstellen</h1>
          <p className="text-gray-600">
            Erstelle Human Design Readings oder tiefe Beziehungsanalysen
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <a
                href="#readings"
                className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
              >
                Standard Readings
              </a>
              <a
                href="#relationship"
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Beziehungsanalyse
              </a>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Standard Readings */}
          <div id="readings">
            <ReadingGenerator />
          </div>

          {/* Relationship Analysis */}
          <div id="relationship" className="mt-12">
            <RelationshipAnalysisGenerator />
          </div>
        </div>
      </div>
    </div>
  );
}
