const BASE_URL = import.meta.env.VITE_BACKEND_URL;

class ApiClient {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = 10000; // 10 seconds
    this.isRefreshing = false;
    this.refreshPromise = null;
    this.logoutHandler = null;
  }

  /* Creates an AbortController for request timeout.*/
  createAbortController() {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    return {
      controller,
      clear: () => clearTimeout(timeoutId),
    };
  }

  setLogoutHandler(handler) {
    this.logoutHandler = handler;
  }

  /* Performs the actual fetch request.*/
  async fetchRequest(endpoint, options = {}) {
    const { controller, clear } = this.createAbortController();
    const { headers: optionHeaders, ...restOptions } = options; // pull headers out separately

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        credentials: "include",
        signal: controller.signal,
        ...restOptions, // spread everything else first (method, body, etc.)
        headers: {
          "Content-Type": "application/json",
          ...(optionHeaders || {}), // headers merged and applied LAST — can't be overwritten
        },
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      return {
        ok: response.ok,
        status: response.status,
        data,
      };
    } finally {
      clear();
    }
  }

  /* Refresh access token. Uses HttpOnly refresh token cookie.*/
  async refreshToken() {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = this.fetchRequest("/api/v1/auth/refresh-tokens", {
      method: "POST",
    });

    try {
      const response = await this.refreshPromise;

      if (!response.ok) {
        throw new Error("Unable to refresh session.");
      }

      return true;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /* Generic request method.*/
  async request(
    endpoint,
    { method = "GET", body = null, headers = {}, retry = true } = {},
  ) {
    const response = await this.fetchRequest(endpoint, {
      method,
      headers,
      ...(body && {
        body: JSON.stringify(body),
      }),
    });

    /* Auth endpoints must never re-enter the refresh/logout cascade below —
       otherwise a 401 from /logout or /refresh-tokens itself triggers another
       refresh attempt, which fails, which calls logout(), which calls /logout
       again, forever. A 401 here just means "not authenticated", full stop. */
    const isAuthEndpoint =
      endpoint.includes("/refresh-tokens") || endpoint.includes("/logout");

    /* Token expired.*/
    if (response.status === 401 && retry && !isAuthEndpoint) {
      try {
        await this.refreshToken();

        return this.request(endpoint, {
          method,
          body,
          headers,
          retry: false,
        });
      } catch {
        /* Notify application that session expired.*/
        if (this.logoutHandler) {
          await this.logoutHandler();
        }

        throw new Error("Session expired. Please login again.");
      }
    }

    if (!response.ok) {
      throw new Error(response.data?.message || "Something went wrong.");
    }

    return response.data;
  }

  /*GET*/
  get(endpoint) {
    return this.request(endpoint);
  }

  /*POST*/
  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body,
    });
  }

  /*PUT*/
  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body,
    });
  }

  /*PATCH*/
  patch(endpoint, body) {
    return this.request(endpoint, {
      method: "PATCH",
      body,
    });
  }

  /*DELETE*/
  delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

const apiClient = new ApiClient();

export default apiClient;
