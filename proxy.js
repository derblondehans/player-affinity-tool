// VGA Planets – Lokaler CORS-Proxy
// Startet einen Mini-Server auf localhost:8765
// Anforderung: Node.js (https://nodejs.org)

const VERSION = '1.6.0';

const http  = require('http');
const https = require('https');
const zlib  = require('zlib');
const url   = require('url');

const PORT   = 8765;
const TARGET = 'api.planets.nu';

function apiGet(path, callback) {
  // Versuche zuerst HTTPS (Port 443), dann HTTP (Port 80)
  const attempts = [
    { lib: https, port: 443, proto: 'https' },
    { lib: http,  port: 80,  proto: 'http'  },
  ];

  function tryNext(i) {
    if (i >= attempts.length) {
      return callback(new Error('Weder HTTPS noch HTTP erreichbar'), null, null);
    }

    const { lib, port, proto } = attempts[i];
    const options = {
      hostname: TARGET,
      port,
      path,
      method:   'GET',
      headers: {
        'Host':            TARGET,
        'Accept-Encoding': 'gzip',
        'User-Agent':      'Mozilla/5.0',
        'Connection':      'close',
      }
    };

    console.log(`→ GET ${proto}://${TARGET}${path}`);

    const req = lib.request(options, (res) => {
      const encoding = (res.headers['content-encoding'] || '').toLowerCase();
      console.log(`  Status: ${res.statusCode}, Encoding: "${encoding}"`);

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        console.log(`  Empfangen: ${raw.length} bytes`);

        if (raw.length === 0) {
          return callback(null, res.statusCode,
            Buffer.from('{"success":false,"error":"Leere Antwort vom Server"}'));
        }

        const finish = (buf) => {
          console.log(`  Inhalt: ${buf.toString('utf8').slice(0, 120)}`);
          callback(null, res.statusCode, buf);
        };

        if (encoding === 'gzip') {
          zlib.gunzip(raw, (err, decoded) => {
            if (err) return callback(new Error('GZIP-Fehler: ' + err.message), null, null);
            finish(decoded);
          });
        } else if (encoding === 'deflate') {
          zlib.inflate(raw, (err, decoded) => {
            if (err) return callback(new Error('Deflate-Fehler: ' + err.message), null, null);
            finish(decoded);
          });
        } else {
          finish(raw);
        }
      });

      res.on('error', e => callback(e, null, null));
    });

    req.setTimeout(10000, () => req.destroy(new Error('Timeout')));

    req.on('error', (e) => {
      console.warn(`  ${proto.toUpperCase()} fehlgeschlagen: ${e.message} → nächster Versuch...`);
      tryNext(i + 1);
    });

    req.end();
  }

  tryNext(0);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const apiPath = url.parse(req.url, true).path;

  apiGet(apiPath, (err, status, body) => {
    if (err) {
      console.error('Fehler:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    res.writeHead(status, {
      'Content-Type':                'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Content-Length':              body.length,
    });
    res.end(body);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log(`  ✦ VGA Planets CORS-Proxy v${VERSION} läuft`);
  console.log(`  → http://localhost:${PORT}`);
  console.log('');
  console.log('  Öffne jetzt vga_planets_client_local.html im Browser.');
  console.log('  Dieses Fenster offen lassen solange du spielst.');
  console.log('  Beenden: Strg+C');
  console.log('');
});
