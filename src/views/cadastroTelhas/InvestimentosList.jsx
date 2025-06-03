import axios from 'axios';
import { useEffect, useState } from 'react';
import { Message, Segment, Table } from 'semantic-ui-react';

const InvestimentosList = () => {
  const [investimentos, setInvestimentos] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/investimentos')
      .then(res => setInvestimentos(res.data))
      .catch(() => setErro('Erro ao buscar investimentos'));
  }, []);

  return (
    <Segment style={{maxWidth: 1000, margin: '2rem auto', background: '#f9fafb', borderRadius: 8, boxShadow: '0 2px 8px #0001', backgroundColor: 'black'}}>
      <h3 style={{marginBottom: 20}}>Lista de Investimentos</h3>
      {erro && <Message negative>{erro}</Message>}
      <Table celled striped compact size="small">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell>Comprimento</Table.HeaderCell>
            <Table.HeaderCell>Largura</Table.HeaderCell>
            <Table.HeaderCell>Cor</Table.HeaderCell>
            <Table.HeaderCell>Quantidade</Table.HeaderCell>
            <Table.HeaderCell>Preço de Compra</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {investimentos.map((inv, idx) => (
            <Table.Row key={String(inv.telha_id) + '-' + idx}>
              <Table.Cell>{inv.nome_telha}</Table.Cell>
              <Table.Cell>{inv.comprimento}</Table.Cell>
              <Table.Cell>{inv.largura}</Table.Cell>
              <Table.Cell>{inv.cor}</Table.Cell>
              <Table.Cell>{inv.quantidade}</Table.Cell>
              <Table.Cell>R$ {Number(inv.preco_compra).toFixed(2)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Segment>
  );
};

export default InvestimentosList;
