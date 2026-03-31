// backend/routes/profilesense.js
const express = require('express');
const router = express.Router();
const profileSenseService = require('../services/profilesense');

// Registrar interação
router.post('/register', async (req, res) => {
  try {
    const { userId, ...dados } = req.body;
    profileSenseService.registrarInteracao(userId, dados);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Classificar usuário
router.get('/classify', async (req, res) => {
  try {
    const { userId } = req.query;
    const classificacao = profileSenseService.classificar(userId);
    res.json(classificacao);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;