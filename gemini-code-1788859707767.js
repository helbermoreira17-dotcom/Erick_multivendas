// Exemplo de middleware e rota flexível para atualização de configurações
const express = require('express');
const app = express();
app.use(express.json());

// Middleware de verificação de Admin
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
}

// Rota genérica para modificar configurações do sistema
app.post('/api/admin/settings', requireAdmin, async (req, res) => {
  const { key, value } = req.body;
  
  try {
    // Atualiza ou insere a chave no banco de dados
    await SystemSettings.upsert({ key, value });
    
    // Log de auditoria
    console.log(`[AUDIT] Admin ${req.user.id} alterou '${key}' para '${value}'`);
    
    res.json({ success: true, message: `Configuração '${key}' atualizada.` });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar configuração.' });
  }
});