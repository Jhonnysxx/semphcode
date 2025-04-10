import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";

import { defaultHTML } from "./utils/consts.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.APP_PORT || 5173;

// Configuração do CORS
const allowedOrigins = [
  'http://localhost:5173', // Para desenvolvimento local
  'https://deeppink-jaguar-754948.hostingersite.com', // Domínio correto da Hostinger adicionado
  // Adicione outras origens permitidas aqui, se necessário
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem 'origin' (como Postman, apps mobile, etc.) ou de origens permitidas
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Se você usa cookies ou headers de autorização
}));

app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, "dist")));

// Endpoint para fornecer as chaves de API de imagens quando solicitadas
app.get("/api/image-api-keys", (req, res) => {
  res.json({
    unsplash: {
      apiKey: process.env.UNSPLASH_API_KEY || '',
      enabled: !!process.env.UNSPLASH_API_KEY
    },
    pixabay: {
      apiKey: process.env.PIXABAY_API_KEY || '',
      enabled: !!process.env.PIXABAY_API_KEY
    },
    pexels: {
      apiKey: process.env.PEXELS_API_KEY || '',
      enabled: !!process.env.PEXELS_API_KEY
    }
  });
});

// Endpoint de compatibilidade temporário para redirecionar solicitações antigas
app.post("/api/ask-ai", async (req, res) => {
  console.log("Redirecionando solicitação de /api/ask-ai para /api/deepseek");
  
  // Encaminhar a solicitação para o endpoint deepseek
  req.url = "/api/deepseek";
  app._router.handle(req, res);
});

// Novo endpoint para processamento de perguntas sobre programação
app.post("/api/chat", async (req, res) => {
  console.log("Endpoint chat chamado", req.body);
  const { prompt, context } = req.body;
  
  if (!prompt) {
    return res.status(400).send({
      ok: false,
      message: "Campo obrigatório ausente: prompt",
    });
  }

  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!deepseekApiKey) {
      return res.status(400).send({
        ok: false,
        message: "Chave da API Deepseek não configurada",
      });
    }

    // Contexto específico para perguntas sobre programação, mas permitindo conversas mais gerais
    const systemMessage = context || `You are an AI assistant specializing in programming and software development.

Your primary focus is to help users with questions related to:
- Programming languages (JavaScript, HTML, CSS, Python, Java, C++, etc.)
- Web development (frontend, backend, fullstack)
- Frameworks and libraries (React, Vue, Angular, Node.js, Express, Django, etc.)
- Databases (SQL, NoSQL, MongoDB, MySQL, PostgreSQL, etc.)
- Algorithms and data structures
- Coding best practices and design patterns
- DevOps, CI/CD, and deployment
- Development tools (Git, Docker, etc.)

Your responses should be:
1. Objective and direct
2. Technically accurate
3. Including code examples when relevant
4. Up-to-date with modern development practices

While programming and development are your specialties, you can also engage in general conversation.
For non-programming topics, keep responses brief but helpful and friendly.
Always prioritize providing accurate information. If you're uncertain, acknowledge it.

Aim to be helpful to users regardless of the question, but provide especially detailed answers for programming-related topics.
Respond in the same language the user is using (e.g., if they ask in Portuguese, answer in Portuguese).`;

    // Chamada à API DeepSeek para perguntas sobre programação
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-coder",
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).send({
        ok: false,
        message: errorData.error?.message || "Erro ao conectar com a API Deepseek",
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "Não consegui processar sua pergunta.";

    return res.status(200).send({
      ok: true,
      content
    });
  } catch (error) {
    console.error("Erro na comunicação com API Deepseek (chat):", error);
    res.status(500).send({
      ok: false,
      message: error.message || "Erro ao comunicar com a API Deepseek",
    });
  }
});

// Endpoint principal de integração com a API DeepSeek
app.post("/api/deepseek", async (req, res) => {
  console.log("Endpoint deepseek chamado", req.body);
  const { prompt, html, previousPrompt } = req.body;
  
  if (!prompt) {
    return res.status(400).send({
      ok: false,
      message: "Campo obrigatório ausente: prompt",
    });
  }

  // Set up response headers for streaming
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!deepseekApiKey) {
      return res.status(400).send({
        ok: false,
        message: "Chave da API Deepseek não configurada",
      });
    }

    // Construindo o contexto completo
    let systemMessage = `USE HTML, CSS AND JAVASCRIPT. If you want to use icons, make sure to import the library first.
Try to create the best UI possible using HTML, CSS, and JAVASCRIPT.
Use TailwindCSS as much as possible for CSS. If you can't do something with TailwindCSS, use custom CSS.

ORGANIZATION:
- Create modular HTML structure with clear components
- Use semantic HTML elements (<header>, <footer>, <nav>, <section>, <aside>)
- Give meaningful ids and classes to sections that could be separate components
- Put CSS in <style> tags in the head section
- Put JavaScript in <script> tags at the end of body

COMPONENTS STRUCTURE:
Create distinct components that can be easily separated into their own files:
- Header components should use <header> tags
- Footer components should use <footer> tags
- Navigation should use <nav> tags
- Main sections should use <section> tags with clear class names like "hero", "products", "features"
- Reusable UI elements should be in <div> elements with class names that include "component" or similar

IMAGES:
- When the user adds images from Unsplash, Pixabay, or Pexels, make sure to properly include attribution in comments
- Format for image attribution: <!-- Image by [Photographer Name] from [Source] -->
- Use proper image optimization techniques (appropriate size, lazy loading for multiple images)
- Always include alt text for accessibility
- When adding responsive images, use CSS to ensure they look good on all devices

Your code should have a clear separation of concerns:
1. HTML: for document structure with well-organized components
2. CSS: for styling (in a <style> tag)
3. JavaScript: for functionality (in a <script> tag)

Example of good structure:
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Project Name</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* CSS goes here */
  </style>
</head>
<body>
  <header class="site-header">
    <!-- Header content -->
  </header>
  
  <nav class="main-navigation">
    <!-- Navigation content -->
  </nav>
  
  <section id="hero" class="hero-component">
    <!-- Hero section content -->
  </section>
  
  <section id="features" class="features-component">
    <!-- Features section content -->
  </section>
  
  <footer class="site-footer">
    <!-- Footer content -->
  </footer>
  
  <script>
    // JavaScript goes here
  </script>
</body>
</html>

Please provide the response as a complete HTML document following these organizational principles.`;

    let fullPrompt = prompt;
    if (previousPrompt) {
      fullPrompt = `${previousPrompt}\n\n${prompt}`;
    }

    const messages = [
      {
        role: "system",
        content: systemMessage
      }
    ];

    if (html && html !== defaultHTML) {
      messages.push({
        role: "assistant", 
        content: `O código atual é: ${html}.`
      });
    }

    messages.push({ 
      role: "user", 
      content: fullPrompt 
    });

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-coder",
        messages: messages,
        stream: true,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).send({
        ok: false,
        message: errorData.error?.message || "Erro ao conectar com a API Deepseek",
      });
    }

    if (!response.body) {
      return res.status(500).send({
        ok: false,
        message: "Erro ao obter resposta da API Deepseek",
      });
    }

    // Função para processar o streaming de resposta
    const processStream = async () => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const jsonData = JSON.parse(line.substring(6));
              const content = jsonData.choices[0]?.delta?.content || "";
              if (content) {
                res.write(content);
                completeResponse += content;
                
                // Se já temos um HTML completo, podemos parar
                if (completeResponse.includes("</html>")) {
                  res.end();
                  return;
                }
              }
            } catch (e) {
              console.error("Erro ao processar linha de resposta:", e);
            }
          } else if (line === "data: [DONE]") {
            res.end();
            return;
          }
        }
      }

      res.end();
    };

    await processStream();
  } catch (error) {
    console.error("Erro na comunicação com API Deepseek:", error);
    if (!res.headersSent) {
      res.status(500).send({
        ok: false,
        message: error.message || "Erro ao comunicar com a API Deepseek",
      });
    } else {
      res.end();
    }
  }
});

// Serve frontend for any other route
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
