/**
 * CSRF-aware fetch client for the retained WhatsApp real-time endpoints.
 *
 * These routes live under the `web` middleware group (session/cookie auth) and
 * are polled live from the Customers page — live polling can't be expressed as
 * Inertia page props, so we hit them directly with `fetch`. Laravel's
 * VerifyCsrfToken accepts the XSRF-TOKEN cookie echoed back as an
 * X-XSRF-TOKEN header, which is what `request()` does for mutating verbs.
 *
 * Each method returns the parsed JSON body (mirroring the old axios client),
 * and throws an Error with `.status`/`.data` on a non-2xx response.
 */

/** Read Laravel's XSRF-TOKEN cookie (URL-decoded), or "" if absent. */
function xsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function buildQuery(params) {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries).toString();
}

async function request(method, url, { params, body, formData } = {}) {
  const headers = { Accept: "application/json" };
  const opts = { method, credentials: "same-origin", headers };

  if (method !== "GET") {
    headers["X-XSRF-TOKEN"] = xsrfToken();
    headers["X-Requested-With"] = "XMLHttpRequest";
  }

  if (formData) {
    // Let the browser set the multipart boundary Content-Type itself.
    opts.body = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url + buildQuery(params), opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const whatsapp = {
  status: () => request("GET", "/whatsapp/status"),
  conversations: (params) => request("GET", "/whatsapp/conversations", { params }),
  messages: (number, params) =>
    request("GET", `/whatsapp/messages/${encodeURIComponent(number)}`, { params }),
  sendMessage: (payload) => request("POST", "/whatsapp/send-message", { body: payload }),
  sendImage: (formData) => request("POST", "/whatsapp/send-image", { formData }),
  sendMedia: (formData) => request("POST", "/whatsapp/send-media", { formData }),
  calls: (params) => request("GET", "/whatsapp/calls", { params }),
  rejectCall: (callId, payload) =>
    request("POST", `/whatsapp/calls/${encodeURIComponent(callId)}/reject`, { body: payload }),
};

export default whatsapp;
