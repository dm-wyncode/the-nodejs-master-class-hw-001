// Create a simple HTTP API that returns a welcome message in JSON format when a POST request is made to /hello

const http = require("http"),
  url = require("url"),
  { StringDecoder } = require("string_decoder"),
  { parse } = require("querystring"),
  defaultPort = 3000,
  //Instantiate the HTTP server.
  httpServer = http.createServer((req, res) => unifiedServer(req, res));

//Start the server.
httpServer.listen(defaultPort, () => {
  console.log(`The server is listening on port ${defaultPort}`);
});

//Define functions for request processing.
const parsedUrl = req => url.parse(req.url, true),
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
  greeting = ({ name } = {}) => {
    return name ? `Hello, ${name}!` : "Hello!";
  },
  getHandler = req => {
    const $method = method(req),
      ok = 200,
      notImplemented = 501,
      notFound = 404,
      POST = "post",
      $headers = headers(req),
      helloPayload = buffer => {
        const defaultHelloPayload = {
          greeting: greeting(buffer),
          method: $method,
          headers: $headers
        };
        return buffer
          ? defaultHelloPayload
          : {
              ...defaultHelloPayload,
              warning:
                "API expects an object with key 'name' and a string value.. No payload was received so a default value was returned."
            };
      },
      reversePayload = buffer => {
        return buffer
          ? { data: reversedWords(buffer), method: $method, headers: $headers }
          : {
              data: {},
              method: $method,
              warning:
                "API expects an object with string values. No payload was received.",
              headers: $headers
            };
      },
      notImplementedHandler = () => {
        return {
          error: 'This API only supports "POST" method.',
          code: notImplemented,
          headers: $headers
        };
      },
      $trimmedPath = trimmedPath(req);

    return (
      //Object with keys as endpoints.
      {
        hello: [
          $method === POST ? ok : notImplemented,
          $method === POST ? helloPayload : notImplementedHandler
        ],
        reverse: [
          $method === POST ? ok : notImplemented,
          $method === POST ? reversePayload : notImplementedHandler
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
