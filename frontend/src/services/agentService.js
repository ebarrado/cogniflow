const API_BASE = 'http://localhost:3000/api/agents';

async function postJSON(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return response.json();
}

export async function criarNovoDocumento(payload) {
  return postJSON(`${API_BASE}/new-document`, payload);
}

export async function fragmentarTarefa(payload) {
  return postJSON(`${API_BASE}/focus`, payload);
}

export async function analisarContexto(payload) {
  return postJSON(`${API_BASE}/context`, payload);
}

export async function validarTexto(payload) {
  return postJSON(`${API_BASE}/calm`, payload);
}

export async function classificarPerfil(payload) {
  return postJSON(`${API_BASE}/profile`, payload);
}

export async function orquestrarBlend(payload) {
  return postJSON(`${API_BASE}/blend`, payload);
}