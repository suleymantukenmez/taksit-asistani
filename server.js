const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Bağlantısı
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 1. Taksitleri Getir
app.get('/api/installments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('installments')
      .select('*');

    if (error) {
      console.error('Supabase çekme hatası:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data || []);
  } catch (err) {
    console.error('Sunucu hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Taksit Ekle veya Güncelle
app.post('/api/installments', async (req, res) => {
  try {
    const item = req.body;
    const { data, error } = await supabase
      .from('installments')
      .upsert({
        id: String(item.id),
        person: String(item.person || ''),
        phone: String(item.phone || ''),
        title: String(item.title || ''),
        platform: String(item.platform || 'Trendyol'),
        totalamount: Number(item.totalAmount) || 0,
        totalinstallments: Number(item.totalInstallments) || 1,
        paidinstallments: Number(item.paidInstallments || 0),
        paymentday: Number(item.paymentDay) || 4,
        startdate: String(item.startDate || ''),
        history: item.history || []
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase kayıt hatası:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, item });
  } catch (err) {
    console.error('Sunucu kayıt hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Taksit Sil
app.delete('/api/installments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('installments')
      .delete()
      .eq('id', String(id));

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Silme hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu aktif: http://localhost:${PORT}`);
});
