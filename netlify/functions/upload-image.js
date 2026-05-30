/**
 * IVB High Care — Netlify Function: upload-image
 *
 * Receives a base64-encoded image from the CMS and writes it
 * to the GitHub repo under images/<filename> via the GitHub API.
 *
 * Uses the same env vars as publish-content.js:
 *   GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH
 *
 * Payload shape:
 *   { filename: "team-foto.jpg", mimeType: "image/jpeg", data: "<base64>" }
 *
 * Response shape (success):
 *   { success: true, path: "images/team-foto.jpg", url: "https://..." }
 */

const GITHUB_API = 'https://api.github.com';

/* Allowed image MIME types */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

/* Max file size: 4 MB of base64 ≈ ~3 MB actual image */
const MAX_BASE64_BYTES = 4 * 1024 * 1024;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };
}

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

/* Sanitize filename: keep only safe chars, no path traversal */
function sanitizeFilename(raw) {
  return raw
    .replace(/[^a-zA-Z0-9._\-]/g, '-') /* replace unsafe chars */
    .replace(/\.{2,}/g, '.')            /* no .. sequences */
    .replace(/^\.+/, '')                /* no leading dots */
    .toLowerCase()
    .slice(0, 128);                     /* max length */
}

exports.handler = async function (event) {
  const origin = event.headers.origin || event.headers.Origin || '';

  /* ── CORS preflight ── */
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin), body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return respond(405, { error: 'Method not allowed' }, origin);
  }

  /* ── Auth ── */
  const authHeader = event.headers.authorization || event.headers.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return respond(401, { error: 'Unauthorized' }, origin);
  }

  try {
    /* ── Env vars ── */
    const token  = process.env.GITHUB_TOKEN;
    const owner  = process.env.GITHUB_OWNER;
    const repo   = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';

    if (!token || !owner || !repo) {
      return respond(500, { error: 'Server misconfiguration: missing GITHUB_TOKEN, GITHUB_OWNER, or GITHUB_REPO.' }, origin);
    }

    /* ── Parse body ── */
    if (!event.body) return respond(400, { error: 'Empty request body' }, origin);

    let payload;
    try { payload = JSON.parse(event.body); }
    catch (e) { return respond(400, { error: 'Invalid JSON: ' + e.message }, origin); }

    const { filename, mimeType, data: base64Data } = payload;

    /* ── Validate ── */
    if (!filename || typeof filename !== 'string') {
      return respond(400, { error: 'Missing or invalid filename' }, origin);
    }
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return respond(400, { error: `File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}` }, origin);
    }
    if (!base64Data || typeof base64Data !== 'string') {
      return respond(400, { error: 'Missing image data' }, origin);
    }
    if (base64Data.length > MAX_BASE64_BYTES) {
      return respond(400, { error: 'File too large. Maximum size is ~3 MB.' }, origin);
    }

    const safeFilename = sanitizeFilename(filename);
    if (!safeFilename) {
      return respond(400, { error: 'Filename became empty after sanitization' }, origin);
    }

    const filePath = `images/${safeFilename}`;

    /* ── Get current SHA if file already exists (needed for GitHub PUT) ── */
    let sha;
    try {
      const getRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
        { headers: githubHeaders(token) }
      );
      if (getRes.ok) {
        const existing = await getRes.json();
        sha = existing.sha;
      }
      /* 404 = new file, sha stays undefined */
    } catch (err) {
      /* Non-fatal — proceed without SHA, GitHub will create the file */
      console.warn('Could not fetch SHA for', filePath, err.message);
    }

    /* ── Write to GitHub ── */
    const putBody = {
      message: `Media upload: ${filePath}`,
      content: base64Data,
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

    if (!putRes.ok) {
      let errMsg = putRes.statusText;
      try { const e = await putRes.json(); errMsg = e.message || errMsg; } catch (_) {}
      return respond(putRes.status, { error: `GitHub API error: ${errMsg}` }, origin);
    }

    const putData = await putRes.json();
    const rawUrl = putData.content?.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

    return respond(200, {
      success: true,
      path: filePath,
      filename: safeFilename,
      url: rawUrl,
    }, origin);

  } catch (err) {
    console.error('upload-image unhandled error:', err);
    return respond(500, { error: 'Internal server error: ' + err.message }, origin);
  }
};
