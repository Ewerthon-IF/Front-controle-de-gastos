import axios from 'axios';
import { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Dropdown, Input, Message, Segment, Form as UIForm } from 'semantic-ui-react';

const FormEstoque = ({ tipo }) => {
  const [form, setForm] = useState({
    telha_id: '',
    quantidade: '',
    regiao_id: ''
  });
  const [mensagem, setMensagem] = useState('');
  const [regioes, setRegioes] = useState([]);
  const [telhas, setTelhas] = useState([]);
  const [preco, setPreco] = useState(null);
  const [investimentos, setInvestimentos] = useState([]);

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

  useEffect(() => {
    if (form.telha_id) {
      const telha = telhas.find(t => String(t.id) === String(form.telha_id));
      if (tipo === 'investimento') {
        setPreco(telha?.preco_compra || null);
      } else {
        setPreco(telha?.preco_revenda || null);
      }
    } else {
      setPreco(null);
    }
  }, [form.telha_id, telhas, tipo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const revendaSelecionada = telhas.find(t => String(t.id) === String(form.telha_id));
    if (!revendaSelecionada) {
      setMensagem('Telha de revenda não encontrada');
      return;
    }

    const investimento = await axios.get('http://localhost:3001/investimentos')
      .then(res => res.data.find(i =>
        i.nome_telha === revendaSelecionada.nome_telha &&
        i.cor === revendaSelecionada.cor &&
        i.comprimento === revendaSelecionada.comprimento &&
        i.largura === revendaSelecionada.largura
      ));
    const payload = {
      id: revendaSelecionada.id, 
      regiao_id: form.regiao_id, 
      telha_id: investimento ? investimento.telha_id : revendaSelecionada.telha_id,
      quantidade: Number(form.quantidade)
    };
    try {
      const res = await axios.patch('http://localhost:3001/revenda/quantidade', payload);
      setMensagem(res.data.mensagem || 'Estoque atualizado com sucesso!');
    } catch (err) {
      setMensagem('Erro ao atualizar estoque');
    }
  };

  const regiaoOptions = regioes.map(r => ({
    key: r.regiao_id || r.id,
    value: r.regiao_id || r.id,
    text: r.nome
  }));
  const telhaOptions = telhas.map(t => ({
    key: t.id,
    value: t.id,
    text: `${t.nome_telha} - ${t.comprimento} x ${t.largura} - ${t.cor}`
  }));

  return (
        <Segment style={{maxWidth: 400, margin: '2rem auto', background: '#f9fafb', borderRadius: 8, boxShadow: '0 2px 8px #0001', backgroundColor: 'black'}}>
      {preco !== null && (
        <Message info>
          {tipo === 'investimento' ? 'Preço de compra: R$ ' : 'Preço de revenda: R$ '}
          {Number(preco).toFixed(2)}
        </Message>
      )}
      <UIForm onSubmit={handleSubmit} style={{maxWidth: 400, margin: '0 auto'}}>
        <UIForm.Field required>
          <label style={{color: 'white'}}>Região</label>
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
          <label style={{color: 'white'}}>Telha</label>
          <Dropdown
            placeholder="Selecione a Telha"
            fluid
            selection
            options={telhaOptions}
            name="telha_id"
            value={form.telha_id}
            onChange={(_, data) => handleDropdownChange('telha_id', data.value)}
            disabled={!form.regiao_id}
          />
        </UIForm.Field>
        <UIForm.Field required>
          <label style={{color: 'white'}}>Quantidade</label>
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
