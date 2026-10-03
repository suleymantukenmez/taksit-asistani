const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase Bağlantısı (Render Environment'tan otomatik alır)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 1. Taksitleri Veritabanından Getir
app.get('/api/installments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Veri çekme hatası:', err.message);
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
        id: item.id,
        person: item.person,
        phone: item.phone || '',
        title: item.title,
        platform: item.platform || 'Trendyol',
        totalAmount: Number(item.totalAmount),
        totalInstallments: Number(item.totalInstallments),
        paidInstallments: Number(item.paidInstallments || 0),
        paymentDay: Number(item.paymentDay),
        startDate: item.startDate,
        history: item.history || []
      }, { onConflict: 'id' });

    if (error) throw error;
    res.json({ success: true, item });
  } catch (err) {
    console.error('Kaydetme hatası:', err.message);
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
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Silme hatası:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu aktif: http://localhost:${PORT}`);
});
