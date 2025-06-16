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

// PATCH para atualizar o preço de revenda de uma telha por região
app.patch('/revenda/preco', (req, res) => {
  const { id, regiao_id, preco_revenda } = req.body;
  if (!id || !regiao_id || preco_revenda === undefined) {
    return res.status(400).json({ mensagem: 'Dados incompletos' });
  }
  db.query(
    'UPDATE revendas SET preco_revenda = ? WHERE id = ? AND regiao_id = ?',
    [preco_revenda, id, regiao_id],
    (err, result) => {
      if (err) return res.status(500).json({ mensagem: 'Erro ao atualizar preço de revenda' });
      res.json({ mensagem: 'Preço de revenda atualizado com sucesso!' });
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

// PATCH para atualizar o preço de compra de uma telha em investimentos
app.patch('/investimentos/preco', (req, res) => {
  const { telha_id, novoPreco } = req.body;
  if (!telha_id || novoPreco === undefined) {
    return res.status(400).json({ mensagem: 'Dados incompletos' });
  }
  db.query(
    'UPDATE investimentos SET preco_compra = ? WHERE telha_id = ?',
    [novoPreco, telha_id],
    (err, result) => {
      if (err) return res.status(500).json({ mensagem: 'Erro ao atualizar preço de compra' });
      res.json({ mensagem: 'Preço de compra atualizado com sucesso!' });
    }
  );
});

// Endpoint para zerar o estoque de todas as telhas em todas as tabelas e apagar o relatório financeiro
app.post('/zerar-tudo', (req, res) => {
  db.query('UPDATE revendas SET quantidade = 0', (err1) => {
    if (err1) return res.status(500).json({ mensagem: 'Erro ao zerar estoque de revendas' });
    db.query('UPDATE investimentos SET quantidade = 0', (err2) => {
      if (err2) return res.status(500).json({ mensagem: 'Erro ao zerar estoque de investimentos' });
      db.query('DELETE FROM movimentacoes', (err3) => {
        if (err3) return res.status(500).json({ mensagem: 'Erro ao apagar relatório financeiro' });
        res.json({ mensagem: 'Todos os estoques e relatório financeiro foram zerados com sucesso!' });
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
      // Agrupar por regiao, nomeTelha, cor, comprimento, largura
      const relatorioMap = {};
      investimentos.forEach(inv => {
        const key = `${inv.nome_telha}-${inv.cor}-${inv.comprimento}-${inv.largura}-${inv.regiao_id || ''}`;
        if (!relatorioMap[key]) {
          relatorioMap[key] = {
            nomeTelha: inv.nome_telha,
            cor: inv.cor,
            comprimento: inv.comprimento,
            largura: inv.largura,
            regiao: inv.regiao_id,
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
        const key = `${rev.nome_telha}-${rev.cor}-${rev.comprimento}-${rev.largura}-${rev.regiao_id}`;
        if (!relatorioMap[key]) {
          relatorioMap[key] = {
            nomeTelha: rev.nome_telha,
            cor: rev.cor,
            comprimento: rev.comprimento,
            largura: rev.largura,
            regiao: rev.regiao_id,
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
      res.json({
        relatorio: Object.values(relatorioMap)
      });
    });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});