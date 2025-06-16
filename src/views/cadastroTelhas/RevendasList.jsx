import axios from 'axios';
import { useEffect, useState } from 'react';
import { Dropdown, Message, Segment, Table } from 'semantic-ui-react';

const RevendasList = () => {
  const [regioes, setRegioes] = useState([]);
  const [regiaoId, setRegiaoId] = useState('');
  const [revendas, setRevendas] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    axios.get('https://back-controle-de-gastos-production.up.railway.app/regioes')
      .then(res => setRegioes(res.data))
      .catch(() => setRegioes([]));
  }, []);

  useEffect(() => {
    if (regiaoId) {
      axios.get(`https://back-controle-de-gastos-production.up.railway.app/revenda/regiao/${regiaoId}`)
        .then(res => setRevendas(res.data))
        .catch(() => setErro('Erro ao buscar revendas'));
    } else {
      setRevendas([]);
    }
  }, [regiaoId]);

  const regiaoOptions = regioes.map(r => ({
    key: r.id,
    value: r.id,
    text: r.nome
  }));

  return (
    <Segment style={{maxWidth: 1000, margin: '2rem auto', background: '#f9fafb', borderRadius: 8, boxShadow: '0 2px 8px #0001', backgroundColor: 'black'}}>
      <h3 style={{marginBottom: 20, color: 'white'}}>Lista de Revendas por Região</h3>
      <Dropdown
        placeholder="Selecione a Região"
        fluid
        selection
        options={regiaoOptions}
        value={regiaoId}
        onChange={(_, data) => setRegiaoId(data.value)}
        style={{marginBottom: 24, maxWidth: 400}}
      />
      {erro && <Message negative>{erro}</Message>}
      {regiaoId && (
        <Table celled striped compact size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Nome</Table.HeaderCell>
              <Table.HeaderCell>Comprimento</Table.HeaderCell>
              <Table.HeaderCell>Largura</Table.HeaderCell>
              <Table.HeaderCell>Cor</Table.HeaderCell>
              <Table.HeaderCell>Quantidade</Table.HeaderCell>
              <Table.HeaderCell>Preço de Revenda</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {revendas.map(rev => (
              <Table.Row key={rev.id}>
                <Table.Cell>{rev.nome_telha}</Table.Cell>
                <Table.Cell>{rev.comprimento}</Table.Cell>
                <Table.Cell>{rev.largura}</Table.Cell>
                <Table.Cell>{rev.cor}</Table.Cell>
                <Table.Cell>{rev.quantidade}</Table.Cell>
                <Table.Cell>R$ {Number(rev.preco_revenda).toFixed(2)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </Segment>
  );
};

export default RevendasList;
