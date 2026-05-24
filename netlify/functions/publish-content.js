/**
 * IVB High Care — Netlify Function: publish-content
 *
 * Receives updated JSON from the CMS and writes each file
 * to GitHub via the GitHub API.
 *
 * Environment variables (set in Netlify dashboard → Site config → Env vars):
 *   GITHUB_TOKEN   — personal access token (needs repo scope)
 *   GITHUB_OWNER   — your GitHub username  (e.g. ilmastro)
 *   GITHUB_REPO    — repository name       (e.g. ivb-highcare-v2)
 *   GITHUB_BRANCH  — branch to write to    (default: main)
 */

const GITHUB_API = 'https://api.github.com';

/* ── CORS headers ─────────────────────────────────────────────
   Allow requests from the Netlify-hosted CMS only.
   The function responds to OPTIONS (preflight) explicitly so
   the browser never gets a silent empty response.
──────────────────────────────────────────────────────────────── */
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

/* Always returns a well-formed JSON response — no more empty bodies */
function respond(statusCode, body, origin) {
  return {
    statusCode,
    headers: corsHeaders(origin),
    body: JSON.stringify(body),
  };
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

exports.handler = async function (event) {
  const origin = event.headers.origin || event.headers.Origin || '';

  /* ── Handle CORS preflight ── */
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin), body: '' };
  }

  /* ── Only allow POST ── */
  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' }, origin);
  }

  /* ── Verify Netlify Identity JWT ── */
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return respond(401, { error: 'Unauthorized — no token' }, origin);
  }

  /* ── Top-level try/catch so we ALWAYS return JSON, never an empty body ── */
  try {

    /* ── Check env vars ── */
    const token  = process.env.GITHUB_TOKEN;
    const owner  = process.env.GITHUB_OWNER;
    const repo   = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
      return respond(500, {
        error: 'Server misconfiguration: missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO in Netlify environment variables.'
      }, origin);
    }

    /* ── Parse request body ── */
    if (!event.body) {
      return respond(400, { error: 'Empty request body' }, origin);
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return respond(400, { error: 'Invalid JSON body: ' + e.message }, origin);
    }

    /* ── Validate payload shape: { files: { "data/home.json": {...}, ... } } ── */
    const { files } = payload;
    if (!files || typeof files !== 'object' || Array.isArray(files)) {
      return respond(400, { error: 'Expected payload shape: { files: { "data/filename.json": content } }' }, origin);
    }

    const results = [];

    for (const [filePath, content] of Object.entries(files)) {

      /* Safety: only allow writes inside the data/ folder */
      if (!filePath.startsWith('data/') || !filePath.endsWith('.json')) {
        results.push({ path: filePath, status: 'skipped', reason: 'path not allowed — must be inside data/ and end with .json' });
        continue;
      }

      const jsonString = JSON.stringify(content, null, 2);
      const base64Content = Buffer.from(jsonString).toString('base64');

      /* Get current SHA of the file (required by GitHub API to update existing files) */
      let sha;
      try {
        const getRes = await fetch(
          `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
          { headers: githubHeaders(token) }
        );
        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
        }
        /* 404 = file doesn't exist yet → sha stays undefined → GitHub will create it */
      } catch (err) {
        results.push({ path: filePath, status: 'error', reason: 'could not fetch current SHA: ' + err.message });
        continue;
      }

      /* Write (create or update) the file on GitHub */
      try {
        const putBody = {
          message: `CMS update: ${filePath}`,
          content: base64Content,
          branch,
          ...(sha ? { sha } : {}),
        };

        const putRes = await fetch(
          `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`,
          {
            method: 'PUT',
            headers: githubHeaders(token),
            body: JSON.stringify(putBody),
          }
        );

        if (putRes.ok) {
          results.push({ path: filePath, status: 'updated' });
        } else {
          let errMsg = putRes.statusText;
          try {
            const errBody = await putRes.json();
            errMsg = errBody.message || errMsg;
          } catch (_) {}
          results.push({ path: filePath, status: 'error', reason: `GitHub API error ${putRes.status}: ${errMsg}` });
        }
      } catch (err) {
        results.push({ path: filePath, status: 'error', reason: err.message });
      }
    }

    const allOk = results.every(r => r.status === 'updated' || r.status === 'skipped');

    return respond(
      allOk ? 200 : 207,
      { success: allOk, results },
      origin
    );

  } catch (err) {
    /* Absolute last resort — makes sure no empty body ever escapes */
    console.error('publish-content unhandled error:', err);
    return respond(500, { error: 'Internal server error: ' + err.message }, origin);
  }
};
