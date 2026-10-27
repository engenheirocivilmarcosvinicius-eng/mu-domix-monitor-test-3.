
const http = require("http");

const PORT = process.env.PORT || 3000;
const PROFILE_URL =
  "https://mudomix.com/profile/character/jjota";

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.url !== "/") {
    res.writeHead(404);
    return res.end(JSON.stringify({ erro: "Rota não encontrada" }));
  }

  try {
    const response = await fetch(PROFILE_URL, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000)
    });

    const html = await response.text();

    const title = (
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || []
    )[1] || "Não encontrado";

    const map = (
      html.match(
        /class="mu-cprof-stat-val mu-cprof-map"[^>]*>\s*([\s\S]*?)\s*<\/span>/i
      ) || []
    )[1];

    const coords = (
      html.match(/Mapa[\s\S]{0,200}?\((\d+)\s*\/\s*(\d+)\)/i) || []
    );

    res.writeHead(200);
    res.end(JSON.stringify({
      httpStatus: response.status,
      titulo: title.replace(/<[^>]*>/g, "").trim(),
      tamanhoHTML: html.length,
      mapaEncontrado: map
        ? map.replace(/<[^>]*>/g, "").trim()
        : null,
      coordenadasEncontradas: coords.length > 0
        ? `${coords[1]}/${coords[2]}`
        : null,
      paginaDeProtecao: /just a moment|enable javascript and cookies/i
        .test(html)
    }, null, 2));
  } catch (error) {
    res.writeHead(502);
    res.end(JSON.stringify({
      erro: error.message
    }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
