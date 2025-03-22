import React from 'react';
import { Button } from '../../ui-components/components/Button';

interface PdfViewerProps {
  url: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => (
  <div className="p-6 bg-gray-900 min-h-screen">
    <h1 className="text-2xl font-bold text-white mb-6">Просмотр PDF</h1>
    <Button variant="primary" onClick={() => window.open(url, '_blank')}>
      Открыть PDF
    </Button>
  </div>
);

export default PdfViewer;