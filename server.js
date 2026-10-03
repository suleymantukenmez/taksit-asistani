const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// database.json yoksa otomatik oluştur
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function readData() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// 1. Taksitleri getir
app.get('/api/installments', (req, res) => {
  const items = readData();
  res.json(items);
});

// 2. Taksit ekle veya güncelle
app.post('/api/installments', (req, res) => {
  try {
    const item = req.body;
    let items = readData();
    const index = items.findIndex(i => i.id === item.id);

    if (index !== -1) {
      items[index] = item;
    } else {
      items.unshift(item);
    }

    writeData(items);
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Taksit sil
app.delete('/api/installments/:id', (req, res) => {
  try {
    const { id } = req.params;
    let items = readData();
    items = items.filter(i => i.id !== id);
    writeData(items);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu aktif: http://localhost:${PORT}`);
});