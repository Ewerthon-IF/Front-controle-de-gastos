import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Message, Segment, Form as UIForm } from 'semantic-ui-react';

const FormInvestimentoEstoque = () => {
  const [telhas, setTelhas] = useState([]);
  const [telhaId, setTelhaId] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [precoCompra, setPrecoCompra] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3001/investimentos')
      .then(res => setTelhas(res.data))
      .catch(() => setTelhas([]));
  }, []);

  useEffect(() => {
    if (telhaId) {
      const telha = telhas.find(t => String(t.id) === String(telhaId));
      setPrecoCompra(telha?.preco_compra || null);
    } else {
      setPrecoCompra(null);
    }
  }, [telhaId, telhas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      telha_id: telhaId,
      regiao_id: telhas.find(t => String(t.telha_id || t.id) === String(telhaId))?.regiao_id,
      quantidade: Number(quantidade)
    };
    try {
      const res = await axios.patch('http://localhost:3001/investimentos/quantidade', payload);
      setMensagem(res.data.mensagem || 'Estoque atualizado com sucesso!');
      setTimeout(() => {
        setMensagem('');
        window.location.reload(); // Recarrega a página após atualização
      }, 500);
    } catch (err) {
      setMensagem(err.response?.data?.message || err.response?.data?.mensagem || 'Erro ao atualizar estoque de investimento');
    }
  };

  const telhaOptions = telhas
    .filter(t => t && t.telha_id !== undefined && t.telha_id !== null)
    .map(t => ({
      key: String(t.telha_id),
      value: String(t.telha_id),
      text: `${t.nome_telha || ''} - ${t.comprimento || ''}x${t.largura || ''} - ${t.cor || ''}`
    }));

  return (
    <Segment style={{maxWidth: 400, margin: '2rem auto', background: '#f9fafb', borderRadius: 8, boxShadow: '0 2px 8px #0001', backgroundColor: 'black'}}>
      <h3 style={{color: 'white'}}>Atualizar Estoque de Investimento</h3>
      {precoCompra !== null && (
        <Message info>
          Preço de compra: R$ {Number(precoCompra).toFixed(2)}
        </Message>
      )}
      <UIForm onSubmit={handleSubmit}>
        <UIForm.Field required>
          <label  style={{color: 'white'}}>Telha</label>
          <Dropdown
            placeholder="Selecione a Telha"
            fluid
            selection
            options={telhaOptions}
            value={telhaId}
            onChange={(_, data) => setTelhaId(data.value)}
          />
        </UIForm.Field>
        <UIForm.Field required>
          <label  style={{color: 'white'}}>Quantidade</label>
          <Input
            name="quantidade"
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
            min={1}
          />
        </UIForm.Field>
        <Button primary type="submit" disabled={!telhaId || !quantidade}>Atualizar Estoque</Button>
        {mensagem && <Message content={mensagem} />}
      </UIForm>
    </Segment>
  );
};

export default FormInvestimentoEstoque;
