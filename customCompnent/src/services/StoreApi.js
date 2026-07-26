import apiClient from "./ApiClient";

class StoreApi {
  constructor() {
    this.basePath = "/api/v1/store";
  }

  async createStore({
    storeName,
    description,
    categories,
    businessType,
    registrationNumber,
    address,
    businessEmail,
  }) {
    const response = await apiClient.post(`${this.basePath}/create-store`, {
      storeName,
      description,
      categories,
      businessType,
      registrationNumber,
      address,
      businessEmail,
    });

    return response.data;
  }

  async addStoreLogo(formData) {
    const response = await apiClient.patch(
      `${this.basePath}/add-store-logo`,
      formData,
    );
    return response.data;
  }

  async updateStoreDetails({
    storeName,
    description,
    categories,
    businessType,
    registrationNumber,
    businessEmail,
    address,
  }) {
    const response = await apiClient.put(`${this.basePath}/update-store`, {
      storeName,
      description,
      categories,
      businessType,
      registrationNumber,
      businessEmail,
      address,
    });

    return response.data;
  }
}

export default new StoreApi();
