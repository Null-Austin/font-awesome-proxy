const fastify = require("fastify");
const httpProxy = require("@fastify/http-proxy");
const getLatestVersion = require("./getlatestversion");
const app = fastify();

const PORT = process.env.PORT || 3001;

const faurl = "site-assets.fontawesome.com";

app.get("/", async () => {
  return "Hello from Font Awesome Proxy!";
});

app.register(httpProxy, {
  upstream: `https://${faurl}`,
  preHandler: async (req) => {
    req.headers.origin = "https://fontawesome.com";
    req.headers.referer = "https://fontawesome.com/";

    const [pathname, query] = req.url.split("?");
    const parts = pathname.split("/").filter(Boolean);

    const updated = query && new URLSearchParams(query).has("updated");
    const isWebfontRequest =
      parts[0] === "releases" &&
      parts[2] === "webfonts" &&
      parts[3] &&
      parts[3].endsWith(".woff2");

    // Set the version to the highest version for release and direct webfont
    // requests when asked (or when a webfont is requested directly).
    if (
      parts[0] === "releases" &&
      parts[1] &&
      /^v[0-9]+\.[0-9]+\.[0-9]+$/.test(parts[1]) &&
      (updated || isWebfontRequest)
    ) {
      const latestVersion = await getLatestVersion();
      parts[1] = `v${String(latestVersion).replace(/^v/, "")}`;
    }

    let url = `/${parts.join("/")}${query ? `?${query}` : ""}`;

    console.log(`${faurl}${url}`);

    req.url = url;
    req.raw.url = url;
  },
});

app.listen({ port: PORT }, (e) => {
  if (e) {
    console.error("Error starting server:", e);
    process.exit(1);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});