import FormEstoque from './views/cadastroTelhas/FormEstoque';
import InvestimentosList from './views/cadastroTelhas/InvestimentosList';

function App() {
  return (
    <div>
      <InvestimentosList />
      <FormEstoque tipo="revenda" />
    </div>
  );
}

export default App;