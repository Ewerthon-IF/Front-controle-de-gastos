import { useRef } from 'react';
import './App.css';
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
    <div className="App">
      <header className="App-header">
        <h2>Cadastro e Atualização de Estoque de Telhas</h2>
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

      </header>
    </div>
  );
}

export default App;
