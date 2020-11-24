const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json({ type: "*/*" }));

// app.use((req, res, next) => {
//   console.log("request", req.originalUrl);
//   next();
// });

app.post("/api/loadDir", (req, res) => {
  if (
    req.body.path === "" ||
    req.body.path === undefined ||
    req.body.path === null
  )
    res.json({ error: true, message: "path not defined" });
  else {
    let resolvedPath = path.resolve(process.cwd(), req.body.path);

    fs.readdir(resolvedPath, { withFileTypes: true }, (err, f) => {
      if (err) res.json({ message: err.message, error: true });
      else {
        let folders = [];
        let files = [];
        f.forEach((el) => {
          if (el.isDirectory()) folders.push(el.name);
          else if (el.isFile()) {
            files.push({ name: el.name, type: path.extname(el.name) });
          }
        });
        res.json({ folders, files, resolvedPath, error: false });
      }
    });
  }
});

app.get("/api/getFile/:name", (req, res) => {
  if (
    req.query.path === "" ||
    req.query.path === undefined ||
    req.query.path === null
  )
    res.json({ error: true, message: "path not defined" });
  else {
    let resolvedPath = path.resolve(process.cwd(), req.query.path);

    fs.access(resolvedPath, (err) => {
      if (err) res.json({ message: err.message, error: true });
      else
        res.sendFile(resolvedPath, (error) => {
          if (error) res.json({ error: true, message: error.message });
        });
    });
  }
});

app.get("/api/video/:name", (req, res) => {
  if (
    req.query.path === "" ||
    req.query.path === undefined ||
    req.query.path === null
  )
    res.json({ error: true, message: "path not defined" });
  const path = req.query.path;
  const stat = fs.statSync(path);
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": stat.size,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.post("/api/createFile", (req, res) => {
  if (
    req.body.filePath === "" ||
    req.body.filePath === undefined ||
    req.body.filePath === null
  )
    res.json({ error: true, message: "filePath not defined" });
  if (
    req.body.text === "" ||
    req.body.text === undefined ||
    req.body.text === null
  )
    res.json({ error: true, message: "text not defined" });

  fs.access(req.body.filePath, (err) => {
    if (err)
      fs.writeFile(req.body.filePath, req.body.text, function (err) {
        if (err) res.json({ message: err.message, error: true });
        else res.json({ message: "File saved successfully!", error: false });
      });
    else res.json({ message: "File already exists", error: true });
  });
});

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "build")));
  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.listen(process.env.PORT || 8001, "0.0.0.0", () => {
  console.log(`Server listening at port ${process.env.PORT || 8001}`);
});
