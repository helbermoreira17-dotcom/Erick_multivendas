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

// Dados Padrão do Sistema
const defaultData = {
  settings: {
    siteName: "Império Digital",
    logoText: "IMPÉRIO<span class='text-amber-400'>DIGITAL</span>",
    heroTitle: "Comece no Marketing Digital e transforme seu conhecimento em oportunidade",
    heroSubtitle: "Aprenda as estratégias mais eficientes do mercado para faturar alto no digital, mesmo começando do absoluto zero.",
    ctaTitle: "Pronto para escalar seus resultados?",
    ctaSubtitle: "Garanta seu acesso agora mesmo e comece a aplicar as melhores estratégias hoje.",
    primaryColor: "#f59e0b",
    footerText: "© 2026 Império Digital. Todos os direitos reservados."
  },
  courses: [
    {
      id: "1",
      name: "Método Primeira Venda Express",
      description: "O passo a passo para fazer suas primeiras vendas nas redes sociais sem precisar aparecer.",
      fullDescription: "Neste treinamento completo, você aprenderá a estruturar sua oferta, montar funis simples no Instagram/TikTok e gerar tráfego orgânico qualificadíssimo. Ideal para quem está começando agora e quer ver o saldo da plataforma subir rápido.",
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
      fullDescription: "Aprenda a subir campanhas profissionais no Gerenciador de Anúncios da Meta e Google. Estruturas de teste de público, otimização de CPL e estratégias avançadas de remarketing para multiplicar seus resultados.",
      price: "R$ 297,00",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
      link: "https://pay.hotmart.com/exemplo2",
      active: true,
      order: 2
    }
  ],
  benefits: [
    { id: "1", title: "Acesso Vitalício", desc: "Assista às aulas no seu ritmo sem prazo de expiração." },
    { id: "2", title: "Suporte VIP", desc: "Tire dúvidas diretamente com especialistas na área." },
    { id: "3", title: "Comunidade Exclusiva", desc: "Networking com centenas de alunos ativos no mercado." }
  ],
  testimonials: [
    { id: "1", name: "Lucas Mendes", text: "Em menos de 2 semanas fiz minha primeira venda aplicando o método!", avatar: "https://i.pravatar.cc/150?img=12" },
    { id: "2", name: "Mariana Costa", text: "Excelente conteúdo. Direto ao ponto e sem enrolação.", avatar: "https://i.pravatar.cc/150?img=47" }
  ],
  faqs: [
    { id: "1", question: "Preciso ter experiência anterior?", answer: "Não! Nossos cursos foram desenvolvidos tanto para iniciantes quanto para quem deseja escalar." },
    { id: "2", question: "Como recebo o acesso?", answer: "Imediatamente após a confirmação do pagamento no seu e-mail cadastrado." }
  ]
};

// Gerenciamento de Banco de Dados JSON Local
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

  // HTML: Página Principal ("/")
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
  <!-- Header -->
  <header class="fixed top-0 w-full z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-gray-800">
    <a href="/" id="site-logo" class="text-2xl font-black tracking-wide text-white">IMPÉRIO<span class="text-amber-500">DIGITAL</span></a>
    <nav class="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
      <a href="/" class="hover:text-amber-400 transition">Início</a>
      <a href="/cursos" class="hover:text-amber-400 transition">Cursos</a>
      <a href="#beneficios" class="hover:text-amber-400 transition">Benefícios</a>
      <a href="#depoimentos" class="hover:text-amber-400 transition">Depoimentos</a>
      <a href="#faq" class="hover:text-amber-400 transition">FAQ</a>
    </nav>
    <a href="#cursos" class="btn-gradient text-gray-900 font-bold px-5 py-2.5 rounded-full shadow-lg text-sm hover:scale-105 transition transform">Quero começar agora</a>
  </header>

  <!-- Hero -->
  <section id="inicio" class="pt-36 pb-20 px-6 max-w-5xl mx-auto text-center">
    <span class="bg-amber-500/10 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider border border-amber-500/20">O Futuro das Vendas Online</span>
    <h1 id="hero-title" class="text-4xl md:text-6xl font-extrabold mt-6 leading-tight text-white">Comece no Marketing Digital</h1>
    <p id="hero-subtitle" class="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto">Aprenda as estratégias mais eficientes do mercado.</p>
    <div class="mt-8 flex justify-center gap-4">
      <a href="#cursos" class="btn-gradient text-gray-900 font-extrabold px-8 py-4 rounded-full text-lg shadow-xl hover:scale-105 transition transform">Conhecer os cursos <i class="fas fa-arrow-right ml-2"></i></a>
    </div>
  </section>

  <!-- Cursos em Destaque -->
  <section id="cursos" class="py-20 px-6 max-w-6xl mx-auto">
    <div class="flex justify-between items-end mb-12">
      <div>
        <h2 class="text-3xl font-bold">Cursos em Destaque</h2>
        <p class="text-gray-400 text-sm mt-1">Escolha o melhor treinamento para seu momento atual</p>
      </div>
      <a href="/cursos" class="text-amber-400 text-sm font-bold hover:underline">Ver todos →</a>
    </div>
    <div id="courses-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
  </section>

  <!-- Benefícios -->
  <section id="beneficios" class="py-20 bg-gray-900/50 px-6">
    <div class="max-w-6xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-12">Por que escolher nossos programas?</h2>
      <div id="benefits-grid" class="grid md:grid-cols-3 gap-8"></div>
    </div>
  </section>

  <!-- Depoimentos -->
  <section id="depoimentos" class="py-20 px-6 max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center mb-12">O que dizem nossos alunos</h2>
    <div id="testimonials-grid" class="grid md:grid-cols-2 gap-8"></div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="py-20 bg-gray-900/50 px-6 max-w-4xl mx-auto rounded-2xl my-12">
    <h2 class="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
    <div id="faq-list" class="space-y-6"></div>
  </section>

  <!-- CTA Final -->
  <section class="py-20 px-6 text-center max-w-4xl mx-auto my-12 glass-card rounded-3xl border border-amber-500/20">
    <h2 id="cta-title" class="text-3xl font-black mb-4">Pronto para escalar seus resultados?</h2>
    <p id="cta-subtitle" class="text-gray-400 mb-8 max-w-xl mx-auto">Garanta seu acesso agora mesmo e comece a aplicar as melhores estratégias hoje.</p>
    <a href="#cursos" class="btn-gradient text-gray-900 font-extrabold px-10 py-4 rounded-full text-lg shadow-xl hover:scale-105 transition transform inline-block">Quero Começar Agora</a>
  </section>

  <!-- Rodapé -->
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
      document.getElementById('cta-title').innerText = data.settings.ctaTitle;
      document.getElementById('cta-subtitle').innerText = data.settings.ctaSubtitle;
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
                <p class="text-gray-400 text-sm mt-2 line-clamp-3">\${c.description}</p>
              </div>
              <div class="mt-6">
                <div class="text-2xl font-black text-amber-400 mb-4">\${c.price}</div>
                <div class="grid grid-cols-2 gap-2">
                  <a href="/curso/\${c.id}" class="bg-gray-800 hover:bg-gray-700 text-white font-bold text-center py-2.5 rounded-xl text-sm transition">Detalhes</a>
                  <a href="\${c.link}" target="_blank" class="btn-gradient text-gray-900 font-bold text-center py-2.5 rounded-xl text-sm transition">Comprar</a>
                </div>
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
          <img src="\${t.avatar}" class="w-12 h-12 rounded-full border border-amber-500 object-cover">
          <div>
            <h4 class="font-bold text-white">\${t.name}</h4>
            <p class="text-gray-400 text-sm mt-1">"\${t.text}"</p>
          </div>
        </div>
      \`).join('');

      document.getElementById('faq-list').innerHTML = data.faqs.map(f => \`
        <div class="glass-card p-5 rounded-xl">
          <h4 class="font-bold text-amber-400 text-lg">\${f.question}</h4>
          <p class="text-gray-300 text-sm mt-2">\${f.answer}</p>
        </div>
      \`).join('');
    });
  </script>
</body>
</html>`;

  // HTML: Lista de Cursos ("/cursos")
  const cursosHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todos os Cursos - Império Digital</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f17; color: #f3f4f6; font-family: system-ui, sans-serif; }
    .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .btn-gradient { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
  </style>
</head>
<body class="pt-28 pb-20 px-6 max-w-6xl mx-auto">
  <a href="/" class="text-amber-400 text-sm font-bold hover:underline">← Voltar para o início</a>
  <h1 class="text-4xl font-extrabold mt-4 mb-2">Todos os Cursos</h1>
  <p class="text-gray-400 mb-12">Explore nossos conteúdos e acelere seu crescimento no digital.</p>
  <div id="all-courses-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"></div>

  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const res = await fetch('/api/site-data');
      const data = await res.json();
      document.getElementById('all-courses-grid').innerHTML = data.courses
        .filter(c => c.active)
        .sort((a, b) => a.order - b.order)
        .map(c => \`
          <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
            <img src="\${c.image}" class="w-full h-48 object-cover">
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 class="text-xl font-bold text-white">\${c.name}</h3>
                <p class="text-gray-400 text-sm mt-2">\${c.description}</p>
              </div>
              <div class="mt-6">
                <div class="text-2xl font-black text-amber-400 mb-4">\${c.price}</div>
                <div class="grid grid-cols-2 gap-2">
                  <a href="/curso/\${c.id}" class="bg-gray-800 hover:bg-gray-700 text-white font-bold text-center py-2.5 rounded-xl text-sm">Detalhes</a>
                  <a href="\${c.link}" target="_blank" class="btn-gradient text-gray-900 font-bold text-center py-2.5 rounded-xl text-sm">Comprar</a>
                </div>
              </div>
            </div>
          </div>
        \`).join('');
    });
  </script>
</body>
</html>`;

  // HTML: Detalhes do Curso ("/curso/:id")
  const cursoDetalhesHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detalhes do Curso</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f17; color: #f3f4f6; font-family: system-ui, sans-serif; }
    .glass-card { background: rgba(17, 24, 39, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .btn-gradient { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
  </style>
</head>
<body class="pt-28 pb-20 px-6 max-w-4xl mx-auto">
  <a href="/cursos" class="text-amber-400 text-sm font-bold hover:underline">← Voltar para lista de cursos</a>
  <div id="course-content" class="mt-8 glass-card p-8 rounded-3xl border border-gray-800"></div>

  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const courseId = window.location.pathname.split('/').pop();
      const res = await fetch('/api/site-data');
      const data = await res.json();
      const course = data.courses.find(c => c.id === courseId);

      if (!course) {
        document.getElementById('course-content').innerHTML = '<h2 class="text-2xl font-bold">Curso não encontrado.</h2>';
        return;
      }

      document.title = course.name + " - Império Digital";
      document.getElementById('course-content').innerHTML = \`
        <img src="\${course.image}" class="w-full h-80 object-cover rounded-2xl mb-8">
        <h1 class="text-3xl md:text-4xl font-black text-white mb-4">\${course.name}</h1>
        <p class="text-gray-300 text-lg leading-relaxed mb-6">\${course.fullDescription || course.description}</p>
        <div class="flex items-center justify-between border-t border-gray-800 pt-6 mt-8">
          <div>
            <span class="text-sm text-gray-500 block">Investimento:</span>
            <span class="text-3xl font-black text-amber-400">\${course.price}</span>
          </div>
          <a href="\${course.link}" target="_blank" class="btn-gradient text-gray-900 font-extrabold px-8 py-4 rounded-xl text-lg shadow-xl hover:scale-105 transition transform">Garantir Vaga Agora</a>
        </div>
      \`;
    });
  </script>
</body>
</html>`;

  // HTML: Login Admin ("/admin")
  const adminLoginHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Login - Painel Admin</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white flex items-center justify-center min-h-screen p-4">
  <div class="bg-gray-900 p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
    <h2 class="text-2xl font-bold mb-6 text-center text-amber-400">Painel Administrativo</h2>
    <form id="login-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-gray-300">Senha de Acesso</label>
        <input type="password" id="password" placeholder="Digite a senha (Padrão: 1507)" required class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-400">
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

  // HTML: Dashboard Administrativo Completo com Menu Lateral ("/admin/dashboard")
  const adminDashboardHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Dashboard Admin - Gerenciador</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-950 text-white min-h-screen flex">

  <!-- Sidebar / Menu Lateral -->
  <aside class="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col justify-between hidden md:flex">
    <div>
      <h2 class="text-xl font-bold text-amber-400 mb-8 flex items-center gap-2">
        <i class="fas fa-sliders-h"></i> Painel Admin
      </h2>
      <nav class="space-y-2">
        <button onclick="showTab('geral')" class="w-full text-left px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-gray-950 transition font-medium">Geral & Textos</button>
        <button onclick="showTab('cursos')" class="w-full text-left px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-gray-950 transition font-medium">Gerenciar Cursos</button>
        <button onclick="showTab('beneficios')" class="w-full text-left px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-gray-950 transition font-medium">Benefícios</button>
        <button onclick="showTab('depoimentos')" class="w-full text-left px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-gray-950 transition font-medium">Depoimentos</button>
        <button onclick="showTab('faqs')" class="w-full text-left px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-amber-500 hover:text-gray-950 transition font-medium">FAQs</button>
      </nav>
    </div>
    <button id="logout-btn" class="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 font-bold py-2.5 rounded-lg transition w-full">Sair do Painel</button>
  </aside>

  <!-- Conteúdo Principal -->
  <main class="flex-1 p-8 max-w-5xl overflow-y-auto">
    <div class="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
      <h1 class="text-2xl font-bold text-white">Editor de Conteúdo do Site</h1>
      <div class="flex gap-3">
        <a href="/" target="_blank" class="bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition">Prévia do Site <i class="fas fa-external-link-alt ml-1"></i></a>
        <button id="save-all-btn" class="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-5 py-2 rounded-lg text-sm transition">Salvar Alterações</button>
      </div>
    </div>

    <!-- Tab 1: Geral -->
    <div id="tab-geral" class="tab-content space-y-6">
      <h3 class="text-lg font-bold text-amber-400">Identidade e Hero</h3>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Nome da Marca</label>
          <input type="text" id="siteName" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Logo HTML</label>
          <input type="text" id="logoText" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Título Principal (Hero)</label>
        <input type="text" id="heroTitle" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Subtítulo (Hero)</label>
        <textarea id="heroSubtitle" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white h-20"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Texto do Rodapé</label>
        <input type="text" id="footerText" class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
      </div>
    </div>

    <!-- Tab 2: Cursos -->
    <div id="tab-cursos" class="tab-content space-y-6 hidden">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-amber-400">Produtos / Cursos</h3>
        <button onclick="addCourse()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-sm">+ Novo Curso</button>
      </div>
      <div id="courses-list" class="space-y-6"></div>
    </div>

    <!-- Tab 3: Benefícios -->
    <div id="tab-beneficios" class="tab-content space-y-6 hidden">
      <h3 class="text-lg font-bold text-amber-400">Benefícios da Plataforma</h3>
      <div id="benefits-list" class="space-y-4"></div>
    </div>

    <!-- Tab 4: Depoimentos -->
    <div id="tab-depoimentos" class="tab-content space-y-6 hidden">
      <h3 class="text-lg font-bold text-amber-400">Depoimentos de Alunos</h3>
      <div id="testimonials-list" class="space-y-4"></div>
    </div>

    <!-- Tab 5: FAQs -->
    <div id="tab-faqs" class="tab-content space-y-6 hidden">
      <h3 class="text-lg font-bold text-amber-400">Perguntas Frequentes</h3>
      <div id="faqs-list" class="space-y-4"></div>
    </div>
  </main>

  <script>
    let currentData = {};

    function showTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.getElementById('tab-' + tabName).classList.remove('hidden');
    }

    async function loadAdminData() {
      const authRes = await fetch('/api/admin/check-auth');
      const authData = await authRes.json();
      if (!authData.authenticated) {
        window.location.href = '/admin';
        return;
      }

      const res = await fetch('/api/site-data');
      currentData = await res.json();

      // Preencher Campos Gerais
      document.getElementById('siteName').value = currentData.settings.siteName;
      document.getElementById('logoText').value = currentData.settings.logoText;
      document.getElementById('heroTitle').value = currentData.settings.heroTitle;
      document.getElementById('heroSubtitle').value = currentData.settings.heroSubtitle;
      document.getElementById('footerText').value = currentData.settings.footerText;

      renderCourses();
      renderBenefits();
      renderTestimonials();
      renderFaqs();
    }

    function renderCourses() {
      const container = document.getElementById('courses-list');
      container.innerHTML = currentData.courses.map((c, i) => \`
        <div class="bg-gray-900 border border-gray-800 p-6 rounded-xl space-y-4">
          <div class="flex justify-between items-center">
            <span class="font-bold text-amber-400">Curso #\${i + 1}</span>
            <div class="flex gap-2">
              <label class="text-xs text-gray-400 flex items-center gap-1">
                <input type="checkbox" \${c.active ? 'checked' : ''} onchange="currentData.courses[\${i}].active = this.checked"> Ativo
              </label>
              <button onclick="removeCourse(\${i})" class="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-950/40 rounded border border-red-900">Excluir</button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <input type="text" value="\${c.name}" onchange="currentData.courses[\${i}].name = this.value" placeholder="Nome do Curso" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
            <input type="text" value="\${c.price}" onchange="currentData.courses[\${i}].price = this.value" placeholder="Preço" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
          </div>
          <textarea onchange="currentData.courses[\${i}].description = this.value" placeholder="Descrição Curta" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white h-16">\${c.description}</textarea>
          <textarea onchange="currentData.courses[\${i}].fullDescription = this.value" placeholder="Descrição Detalhada (Página Individual)" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white h-24">\${c.fullDescription || ''}</textarea>
          <div class="grid grid-cols-2 gap-4">
            <input type="text" value="\${c.image}" onchange="currentData.courses[\${i}].image = this.value" placeholder="URL da Imagem" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
            <input type="text" value="\${c.link}" onchange="currentData.courses[\${i}].link = this.value" placeholder="Link de Checkout (Hotmart, etc)" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
          </div>
        </div>
      \`).join('');
    }

    function addCourse() {
      currentData.courses.push({
        id: Date.now().toString(),
        name: "Novo Curso",
        description: "Descrição rápida do novo curso.",
        fullDescription: "Descrição detalhada completa.",
        price: "R$ 197,00",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
        link: "https://pay.hotmart.com/exemplo",
        active: true,
        order: currentData.courses.length + 1
      });
      renderCourses();
    }

    function removeCourse(i) {
      currentData.courses.splice(i, 1);
      renderCourses();
    }

    function renderBenefits() {
      document.getElementById('benefits-list').innerHTML = currentData.benefits.map((b, i) => \`
        <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl grid grid-cols-2 gap-4">
          <input type="text" value="\${b.title}" onchange="currentData.benefits[\${i}].title = this.value" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
          <input type="text" value="\${b.desc}" onchange="currentData.benefits[\${i}].desc = this.value" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
        </div>
      \`).join('');
    }

    function renderTestimonials() {
      document.getElementById('testimonials-list').innerHTML = currentData.testimonials.map((t, i) => \`
        <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-2">
          <div class="grid grid-cols-2 gap-4">
            <input type="text" value="\${t.name}" onchange="currentData.testimonials[\${i}].name = this.value" placeholder="Nome" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
            <input type="text" value="\${t.avatar}" onchange="currentData.testimonials[\${i}].avatar = this.value" placeholder="URL Avatar" class="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
          </div>
          <textarea onchange="currentData.testimonials[\${i}].text = this.value" placeholder="Depoimento" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white h-16">\${t.text}</textarea>
        </div>
      \`).join('');
    }

    function renderFaqs() {
      document.getElementById('faqs-list').innerHTML = currentData.faqs.map((f, i) => \`
        <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl space-y-2">
          <input type="text" value="\${f.question}" onchange="currentData.faqs[\${i}].question = this.value" placeholder="Pergunta" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white">
          <textarea onchange="currentData.faqs[\${i}].answer = this.value" placeholder="Resposta" class="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white h-16">\${f.answer}</textarea>
        </div>
      \`).join('');
    }

    document.getElementById('save-all-btn').addEventListener('click', async () => {
      currentData.settings.siteName = document.getElementById('siteName').value;
      currentData.settings.logoText = document.getElementById('logoText').value;
      currentData.settings.heroTitle = document.getElementById('heroTitle').value;
      currentData.settings.heroSubtitle = document.getElementById('heroSubtitle').value;
      currentData.settings.footerText = document.getElementById('footerText').value;

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
  fs.writeFileSync(path.join(PUBLIC_DIR, 'cursos.html'), cursosHtml);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'curso-detalhes.html'), cursoDetalhesHtml);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'admin-login.html'), adminLoginHtml);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'admin-dashboard.html'), adminDashboardHtml);
}

setupStaticFiles();

// Middlewares Globais
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.use(session({
  secret: 'imperio_digital_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 } // 24 horas
}));

// Proteção Anti Brute-Force (Bloqueia após 5 tentativas incorretas)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});

// Middleware de Autorização
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Acesso não autorizado.' });
  }
}

// Senha padrão em hash bcrypt (1507)
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('1507', 10);

// --- ROTAS DA API ---
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
    res.status(500).json({ success: false, message: 'Erro ao salvar alterações no banco de dados.' });
  }
});

// --- ROTAS DA APLICAÇÃO ---
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get('/cursos', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'cursos.html')));
app.get('/curso/:id', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'curso-detalhes.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin-login.html')));
app.get('/admin/dashboard', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin-dashboard.html')));

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`Servidor rodando com sucesso!`);
  console.log(`Página Inicial: http://localhost:${PORT}`);
  console.log(`Painel Admin:   http://localhost:${PORT}/admin`);
  console.log(`==================================================\n`);
});