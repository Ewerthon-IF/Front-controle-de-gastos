import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Message, Segment, Form as UIForm } from 'semantic-ui-react';

function EditarPrecoTelhaInvestimento() {
  const [telhas, setTelhas] = useState([]);
  const [telhaId, setTelhaId] = useState('');
  const [preco, setPreco] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/investimentos').then(res => setTelhas(res.data));
  }, []);

  useEffect(() => {
    if (telhaId) {
      const t = telhas.find(t => String(t.telha_id || t.id) === String(telhaId));
      setPreco(t ? String(t.preco_compra) : '');
    } else {
      setPreco('');
    }
  }, [telhaId, telhas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const telha = telhas.find(t => String(t.telha_id || t.id) === String(telhaId));
    if (!telha) {
      setMensagem('Selecione a telha.');
      return;
    }
    const precoConvertido = parseFloat(preco.replace(',', '.'));
    if (isNaN(precoConvertido)) {
      setMensagem('Preço inválido.');
      return;
    }
    const body = {
      telha_id: telha.telha_id || telha.id,
      novoPreco: precoConvertido
    };
    try {
      await axios.patch('http://localhost:3001/investimentos/preco', body);
      setMensagem('Preço atualizado com sucesso!');
    } catch (err) {
      setMensagem('Erro ao atualizar preço');
    }
  };

  const telhaOptions = telhas.map(t => ({ key: t.telha_id || t.id, value: t.telha_id || t.id, text: `${t.nome_telha} - ${t.comprimento}x${t.largura} - ${t.cor}` }));

  return (
    <Segment style={{ maxWidth: 500, margin: '2rem auto', background: '#222', borderRadius: 8, color: '#fff' }}>
      <h3>Editar Preço de Telha em Investimentos</h3>
      <UIForm onSubmit={handleSubmit}>
        <UIForm.Field required>
          <label style={{ color: '#fff' }}>Telha</label>
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
          <label style={{ color: '#fff' }}>Novo Preço</label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={preco}
            onChange={e => setPreco(e.target.value)}
            placeholder="Novo preço de compra"
          />
        </UIForm.Field>
        <Button primary type="submit">Salvar Preço</Button>
        {mensagem && <Message content={mensagem} />}
      </UIForm>
    </Segment>
  );
}

export default EditarPrecoTelhaInvestimento;
