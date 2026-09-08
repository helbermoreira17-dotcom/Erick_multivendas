const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Dados Padrão do Banco de Dados
const defaultData = {
  settings: {
    siteName: "Império Digital",
    logoText: "IMPÉRIO<span class='text-amber-400'>DIGITAL</span>",
    heroTitle: "Comece no Marketing Digital e transforme seu conhecimento em oportunidade",
    heroSubtitle: "Aprenda as estratégias mais eficientes do mercado para faturar alto no digital, mesmo começando do absoluto zero.",
    primaryColor: "#f59e0b",
    footerText: "© 2026 Império Digital. Todos os direitos reservados."
  },
  courses: [
    {
      id: "1",
      name: "Método Primeira Venda Express",
      description: "O passo a passo para fazer suas primeiras vendas nas redes sociais sem precisar aparecer.",
      price: "R$ 97,00",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
      link: "https://pay.hotmart.com/exemplo1",
      active: true,
      order: 1
    },
    {
      id: "2",
      name: "Tráfego Pago para Infoprodutos",
      description: "Domine o Meta Ads e Google Ads para escalar seu negócio com ROI previsível.",
      price: "R$ 297,00",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
      link: "https://pay.hotmart.com/exemplo2",
      active: true,
      order: 2
    }
  ],
  benefits: [
    { title: "Acesso Vitalício", desc: "Assista às aulas no seu ritmo sem prazo de expiração." },
    { title: "Suporte VIP", desc: "Tire dúvidas diretamente com especialistas na área." },
    { title: "Comunidade Exclusiva", desc: "Networking com centenas de alunos ativos." }
  ],
  testimonials: [
    { name: "Lucas Mendes", text: "Em menos de 2 semanas fiz minha primeira venda aplicando o método!", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Mariana Costa", text: "Excelente conteúdo. Direto ao ponto e sem enrolação.", avatar: "https://i.pravatar.cc/150?img=47" }
  ],
  faqs: [
    { question: "Preciso ter experiência anterior?", answer: "Não! Nossos cursos foram desenvolvidos tanto para iniciantes quanto para quem deseja escalar." },
    { question: "Como recebo o acesso?", answer: "Imediatamente após a confirmação do pagamento no seu e-mail cadastrado." }
  ]
};

// Gerenciamento do Banco de Dados em JSON
function getDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Criação dos arquivos HTML na inicialização
function setupStaticFiles() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  // HTML da Página Inicial
  const indexHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page - Marketing Digital</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    body { background-color: #0b0f17; color: #f3f4f6; font-family: system-ui, sans-serif; }
    .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .btn-gradient { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .btn-gradient:hover { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); }
  </style>
</head>
<body>
  <header class="fixed top-0 w-full z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-gray-800">
    <div id="site-logo" class="text-2xl font-black tracking-wide text-white">IMPÉRIO<span class="text-amber-500">DIGITAL</span></div>
    <nav class="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
      <a href="#inicio" class="hover:text-amber-400 transition">Início</a>
      <a href="#cursos" class="hover:text-amber-400 transition">Cursos</a>
      <a href="#beneficios" class="hover:text-amber-400 transition">Benefícios</a>
      <a href="#depoimentos" class="hover:text-amber-400 transition">Depoimentos</a>
      <a href="#faq" class="hover:text-amber-400 transition">FAQ</a>
    </nav>
    <a href="#cursos" class="btn-gradient text-gray-900 font-bold px-5 py-2.5 rounded-full shadow-lg text-sm hover:scale-105 transition transform">Quero começar agora</a>
  </header>

  <section id="inicio" class="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center">
    <span class="bg-amber-500/10 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider border border-amber-500/20">O Futuro das Vendas Online</span>
    <h1 id="hero-title" class="text-4xl md:text-6xl font-extrabold mt-6 leading-tight text-white">Comece no Marketing Digital</h1>
    <p id="hero-subtitle" class="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto">Aprenda as estratégias mais eficientes do mercado.</p>
    <div class="mt-8">
      <a href="#cursos" class="btn-gradient text-gray-900 font-extrabold px-8 py-4 rounded-full text-lg shadow-xl hover:scale-105 transition transform inline-block">Conhecer os cursos <i class="fas fa-arrow-right ml-2"></i></a>
    </div>
  </section>

  <section id="cursos" class="py-20 px-6 max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12">Nossos Treinamentos VIP</h2>
    <div id="courses-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
  </section>

  <section id="beneficios" class="py-20 bg-gray-900/50 px-6">
    <div class="max-w-6xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-12">Por que escolher nossos programas?</h2>
      <div id="benefits-grid" class="grid md:grid-cols-3 gap-8"></div>
    </div>
  </section>

  <section id="depoimentos" class="py-20 px-6 max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12">O que dizem nossos alunos</h2>
    <div id="testimonials-grid" class="grid md:grid-cols-2 gap-8"></div>
  </section>

  <section id="faq" class="py-20 bg-gray-900/50 px-6 max-w-4xl mx-auto rounded-2xl my-12">
    <h2 class="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
    <div id="faq-list" class="space-y-6"></div>
  </section>

  <footer class="py-12 border-t border-gray-800 text-center text-gray-500 text-sm">
    <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <p id="footer-text">© 2026 Império Digital. Todos os direitos reservados.</p>
      <a href="/admin" class="text-xs text-gray-600 hover:text-amber-400 underline transition">ADMIN</a>
    </div>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const res = await fetch('/api/site-data');
      const data = await res.json();

      document.getElementById('site-logo').innerHTML = data.settings.logoText;
      document.getElementById('hero-title').innerText = data.settings.heroTitle;
      document.getElementById('hero-subtitle').innerText = data.settings.heroSubtitle;
      document.getElementById('footer-text').innerText = data.settings.footerText;

      document.getElementById('courses-grid').innerHTML = data.courses
        .filter(c => c.active)
        .sort((a, b) => a.order - b.order)
        .map(c => \`
          <div class="glass-card rounded-2xl overflow-hidden hover:border-amber-500/50 transition flex flex-col justify-between">
            <img src="\${c.image}" class="w-full h-48 object-cover">
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-xl font-bold text-white">\${c.name}</h3>
                <p class="text-gray-400 text-sm mt-2">\${c.description}</p>
              </div>
              <div class="mt-6 flex items-center justify-between">
                <span class="text-2xl font-black text-amber-400">\${c.price}</span>
                <a href="\${c.link}" target="_blank" class="btn-gradient text-gray-900 font-bold px-4 py-2 rounded-lg text-sm">Comprar agora</a>
              </div>
            </div>
          </div>
        \`).join('');

      document.getElementById('benefits-grid').innerHTML = data.benefits.map(b => \`
        <div class="glass-card p-6 rounded-xl text-left">
          <i class="fas fa-check-circle text-amber-400 text-2xl mb-4"></i>
          <h3 class="font-bold text-lg text-white mb-2">\${b.title}</h3>
          <p class="text-gray-400 text-sm">\${b.desc}</p>
        </div>
      \`).join('');

      document.getElementById('testimonials-grid').innerHTML = data.testimonials.map(t => \`
        <div class="glass-card p-6 rounded-xl flex gap-4 items-start">
          <img src="\${t.avatar}" class="w-12 h-12 rounded-full border border-amber-500">
          <div>
            <h4 class="font-bold text-white">\${t.name}</h4>
            <p class="text-gray-400 text-sm mt-1">"\${t.text}"</p>
          </div>
        </div>
      \`).join('');

      document.getElementById('faq-list').innerHTML = data.faqs.map(f => \`
        <div class="glass-card p-4 rounded-lg">
          <h4 class="font-bold text-amber-400">\${f.question}</h4>
          <p class="text-gray-300 text-sm mt-2">\${f.answer}</p>
        </div>
      \`).join('');
    });
  </script>
</body>
</html>`;

  // HTML da Página de Login Admin
  const adminLoginHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Login - Painel Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white flex items-center justify-center min-h-screen">
  <div class="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md">
    <h2 class="text-2xl font-bold mb-6 text-center text-amber-400">Painel Administrativo</h2>
    <form id="login-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Senha de Acesso</label>
        <input type="password" id="password" required class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400">
      </div>
      <button type="submit" class="w-full bg-amber-500 text-gray-950 font-bold py-3 rounded-lg hover:bg-amber-400 transition">Acessar Painel</button>
      <p id="error-msg" class="text-red-500 text-sm text-center hidden mt-2"></p>
    </form>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const result = await res.json();
      if (result.success) {
        window.location.href = '/admin/dashboard';
      } else {
        const errorEl = document.getElementById('error-msg');
        errorEl.innerText = result.message;
        errorEl.classList.remove('hidden');
      }
    });
  </script>
</body>
</html>`;

  // HTML do Painel Dashboard
  const adminDashboardHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dashboard Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white min-h-screen p-8">
  <div class="max-w-4xl mx-auto bg-gray-900 p-8 rounded-2xl border border-gray-800">
    <div class="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
      <h1 class="text-2xl font-bold text-amber-400">Gerenciador do Site</h1>
      <button id="logout-btn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">Sair do Painel</button>
    </div>

    <form id="admin-form" class="space-y-6">
      <div>
        <h3 class="text-lg font-bold text-gray-200 mb-4">Textos Principais</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Título Principal (Hero)</label>
            <input type="text" id="heroTitle" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Subtítulo (Hero)</label>
            <textarea id="heroSubtitle" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white h-24"></textarea>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-gray-800 flex gap-4">
        <button type="submit" class="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-6 py-3 rounded-lg">Salvar Alterações</button>
        <a href="/" target="_blank" class="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-lg">Visualizar Site</a>
      </div>
    </form>
  </div>

  <script>
    let currentData = {};

    async function loadAdminData() {
      const authRes = await fetch('/api/admin/check-auth');
      const authData = await authRes.json();
      if (!authData.authenticated) {
        window.location.href = '/admin';
        return;
      }

      const res = await fetch('/api/site-data');
      currentData = await res.json();
      document.getElementById('heroTitle').value = currentData.settings.heroTitle;
      document.getElementById('heroSubtitle').value = currentData.settings.heroSubtitle;
    }

    document.getElementById('admin-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      currentData.settings.heroTitle = document.getElementById('heroTitle').value;
      currentData.settings.heroSubtitle = document.getElementById('heroSubtitle').value;

      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });
      const result = await res.json();
      alert(result.message);
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin';
    });

    loadAdminData();
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'index.html'), indexHtml);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'admin-login.html'), adminLoginHtml);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'admin-dashboard.html'), adminDashboardHtml);
}

setupStaticFiles();

// Configurações do Express
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.use(session({
  secret: 'imperio_digital_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 }
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Não autorizado.' });
  }
}

// Hash bcrypt para a senha "1507"
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('1507', 10);

// Rotas da API
app.get('/api/site-data', (req, res) => {
  res.json(getDB());
});

app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Senha incorreta!' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/check-auth', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

app.post('/api/admin/save', requireAuth, (req, res) => {
  try {
    saveDB(req.body);
    res.json({ success: true, message: 'Alterações salvas com sucesso!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao salvar alterações.' });
  }
});

// Rotas de Páginas
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin-login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin-dashboard.html')));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});