import apiClient from "./ApiClient";

class AuthApi {
  constructor() {
    this.basePath = "/api/v1/auth";
  }

  /* Login user. Backend sets HttpOnly cookies. Returns user information only.*/
  async loginUser({ email, password }) {
    const response = await apiClient.post(`${this.basePath}/login`, {
      email,
      password,
    });

    return response.data;
  }

  /*Register a new user.*/
  async registerUser({ name, email, password, role }) {
    const response = await apiClient.post(`${this.basePath}/register`, {
      name,
      email,
      password,
      role,
    });

    return response.data;
  }

  /*Restore authenticated user. Uses accessToken cookie automatically.*/
  async getCurrentUser() {
    const response = await apiClient.get(`${this.basePath}/current-user`);

    return response.data;
  }

  /*Logout current user. Backend clears authentication cookies.*/
  async logoutUser() {
    await apiClient.post(`${this.basePath}/logout`);
  }

  async googleAuth(accessToken) {
    const res = await apiClient.post(`${this.basePath}/google`, {
      accessToken,
    });
    return res.data;
  }

  /*Refresh token. Usually called internally by ApiClient. Exposed in case it is ever needed manually.*/
  async refreshAccessToken() {
    await apiClient.post(`${this.basePath}/refresh-tokens`);
  }

  /*Send password reset email.*/
  async forgotPassword(email) {
    const response = await apiClient.post(`${this.basePath}/forgot-password`, {
      email,
    });

    return response;
  }

  /*Reset password using reset token.*/
  async resetPassword(resetToken, newPassword) {
    const response= await apiClient.post(`${this.basePath}/reset-password/${resetToken}`, {
      newPassword,
    });

    return response;
  }

  /*Change current password.*/
  async changePassword(oldPassword, newPassword) {
    await apiClient.post(`${this.basePath}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  /*Resend verification email.*/
  async resendVerificationEmail(email) {
    await apiClient.post(`${this.basePath}/resend-verification-email`, {
      email,
    });
  }

  /* Verify email. Your backend currently uses GET:/verify-email/:verificationToken*/
  async verifyEmail(token) {
    const response = await apiClient.get(
      `${this.basePath}/verify-email/${token}`,
    );
    return response.data;
  }

  /*Complete onboarding. Marks isFirstLogin as false in the database.*/
  async completeOnboarding(userId) {
    const response = await apiClient.patch(
      `${this.basePath}/complete-onboarding/${userId}`,
    );
    return response.data.data;
  }
}

export default new AuthApi();
