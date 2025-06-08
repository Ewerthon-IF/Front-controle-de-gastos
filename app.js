const mysql = require('mysql');
const express = require('express');
const cors = require('cors');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'macacorosa',
  database: 'controle'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL!');
});

const app = express();

// CORS deve ser o primeiro middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.options('*', cors()); // Habilita preflight para todas as rotas
app.use(express.json());

// Middleware para garantir header CORS em todas as respostas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// GET /regioes
app.get('/regioes', (req, res) => {
  db.query('SELECT * FROM regioes', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar regiões' });
    res.json(results);
  });
});

// GET /revenda/regiao/:regiao_id
app.get('/revenda/regiao/:regiao_id', (req, res) => {
  const regiaoId = req.params.regiao_id;
  db.query('SELECT * FROM revendas WHERE regiao_id = ?', [regiaoId], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar telhas de revenda' });
    res.json(results);
  });
});

// PATCH para atualizar estoque de investimento
app.patch('/investimentos/quantidade', (req, res) => {
  const { telha_id, regiao_id, quantidade } = req.body;
  if (!telha_id || !regiao_id || quantidade === undefined) {
    return res.status(400).json({ mensagem: 'Dados incompletos' });
  }
  db.query(
    'UPDATE investimentos SET quantidade = quantidade + ? WHERE telha_id = ? AND regiao_id = ?',
    [quantidade, telha_id, regiao_id],
    (err) => {
      if (err) return res.status(500).json({ mensagem: 'Erro ao atualizar estoque de investimento' });
      return res.json({ mensagem: 'Estoque de investimento atualizado com sucesso!' });
    }
  );
});

// PATCH para atualizar estoque de revenda (venda)
app.patch('/revenda/quantidade', (req, res) => {
  const { telha_id, regiao_id, quantidade } = req.body;
  if (!telha_id || !regiao_id || quantidade === undefined) {
    return res.status(400).json({ mensagem: 'Dados incompletos' });
  }
  // Buscar atributos da telha selecionada
  db.query('SELECT nome_telha, cor, comprimento, largura FROM revendas WHERE telha_id = ? AND regiao_id = ?', [telha_id, regiao_id], (err, results) => {
    if (err || !results.length) return res.status(400).json({ mensagem: 'Telha de revenda não encontrada para a região.' });
    const { nome_telha, cor, comprimento, largura } = results[0];
    // Buscar investimento central (sem filtrar por região)
    db.query('SELECT quantidade FROM investimentos WHERE nome_telha = ? AND cor = ? AND comprimento = ? AND largura = ?', [nome_telha, cor, comprimento, largura], (err2, invs) => {
      if (err2 || !invs.length) return res.status(400).json({ mensagem: 'Investimento não encontrado para a telha informada.' });
      if (invs[0].quantidade < quantidade) {
        return res.status(400).json({ mensagem: 'Estoque de investimento insuficiente. Estoque atual: ' + invs[0].quantidade + ', solicitado: ' + quantidade });
      }
      // Subtrai do investimento central
      db.query('UPDATE investimentos SET quantidade = quantidade - ? WHERE nome_telha = ? AND cor = ? AND comprimento = ? AND largura = ?', [quantidade, nome_telha, cor, comprimento, largura], (err3) => {
        if (err3) return res.status(500).json({ mensagem: 'Erro ao atualizar estoque de investimento' });
        // Soma na revenda da região correta
        db.query('UPDATE revendas SET quantidade = quantidade + ? WHERE telha_id = ? AND regiao_id = ?', [quantidade, telha_id, regiao_id], (err4) => {
          if (err4) return res.status(500).json({ mensagem: 'Erro ao atualizar estoque de revenda' });
          return res.json({ mensagem: 'Venda registrada com sucesso! Estoque atualizado.' });
        });
      });
    });
  });
});

// GET relatório financeiro detalhado
app.get('/relatorios/financeiro', (req, res) => {
  db.query('SELECT * FROM investimentos', (err, investimentos) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar investimentos' });
    db.query('SELECT * FROM revendas', (err2, revendas) => {
      if (err2) return res.status(500).json({ erro: 'Erro ao buscar revendas' });
      // Agrupar por regiao e nomeTelha
      const relatorioMap = {};
      investimentos.forEach(inv => {
        const key = `${inv.nome_telha}`;
        if (!relatorioMap[key]) {
          relatorioMap[key] = {
            nomeTelha: inv.nome_telha,
            totalGasto: 0,
            totalRecebido: 0,
            saldoFinanceiro: 0,
            movimentacoes: []
          };
        }
        relatorioMap[key].totalGasto += (inv.preco_compra || 0) * (inv.quantidade || 0);
        relatorioMap[key].movimentacoes.push({
          tipo: 'compra',
          quantidade: inv.quantidade,
          preco: inv.preco_compra,
          data: inv.data_compra || new Date()
        });
      });
      revendas.forEach(rev => {
        const key = `${rev.regiao_id}-${rev.nome_telha}`;
        if (!relatorioMap[key]) {
          relatorioMap[key] = {
            regiao: rev.regiao_id,
            nomeTelha: rev.nome_telha,
            totalGasto: 0,
            totalRecebido: 0,
            saldoFinanceiro: 0,
            movimentacoes: []
          };
        }
        relatorioMap[key].totalRecebido += (rev.preco_revenda || 0) * (rev.quantidade || 0);
        relatorioMap[key].movimentacoes.push({
          tipo: 'venda',
          quantidade: rev.quantidade,
          preco: rev.preco_revenda,
          data: rev.data_venda || new Date()
        });
      });
      // Calcular saldoFinanceiro
      Object.values(relatorioMap).forEach(item => {
        item.saldoFinanceiro = (item.totalRecebido || 0) - (item.totalGasto || 0);
      });
      res.json(Object.values(relatorioMap));
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});