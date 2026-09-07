// services/SupplierApi.js
import apiClient from "./ApiClient";

class SupplierApi {
  constructor() {
    this.basePath = "/api/v1/suppliers";
  }

  async createSupplier({
    supplierName,
    contactPerson,
    contactDetails,
    pendingAmount,
  }) {
    const response = await apiClient.post(`${this.basePath}/add-supplier`, {
      supplierName,
      contactPerson,
      contactDetails,
      pendingAmount,
    });

    return response.data;
  }

  async updateSupplierDetails(
    supplierId,
    { supplierName, contactPerson, contactDetails },
  ) {
    const response = await apiClient.patch(`${this.basePath}/${supplierId}`, {
      supplierName,
      contactPerson,
      contactDetails,
    });

    return response.data;
  }

  async updateSupplierPendingAmount(supplierId, amount, mode = "set") {
    const response = await apiClient.patch(
      `${this.basePath}/${supplierId}/pending-amount`,
      { amount, mode },
    );

    return response.data;
  }

  async getAllSuppliers() {
    const response = await apiClient.get(`${this.basePath}/`);
    return response.data;
  }

  async getSupplierById(supplierId) {
    const response = await apiClient.get(`${this.basePath}/${supplierId}`);
    return response.data;
  }

  async deleteSupplier(supplierId) {
    const response = await apiClient.delete(`${this.basePath}/${supplierId}`);
    return response.data;
  }
}

export default new SupplierApi();
