const XIBO_CMS_URL = process.env.XIBO_CMS_URL!;
const XIBO_CLIENT_ID = process.env.XIBO_CLIENT_ID!;
const XIBO_CLIENT_SECRET = process.env.XIBO_CLIENT_SECRET!;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const res = await fetch(`${XIBO_CMS_URL}/api/authorize/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: XIBO_CLIENT_ID,
      client_secret: XIBO_CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Xibo auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

async function xiboFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${XIBO_CMS_URL}/api${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export const xibo = {
  // Displays
  async getDisplays() {
    const res = await xiboFetch("/display");
    return res.json();
  },

  async getDisplay(id: number) {
    const res = await xiboFetch(`/display/${id}`);
    return res.json();
  },

  async authorizeDisplay(id: number) {
    const res = await xiboFetch(`/display/authorise/${id}`, { method: "PUT" });
    return res.json();
  },

  async setDefaultLayout(displayId: number, layoutId: number) {
    const res = await xiboFetch(`/display/defaultlayout/${displayId}`, {
      method: "PUT",
      body: JSON.stringify({ layoutId }),
    });
    return res.json();
  },

  // Display Groups
  async getDisplayGroups() {
    const res = await xiboFetch("/displaygroup");
    return res.json();
  },

  async createDisplayGroup(displayGroup: string, description?: string) {
    const res = await xiboFetch("/displaygroup", {
      method: "POST",
      body: JSON.stringify({ displayGroup, description }),
    });
    return res.json();
  },

  async assignDisplayToGroup(groupId: number, displayId: number) {
    const res = await xiboFetch(`/displaygroup/${groupId}/display/assign`, {
      method: "POST",
      body: JSON.stringify({ id: [displayId] }),
    });
    return res.json();
  },

  // Folders
  async getFolders() {
    const res = await xiboFetch("/folder");
    return res.json();
  },

  async createFolder(text: string, parentId?: number) {
    const res = await xiboFetch("/folder", {
      method: "POST",
      body: JSON.stringify({ text, parentId }),
    });
    return res.json();
  },

  // Users
  async getUsers() {
    const res = await xiboFetch("/user");
    return res.json();
  },

  async createUser(user: {
    userName: string;
    password: string;
    email: string;
    userTypeId: number;
    homePageId?: number;
  }) {
    const res = await xiboFetch("/user", {
      method: "POST",
      body: JSON.stringify(user),
    });
    return res.json();
  },

  // Layouts
  async getLayouts() {
    const res = await xiboFetch("/layout");
    return res.json();
  },

  // Media Library
  async getMedia() {
    const res = await xiboFetch("/library");
    return res.json();
  },

  async uploadMedia(formData: FormData) {
    const token = await getAccessToken();
    const res = await fetch(`${XIBO_CMS_URL}/api/library`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },

  // Schedules
  async getSchedules() {
    const res = await xiboFetch("/schedule");
    return res.json();
  },
};
