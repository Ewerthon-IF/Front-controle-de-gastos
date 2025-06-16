import axios from 'axios';
import { useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { Button, Dropdown, Input, Message, Form as UIForm } from 'semantic-ui-react';

const Form = () => {
  const [form, setForm] = useState({
    telha_id: '',
    quantidade: '',
    regiao_id: ''
  });
  const [mensagem, setMensagem] = useState('');
  const [regioes, setRegioes] = useState([]);
  const [telhas, setTelhas] = useState([]);

  useEffect(() => {
    // Buscar regiões
    axios.get('https://back-controle-de-gastos-production.up.railway.app/regioes')
      .then(res => setRegioes(res.data))
      .catch(() => setRegioes([]));
  }, []);

  useEffect(() => {
    if (form.regiao_id) {
      // Buscar telhas de revenda por região
      axios.get(`https://back-controle-de-gastos-production.up.railway.app/revenda/regiao/${form.regiao_id}`)
        .then(res => setTelhas(res.data))
        .catch(() => setTelhas([]));
    } else {
      setTelhas([]);
    }
  }, [form.regiao_id]);

  useEffect(() => {
    if (form.telha_id) {
      const telha = telhas.find(t => String(t.id) === String(form.telha_id));
      setPrecoCompra(null); // Não há preco_compra direto na revenda
      setPrecoRevenda(telha?.preco_revenda || null);
    } else {
      setPrecoCompra(null);
      setPrecoRevenda(null);
    }
  }, [form.telha_id, telhas]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const telhaSelecionada = telhas.find(t => String(t.id) === String(form.telha_id));
    if (!telhaSelecionada) {
      setMensagem('Telha não encontrada');
      return;
    }
    const payload = {
      telha_id: telhaSelecionada.id, // Corrigido: envia o id da telha de revenda
      quantidade: Number(form.quantidade)
    };
    try {
      const res = await axios.patch('https://back-controle-de-gastos-production.up.railway.app/revenda/quantidade', payload);
      setMensagem(res.data.mensagem || 'Estoque atualizado com sucesso!');
    } catch (err) {
      setMensagem('Erro ao atualizar estoque');
    }
  };

  // Gerar opções para o Dropdown do Semantic UI
  const regiaoOptions = regioes.map(r => ({
    key: r.regiao_id || r.id,
    value: r.regiao_id || r.id,
    text: r.nome
  }));
  const telhaOptions = telhas.map(t => ({
    key: t.id,
    value: t.id,
    text: `${t.nome_telha} - ${t.comprimento}x${t.largura} - ${t.cor}`
  }));

  return (
    <>
      <UIForm onSubmit={handleSubmit} style={{maxWidth: 400, margin: '0 auto'}}>
        <UIForm.Field required>
          <label>Região</label>
          <Dropdown
            placeholder="Selecione a Região"
            fluid
            selection
            options={regiaoOptions}
            name="regiao_id"
            value={form.regiao_id}
            onChange={(_, data) => handleChange({ target: { name: 'regiao_id', value: data.value } })}
          />
        </UIForm.Field>
        <UIForm.Field required>
          <label>Telha</label>
          <Dropdown
            placeholder="Selecione a Telha"
            fluid
            selection
            options={telhaOptions}
            name="telha_id"
            value={form.telha_id}
            onChange={(_, data) => handleChange({ target: { name: 'telha_id', value: data.value } })}
            disabled={!form.regiao_id}
          />
        </UIForm.Field>
        <UIForm.Field required>
          <label>Quantidade</label>
          <Input
            name="quantidade"
            type="number"
            placeholder="Quantidade"
            value={form.quantidade}
            onChange={handleChange}
            min={1}
          />
        </UIForm.Field>
        <Button primary type="submit">Atualizar Estoque de Revenda</Button>
        {mensagem && <Message content={mensagem} />}
      </UIForm>
    </>
  );
};

export default Form;
