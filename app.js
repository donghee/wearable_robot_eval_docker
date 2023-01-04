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

var dockerServicePort = 8080;
var currentPort = 8080;

const dockerRun = function (imageName, port, callback) {
  docker.run(
    imageName,
    [],
    process.stdout,
    {
      ExposedPorts: { "80/tcp": {} },
      Hostconfig: {
        PortBindings: { "80/tcp": [{ HostPort: `${port}` }] },
      },
    },
    function (err, data, container) {
      if (err) {
        return console.error(err);
      }
      console.log(data.StatusCode);
      console.log("-------");
      callback();
      console.log("-------");
    }
  );
};

const express = require("express");
// const router = express.Router({ mergeParams: true });
var path = require("path");

const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.engine(".html", require("ejs").__express);
app.set("views", path.join(__dirname, ""));
app.set("view engine", "html");

app.get("/", function (req, res) {
  res.render("index", {});
});

app.get("/tutorial/:port", function (req, res) {
  const port = req.params.port;
  currentPort = port;
  res.render("tutorial", { port: port });
});

app.get("/code/:port", function (req, res) {
  const port = req.params.port;
  currentPort = port;
  res.render("code", { port: port });
});

app.get("/simulator/:port", function (req, res) {
  const port = req.params.port;
  currentPort = port;
  res.render("simulator", { port: port });
});

// const pathRewrite = function (path, req) {
//   // return path.replace(`/vm/${dockerServicePort}`, "");
//   console.log("pathRewrite");
//   console.log(path);
//   let vm = path.split("/")[1];
//   console.log(vm);
//   let port = path.split("/")[2];
//   console.log(port);
//   port = currentPort;
//   return path.replace(`/vm/${port}`, "");
//   //return path.replace("/vm/8080", "");
// };

let vmRoutes = {
  "/vm/8080": [{ proxy_pass: "http://localhost:8080/" }],
  "/vm/8081": [{ proxy_pass: "http://localhost:8081/" }],
  "/vm/8082": [{ proxy_pass: "http://localhost:8082/" }],
};

//https://github.com/spherex-dev/nginx-route-manager
let renderServer = function (vmRoutes) {
  return `server {
    listen 80;
    server_name _;

  location /vm/8080/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host             $host;
        proxy_set_header X-Real-IP        $remote_addr;
        proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_http_version                1.1;
        proxy_set_header                  Upgrade $http_upgrade;
        proxy_set_header                  Connection upgrade;
    }

  location /vm/8081/ {
        proxy_pass http://localhost:8081/;
        proxy_set_header Host             $host;
        proxy_set_header X-Real-IP        $remote_addr;
        proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_http_version                1.1;
        proxy_set_header                  Upgrade $http_upgrade;
        proxy_set_header                  Connection upgrade;
    }

  location /vm/8082/ {
        proxy_pass http://localhost:8082/;
        proxy_set_header Host             $host;
        proxy_set_header X-Real-IP        $remote_addr;
        proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_http_version                1.1;
        proxy_set_header                  Upgrade $http_upgrade;
        proxy_set_header                  Connection upgrade;
    }

  location / {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host             $host;
        proxy_set_header X-Real-IP        $remote_addr;
        proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_http_version                1.1;
        proxy_set_header                  Upgrade $http_upgrade;
        proxy_set_header                  Connection upgrade;
        access_log                        off;
    }
}
`;
};

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const readline = require("readline");

let reloadNginx = function () {
  const config = renderServer(vmRoutes);

  console.log("reloadNginx");
  fs.writeFile("/tmp/default", config, (err) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
    let args = ["cp", "/tmp/default", "/etc/nginx/sites-available/"];
    const cp = spawn("sudo", args);
    cp.stdout.on("close", (code) => {
      console.log(code); // TODO check code
      let args = ["nginx", "-s", "reload"];
      let nginxPid = spawn("sudo", args);
      console.log("nginx reloaded");
    });
  });
};

app.get("/createVm/:imageId", function (req, res) {
  const imageId = req.params.imageId;
  if (imageId == "1")
    dockerRun("wearable:foxy-desktop", dockerServicePort, reloadNginx);
  if (imageId == "2")
    dockerRun("wearable:turtlesim", dockerServicePort, reloadNginx);
  if (imageId == "3")
    dockerRun("wearable:turtlesim", dockerServicePort, reloadNginx);

  setTimeout(reloadNginx, 3000);
  // app.use(
  //   `/vm/${dockerServicePort}`,
  //   createProxyMiddleware({
  //     target: `http://localhost:${dockerServicePort}/`,
  //     changeOrigin: true,
  //     pathRewrite: pathRewrite,
  //     ws: true,
  //     // router: function (req) {
  //     // console.log(req);
  //     // if (req.query && req.query.port === 8083) return "http://localhost:8083/";
  //     // if (req.query && req.query.port === 8084) return "http://localhost:8084/";
  //     // if (req.query && req.query.port === 8085) return "http://localhost:8085/";
  //     // if (req.query && req.query.port === 8086) return "http://localhost:8086/";
  //     // return "http://localhost:8086";
  //     // },
  //   })
  // );

  console.log(dockerServicePort);
  dockerServicePort++;
});

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
