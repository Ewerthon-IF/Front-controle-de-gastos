import axios from 'axios';
import { useEffect, useState } from 'react';

function RelatorioFinanceiro() {
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://back-controle-de-gastos-production.up.railway.app/relatorios/financeiro');
      setRelatorio(res.data.relatorio || res.data || []);
    } catch {
      setRelatorio([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRelatorio();
  }, []);

const zerarEstoqueVendas = async () => {
  if (window.confirm('Tem certeza que deseja zerar todo o estoque e apagar o relatório financeiro?')) {
    try {
      await axios.post('https://back-controle-de-gastos-production.up.railway.app/revenda/zerar-tudo');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao zerar estoques e relatório financeiro:', error);
    }
  }
};

  if (loading) return <p>Carregando relatório...</p>;
  if (!Array.isArray(relatorio) || relatorio.length === 0)
    return (
      <div style={{ maxWidth: '1000px', margin: '2rem auto', textAlign: 'center', background: '#222', borderRadius: 10, padding: 24 }}>
        <h3>Relatório Financeiro</h3>
        <p style={{ color: '#f00' }}>Relatório indisponível.</p>
      </div>
    );

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', textAlign: 'left', background: '#222', color: '#fff', borderRadius: 10, padding: 24 }}>
      <h3>Relatório Financeiro</h3>
      <button onClick={zerarEstoqueVendas} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 700, fontSize: 16, marginBottom: 24, cursor: 'pointer' }}>
        Zerar Estoque de Vendas
      </button>
      <div
        style={{
          display: 'flex',
          gap: 32,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 40,
        }}
      >
        <div style={{ flex: 1, minWidth: 350, textAlign: 'left' }}>
          <h4 style={{ color: '#ffd700' }}>Relatório de Compras</h4>
          {relatorio.filter(item => item.movimentacoes.some(mov => mov.tipo === 'compra')).map((item, idx) => (
            <div key={'compra-' + item.regiao + '-' + item.nomeTelha + '-' + idx} style={{ marginBottom: 32, padding: 16, background: '#333', borderRadius: 8, boxShadow: '0 2px 8px #0001', color: '#fff', overflowX: 'auto' }}>
              <p><strong>Telha:</strong> {item.nomeTelha}</p>
              <p><strong>Total Gasto:</strong> {Number(item.totalGasto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <h5>Movimentações:</h5>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 400, background: '#222', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Quant</th>
                      <th>Preço</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.movimentacoes.filter(mov => mov.tipo === 'compra').map((mov, i) => (
                      <tr key={'compra-' + mov.data + '-' + i} style={{ height: 40 }}>
                        <td style={{ paddingBottom: 24 }}>{mov.tipo}</td>
                        <td style={{ paddingBottom: 24, paddingLeft: 24 }}>{mov.quantidade}</td>
                        <td style={{ paddingBottom: 24 }}>{Number(mov.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ paddingBottom: 24 }}>{new Date(mov.data).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 350, textAlign: 'left' }}>
          <h4 style={{ color: '#90ee90' }}>Relatório de Vendas</h4>
          {relatorio.filter(item => item.movimentacoes.some(mov => mov.tipo === 'venda')).map((item, idx) => (
            <div key={'venda-' + item.regiao + '-' + item.nomeTelha + '-' + idx} style={{ marginBottom: 32, padding: 16, background: '#333', borderRadius: 8, boxShadow: '0 2px 8px #0001', color: '#fff', overflowX: 'auto' }}>
              <h4>Região: {item.regiao}</h4>
              <p><strong>Telha:</strong> {item.nomeTelha}</p>
              <p><strong>Total Recebido:</strong> {Number(item.totalRecebido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <h5>Movimentações:</h5>
              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 400, background: '#222', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Quant</th>
                      <th>Preço</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.movimentacoes.filter(mov => mov.tipo === 'venda').map((mov, i) => (
                      <tr key={'venda-' + mov.data + '-' + i}>
                        <td style={{ paddingBottom: 24 }}>{mov.tipo}</td>
                        <td style={{ paddingBottom: 24, paddingLeft: 24 }}>{mov.quantidade}</td>
                        <td style={{ paddingBottom: 24 }}>{Number(mov.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td style={{ paddingBottom: 24 }}>{new Date(mov.data).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          marginTop: 32,
          background: '#111',
          borderRadius: 12,
          padding: 24,
          color: '#fff',
          boxShadow: '0 2px 8px #0002',
          maxWidth: 1200,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <h4 style={{ color: '#ffd700', marginBottom: 24, fontSize: 32 }}>Lucro Total</h4>
        <div
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            flexDirection: 'row',
            gap: 32,
            alignItems: 'stretch',
            justifyContent: 'space-between',
          }}
        >
          {/* Bloco Vendas por Região */}
          <div style={{ minWidth: 320, flex: 1, background: '#1b2a1b', borderRadius: 10, padding: 24, boxShadow: '0 1px 4px #0004', textAlign: 'center', height: '100%' }}>
            <h5 style={{ color: '#90ee90', margin: 0, marginBottom: 12, fontSize: 20 }}>Vendas por Região</h5>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 8 }}>
              {Object.entries(relatorio.reduce((acc, item) => {
                if (item.regiao && item.regiao !== 'Desconhecida' && item.regiao !== null && item.regiao !== undefined && item.regiao !== '') {
                  acc[item.regiao] = (acc[item.regiao] || 0) + (Number(item.totalRecebido) || 0);
                }
                return acc;
              }, {})).map(([regiao, valor]) => (
                <li key={regiao} style={{ color: '#fff', marginBottom: 4, fontSize: 18 }}>
                  <span style={{ color: '#90ee90' }}>{regiao}:</span> {Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </li>
              ))}
              <li style={{ color: '#ffd700', fontWeight: 700, marginTop: 12, fontSize: 20, listStyle: 'none' }}>
                Total de vendas por região: {Object.values(relatorio.reduce((acc, item) => {
                  if (item.regiao && item.regiao !== 'Desconhecida' && item.regiao !== null && item.regiao !== undefined && item.regiao !== '') {
                    acc[item.regiao] = (acc[item.regiao] || 0) + (Number(item.totalRecebido) || 0);
                  }
                  return acc;
                }, {})).reduce((soma, valor) => soma + valor, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </li>
            </ul>
          </div>
          {/* Bloco Gastos, Conta, Lucro */}
          <div style={{ minWidth: 420, flex: 2, background: '#181818', borderRadius: 10, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 4px #0004', height: '100%' }}>
            <div style={{ fontSize: 20, color: '#ffd700', marginBottom: 8 }}>
              Gastos: {relatorio.reduce((acc, item) => acc + (Number(item.totalGasto) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>Conta:</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{relatorio.reduce((acc, item) => acc + (Number(item.totalRecebido) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>-</span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{relatorio.reduce((acc, item) => acc + (Number(item.totalGasto) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div style={{ color: (relatorio.reduce((acc, item) => acc + (Number(item.totalRecebido) || 0), 0) - relatorio.reduce((acc, item) => acc + (Number(item.totalGasto) || 0), 0)) < 0 ? '#ff4444' : '#90ee90', fontWeight: 700, fontSize: 32, marginTop: 12 }}>
              Lucro: {(relatorio.reduce((acc, item) => acc + (Number(item.totalRecebido) || 0), 0) - relatorio.reduce((acc, item) => acc + (Number(item.totalGasto) || 0), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelatorioFinanceiro;
