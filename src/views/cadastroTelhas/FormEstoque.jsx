import axios from 'axios';
import { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Dropdown, Input, Message, Segment, Form as UIForm } from 'semantic-ui-react';

const FormEstoque = ({ tipo, onEstoqueAtualizado }) => {
  const [form, setForm] = useState({
    telha_id: '',
    quantidade: '',
    regiao_id: ''
  });
  const [mensagem, setMensagem] = useState('');
  const [regioes, setRegioes] = useState([]);
  const [telhas, setTelhas] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/regioes')
      .then(res => setRegioes(res.data))
      .catch(() => setRegioes([]));
  }, []);

  useEffect(() => {
    if (tipo === 'investimento') {
      axios.get('http://localhost:3001/investimentos')
        .then(res => setTelhas(res.data))
        .catch(() => setTelhas([]));
    } else if (form.regiao_id) {
      axios.get(`http://localhost:3001/revenda/regiao/${form.regiao_id}`)
        .then(res => setTelhas(res.data))
        .catch(() => setTelhas([]));
    } else {
      setTelhas([]);
    }
  }, [form.regiao_id, tipo]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Busca a telha selecionada na revenda
    const telhaRevenda = telhas.find(t => String(t.telha_id || t.id) === String(form.telha_id));
    if (!telhaRevenda) {
      setMensagem('Telha não encontrada para a região selecionada.');
      return;
    }
    const payload = {
      id: telhaRevenda.id, // id da revenda
      regiao_id: form.regiao_id,
      telha_id: telhaRevenda.telha_id || telhaRevenda.id, // pode ser string ou number
      quantidade: Number(form.quantidade)
    };
    try {
      const res = await axios.patch('http://localhost:3001/revenda/quantidade', payload);
      setMensagem(res.data.mensagem || 'Estoque atualizado com sucesso!');
      setTimeout(() => {
        setMensagem('');
        if (onEstoqueAtualizado) onEstoqueAtualizado();
      }, 1500);
    } catch (err) {
      setMensagem(err.response?.data?.message || err.response?.data?.mensagem || 'Erro ao atualizar estoque de revenda');
    }
  };

  // Busca a telha selecionada
  const regiaoOptions = regioes.map(r => ({
    key: r.regiao_id || r.id,
    value: r.regiao_id || r.id,
    text: r.nome
  }));
  const telhaOptions = telhas.map(t => ({
    key: t.telha_id || t.id,
    value: t.telha_id || t.id,
    text: `${t.nome_telha} - ${t.comprimento} x ${t.largura} - ${t.cor}`
  }));
  return (
    <Segment style={{ maxWidth: 400, margin: '2rem auto', background: '#f9fafb', borderRadius: 8, boxShadow: '0 2px 8px #0001', backgroundColor: 'black' }}>
      <h3 style={{ color: 'white' }}>{tipo === 'investimento' ? 'Atualizar Estoque de Investimento' : 'Atualizar Estoque de Revenda'}</h3>
      <UIForm onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
        <UIForm.Field required>
          <label style={{ color: 'white' }}>Região</label>
          <Dropdown
            placeholder="Selecione a Região"
            fluid
            selection
            options={regiaoOptions}
            name="regiao_id"
            value={form.regiao_id}
            onChange={(_, data) => handleDropdownChange('regiao_id', data.value)}
          />
        </UIForm.Field>
        <UIForm.Field required>
          <label style={{ color: 'white' }}>Telha</label>
          <Dropdown
            placeholder="Selecione a Telha"
            fluid
            selection
            options={telhaOptions.map(opt => ({ key: String(opt.key), value: String(opt.value), text: opt.text }))}
            value={form.telha_id}
            onChange={(_, data) => handleChange({ target: { name: 'telha_id', value: data.value } })}
            disabled={!form.regiao_id}
          />
        </UIForm.Field>
        <UIForm.Field required>
          <label style={{ color: 'white' }}>Quantidade</label>
          <Input
            name="quantidade"
            type="number"
            placeholder="Quantidade"
            value={form.quantidade}
            onChange={handleChange}
            min={1}
          />
        </UIForm.Field>
        <Button primary type="submit">
          {tipo === 'investimento' ? 'Atualizar Estoque de Investimento' : 'Atualizar Estoque de Revenda'}
        </Button>
        {mensagem && <Message content={mensagem} />}
      </UIForm>
    </Segment>
  );
};

export default FormEstoque;
