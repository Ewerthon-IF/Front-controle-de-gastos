import axios from 'axios';
import { useEffect, useState } from 'react';

function RelatorioFinanceiro() {
  const [relatorio, setRelatorio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatorio() {
      try {
        const response = await axios.get('http://localhost:3001/relatorios/financeiro');
        setRelatorio(response.data);
      } catch (error) {
        console.error('Erro ao buscar relatório financeiro:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatorio();
  }, []);

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
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 40 }}>
        <div style={{ flex: 1, minWidth: 350, textAlign: 'left' }}>
          <h4 style={{ color: '#ffd700' }}>Relatório de Compras</h4>
          {relatorio.filter(item => item.movimentacoes.some(mov => mov.tipo === 'compra')).map((item, idx) => (
            <div key={'compra-' + item.regiao + '-' + item.nomeTelha + '-' + idx} style={{ marginBottom: 32, padding: 16, background: '#333', borderRadius: 8, boxShadow: '0 2px 8px #0001', color: '#fff' }}>
              <h4>Região: {item.regiao}</h4>
              <p><strong>Telha:</strong> {item.nomeTelha}</p>
              <p><strong>Total Gasto:</strong> {Number(item.totalGasto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <h5>Movimentações:</h5>
              <table style={{ width: '100%', background: '#222', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Quant</th>
                    <th>Preço</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <br />
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
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 350, textAlign: 'left' }}>
          <h4 style={{ color: '#90ee90' }}>Relatório de Vendas</h4>
          {relatorio.filter(item => item.movimentacoes.some(mov => mov.tipo === 'venda')).map((item, idx) => (
            <div key={'venda-' + item.regiao + '-' + item.nomeTelha + '-' + idx} style={{ marginBottom: 32, padding: 16, background: '#333', borderRadius: 8, boxShadow: '0 2px 8px #0001', color: '#fff' }}>
              <h4>Região: {item.regiao}</h4>
              <p><strong>Telha:</strong> {item.nomeTelha}</p>
              <p><strong>Total Recebido:</strong> {Number(item.totalRecebido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <h5>Movimentações:</h5>
              <table style={{ width: '100%', background: '#222', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Quant</th>
                    <th>Preço</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <br />
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
          ))}
        </div>
      </div>
      <div style={{ marginTop: 32, background: '#111', borderRadius: 8, padding: 16, color: '#fff' }}>
        <h4 style={{ color: '#ffd700' }}>Lucro Total</h4>
        <p style={{ fontSize: 18 }}>
          Gastos: {relatorio.reduce((acc, item) => acc + (Number(item.totalGasto) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<br />
          Vendas: {relatorio.reduce((acc, item) => acc + (Number(item.totalRecebido) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<br />
          Conta: {relatorio.reduce((acc, item) => acc + (Number(item.totalRecebido) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} - {relatorio.reduce((acc, item) => acc + (Number(item.totalGasto) || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<br />
          Lucro: {(relatorio.reduce((acc, item) => acc + (Number(item.totalRecebido) || 0), 0) - relatorio.reduce((acc, item) => acc + (Number(item.totalGasto) || 0), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
    </div>
  );
}

export default RelatorioFinanceiro;
