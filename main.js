// Create a simple HTTP API that returns a welcome message in JSON format when a POST request is made to /hello

const http = require("http"),
  url = require("url"),
  { StringDecoder } = require("string_decoder"),
  defaultPort = 3000,
  //Instantiate the HTTP server.
  httpServer = http.createServer((req, res) => unifiedServer(req, res));

//Start the server.
httpServer.listen(defaultPort, () => {
  console.log(`The server is listening on port ${defaultPort}`);
});

//Define functions for request processing.
const parsedUrl = req => url.parse(req.url, true),
  { parse } = require("querystring"),
  trimmedPath = req => parsedUrl(req).pathname.replace(/^\/+|\/+$/g, ""),
  method = req => req.method.toLowerCase(),
  headers = req => req.headers,
  decoder = () => new StringDecoder("utf-8"),
  reversedWords = words => {
    const reversed = {};
    for (let key in words) {
      const chars = Array.from(words[key]),
        length = chars.length;
      reversed[key] = chars.map((_, i, a) => a[length + ~i]).join("");
    }
    return reversed;
  },
  getHandler = req => {
    const $method = method(req),
      ok = 200,
      notImplemented = 501,
      notFound = 404,
      POST = "post",
      $headers = headers(req),
      defaultPayload = buffer => {
        return buffer
          ? { data: reversedWords(buffer), method: $method, headers: $headers }
          : {
              data: {},
              warning:
                "API expects an object with string values. No payload was received.",
              headers: $headers
            };
      },
      $trimmedPath = trimmedPath(req);

    return (
      {
        hello: [
          $method === POST ? ok : notImplemented,
          $method === POST
            ? defaultPayload
            : () => {
                return {
                  error: 'This API only supports "POST" method.',
                  code: notImplemented,
                  headers: $headers
                };
              }
        ]
      }[$trimmedPath] || [
        notFound,
        () => {
          return {
            error: `No resource for path '${$trimmedPath}'.`,
            method: $method,
            code: notFound,
            headers: $headers
          };
        }
      ]
    );
  },
  returnResponse = (req, res) => {
    const $decoder = decoder();
    let buffer = "",
      payload;
    req.on("data", data => {
      buffer += $decoder.write(data);
    });
    req.on("end", data => {
      buffer += $decoder.end(data);
      const [$statusCode, $payload] = getHandler(req);
      payload = buffer ? $payload(parse(buffer)) : $payload();
      res.setHeader("Content-Type", "application/json");
      res.writeHead($statusCode);
      res.end(JSON.stringify(payload));
    });
  },
  unifiedServer = (req, res) => {
    [parsedUrl, trimmedPath, method, headers, returnResponse]
      //Adjust slice to troubleshoot isolated functions.
      //index 0 runs them all
      //index 5 runs last function which returns the response to client
      .slice(0)
      .forEach(f => console.dir(f(req, res)));
  };