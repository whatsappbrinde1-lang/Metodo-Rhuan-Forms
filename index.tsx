
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Rhuan Forms: Iniciando aplicação...");

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Rhuan Forms Erro: Elemento #root não encontrado no DOM.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Rhuan Forms: Renderização concluída com sucesso.");
  } catch (error) {
    console.error("Rhuan Forms Erro Fatal durante a renderização:", error);
  }
};

// Garante que o DOM esteja carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
