import { useRef } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import EditarPrecoTelhaInvestimento from './views/cadastroTelhas/EditarPrecoTelhaInvestimento';
import EditarPrecoTelhaPorRegiao from './views/cadastroTelhas/EditarPrecoTelhaPorRegiao';
import FormEstoque from './views/cadastroTelhas/FormEstoque';
import FormInvestimentoEstoque from './views/cadastroTelhas/FormInvestimentoEstoque';
import InvestimentosList from './views/cadastroTelhas/InvestimentosList';
import RelatorioFinanceiro from './views/cadastroTelhas/RelatorioFinanceiro';
import RevendasList from './views/cadastroTelhas/RevendasList';


function App() {
  const relatorioRef = useRef();

  // Função para atualizar o relatório dinamicamente
  const atualizarRelatorio = () => {
    if (relatorioRef.current && relatorioRef.current.fetchRelatorio) {
      relatorioRef.current.fetchRelatorio();
    }
  };

  return (
    <Router>
      <div className="App">
        <div style={{ width: '100%', background: '#181818', padding: '18px 0', marginBottom: 32, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, borderRadius: 0, boxShadow: '0 2px 8px #0002', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
          <Link to="/" style={{ color: '#ffd700', fontWeight: 700, fontSize: 18, textDecoration: 'none', padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s' }}>Início</Link>
          <Link to="/editar-preco-telha" style={{ color: '#ffd700', fontWeight: 700, fontSize: 18, textDecoration: 'none', padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s' }}>Editar Preço das Revendas</Link>
          <Link to="/editar-preco-investimento" style={{ color: '#ffd700', fontWeight: 700, fontSize: 18, textDecoration: 'none', padding: '8px 18px', borderRadius: 6, transition: 'background 0.2s' }}>Editar Preço dos Investimentos</Link>
        </div>
        <div style={{ height: 68,  }} />
        <header className="App-header">
          <h2 style={{ marginTop: 68 }}>Cadastro e Atualização de Estoque de Telhas</h2>
          <Routes>
            <Route path="/" element={
              <>
                <div style={{ maxWidth: 900, margin: '2rem auto' }}>
                  <InvestimentosList />
                </div>
                <div style={{ maxWidth: 1000, margin: '2rem auto', color: '#333' }}>
                  <RevendasList />
                </div>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', color: '#333' }}>
                  <FormEstoque tipo="revenda" onEstoqueAtualizado={atualizarRelatorio} />
                  <FormInvestimentoEstoque onEstoqueAtualizado={atualizarRelatorio} />
                </div>
                <div style={{ margin: '2rem auto' }}>
                  <RelatorioFinanceiro ref={relatorioRef} />
                </div>
              </>
            } />
            <Route path="/editar-preco-telha" element={<EditarPrecoTelhaPorRegiao />} />
            <Route path="/editar-preco-investimento" element={<EditarPrecoTelhaInvestimento />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
