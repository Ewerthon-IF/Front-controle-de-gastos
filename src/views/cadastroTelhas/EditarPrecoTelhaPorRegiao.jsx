import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Message, Segment, Form as UIForm } from 'semantic-ui-react';

function EditarPrecoTelhaPorRegiao() {
    const [regioes, setRegioes] = useState([]);
    const [telhas, setTelhas] = useState([]);
    const [regiaoId, setRegiaoId] = useState('');
    const [telhaId, setTelhaId] = useState('');
    const [preco, setPreco] = useState('');
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        axios.get('https://back-controle-de-gastos-production.up.railway.app/regioes').then(res => setRegioes(res.data));
    }, []);

    useEffect(() => {
        if (regiaoId) {
            axios.get(`https://back-controle-de-gastos-production.up.railway.app/revenda/regiao/${regiaoId}`).then(res => setTelhas(res.data));
        } else {
            setTelhas([]);
        }
        setTelhaId('');
        setPreco('');
    }, [regiaoId]);

    useEffect(() => {
        if (telhaId) {
            const t = telhas.find(t => String(t.id) === String(telhaId));
            setPreco(t ? String(t.preco_revenda) : '');
        } else {
            setPreco('');
        }
    }, [telhaId, telhas]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const telha = telhas.find(t => String(t.id) === String(telhaId));
        if (!telha || !regiaoId || preco.trim() === '') {
            setMensagem('Preencha todos os campos.');
            return;
        }

        const precoConvertido = parseFloat(preco.replace(',', '.'));
        if (isNaN(precoConvertido)) {
            setMensagem('Preço inválido.');
            return;
        }

        const body = {
            id: telha.id,
            regiao_id: Number(regiaoId),
            novoPreco: precoConvertido
        };

        try {
            await axios.patch('https://back-controle-de-gastos-production.up.railway.app/revenda/preco', body);
            setMensagem('Preço atualizado com sucesso!');
        } catch (err) {
            console.error(err);
            setMensagem('Erro ao atualizar preço');
        }
    };

  const regiaoOptions = regioes.map(r => ({ key: r.id, value: r.id, text: r.nome }));
  const telhaOptions = telhas.map(t => ({ key: t.id, value: t.id, text: `${t.nome_telha} - ${t.comprimento}x${t.largura} - ${t.cor}` }));

  return (
      <Segment style={{ maxWidth: 500, margin: '2rem auto', background: '#222', borderRadius: 8, color: '#fff' }}>
        <h3>Editar Preço de Telha por Região</h3>
        <UIForm onSubmit={handleSubmit}>
          <UIForm.Field required>
            <label style={{ color: '#fff' }}>Região</label>
            <Dropdown
              placeholder="Selecione a Região"
              fluid
              selection
              options={regiaoOptions}
              value={regiaoId}
              onChange={(_, data) => setRegiaoId(data.value)}
            />
          </UIForm.Field>
          <UIForm.Field required>
            <label style={{ color: '#fff' }}>Telha</label>
            <Dropdown
              placeholder="Selecione a Telha"
              fluid
              selection
              options={telhaOptions}
              value={telhaId}
              onChange={(_, data) => setTelhaId(data.value)}
              disabled={!regiaoId}
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
              placeholder="Novo preço de revenda"
            />
          </UIForm.Field>
          <Button primary type="submit">Salvar Preço</Button>
          {mensagem && <Message content={mensagem} />}
        </UIForm>
      </Segment>
  );
};

export default EditarPrecoTelhaPorRegiao;
