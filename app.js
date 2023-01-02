var Docker = require("dockerode");

var docker = new Docker({ socketPath: "/var/run/docker.sock" });
docker.listContainers({ all: true }, function (err, containers) {
  console.log("ALL: " + containers.length);
  containers.forEach((container) => console.log(container.Image));
});

docker.listImages({}, function (err, images) {
  console.log("ALL: " + images.length);
  console.log(images);
  // images.forEach((image) => console.log(image));
});

// docker.run(
//   "wearable:foxy-desktop",
//   [],
//   process.stdout,
//   {
//     ExposedPorts: { "8083/tcp": {} },
//     Hostconfig: {
//       PortBindings: { "8083/tcp": [{ HostPort: "8086" }] },
//     },
//   },
//   function (err, data, container) {
//     if (err) {
//       return console.error(err);
//     }
//     console.log(data.StatusCode);
//   }
// );

const express = require("express");
var path = require("path");

const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.engine(".html", require("ejs").__express);
app.set("views", path.join(__dirname, ""));
app.set("view engine", "html");

app.get("/", function (req, res) {
  res.render("index", {});
});

app.get("/tutorial", function (req, res) {
  res.render("tutorial", {});
});

app.get("/code", function (req, res) {
  res.render("code", {});
});

app.get("/simulator", function (req, res) {
  res.render("simulator", {});
});

// app.use(
//   "/vnc",
//   createProxyMiddleware({
//     target: "http://localhost:8086/",
//     changeOrigin: true,
//     pathRewrite: { "^/vnc": "" },
//     ws: true,
//     router: function (req) {
//       // console.log(req);
//       if (req.query && req.query.port === 8083) return "http://localhost:8083/";
//       if (req.query && req.query.port === 8084) return "http://localhost:8084/";
//       if (req.query && req.query.port === 8085) return "http://localhost:8085/";
//       if (req.query && req.query.port === 8086) return "http://localhost:8086/";
//       return "http://localhost:8086";
//     },
//   })
// );
//
// app.use(
//   "/code",
//   createProxyMiddleware({
//     target: "http://localhost:8090/",
//     changeOrigin: true,
//     pathRewrite: { "^/code": "" },
//     proxyTimeout: 30 * 60 * 1000,
//     timeout: 30 * 60 * 1000,
//     ws: true,
//     router: function (req) {
//       // console.log(req);
//       return "http://localhost:8090";
//     },
//     onError: (err, req, res) => console.log(err),
//   })
// );

http: app.listen(3000);
