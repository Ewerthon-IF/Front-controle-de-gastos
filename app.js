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

// PATCH /revenda/quantidade
app.patch('/revenda/quantidade', (req, res) => {
  const { id_revenda, regiao_id, telha_id, quantidade } = req.body;
  if (!id_revenda || !regiao_id || !telha_id || quantidade === undefined) {
    return res.status(400).json({ mensagem: 'Dados incompletos' });
  }
  // Atualiza a quantidade da revenda pela região e id da revenda
  db.query(
    'UPDATE revendas SET quantidade = quantidade + ? WHERE id = ? AND regiao_id = ?',
    [quantidade, id_revenda, regiao_id],
    (err, result) => {
      if (err) return res.status(500).json({ mensagem: 'Erro ao atualizar estoque de revenda' });
      // Subtrai do investimento pelo telha_id
      db.query(
        'UPDATE investimentos SET quantidade = quantidade - ? WHERE telha_id = ?',
        [quantidade, telha_id],
        (err2, result2) => {
          if (err2) return res.status(500).json({ mensagem: 'Erro ao atualizar estoque de investimento' });
              res.json({ mensagem: 'Estoque de revenda e investimento atualizado com sucesso!' });
            }
          );
        }
      );
});

// GET /investimentos
app.get('/investimentos', (req, res) => {
  db.query('SELECT * FROM investimentos', (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar investimentos' });
    res.json(results);
  });
});

// PATCH /investimentos/quantidade
app.patch('/investimentos/quantidade', (req, res) => {
  const { telha_id, quantidade } = req.body;
  if (!telha_id || quantidade === undefined) {
    return res.status(400).json({ mensagem: 'Dados incompletos' });
  }
  db.query(
    'UPDATE investimentos SET quantidade = quantidade + ? WHERE telha_id = ?',
    [quantidade, telha_id],
    (err, result) => {
      if (err) return res.status(500).json({ mensagem: 'Erro ao atualizar estoque de investimento' });
      res.json({ mensagem: 'Estoque de investimento atualizado com sucesso!' });
    }
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});