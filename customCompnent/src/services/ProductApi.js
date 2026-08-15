import apiClient from "./ApiClient";

class ProductApi {
  constructor() {
    this.basePath = "/api/v1/products";
  }

  async addProduct(productData) {
    const response = await apiClient.post(
      `${this.basePath}/add-product`,
      productData,
    );

    return response.data;
  }

  async getAllProducts() {
    const response = await apiClient.get(`${this.basePath}/`);
    return response.data;
  }

  async getProductById(productId) {
    const response = await apiClient.get(`${this.basePath}/${productId}`);
    return response.data;
  }

  async updateProduct({
    productId,
    title,
    slug,
    description,
    price,
    discountPrice,
    stock,
  }) {
    const response = await apiClient.put(`${this.basePath}/update`, {
      productId,
      title,
      slug,
      description,
      price,
      discountPrice,
      stock,
    });
    return response.data;
  }

  async deleteProduct(productId) {
    const response = await apiClient.delete(`${this.basePath}/${productId}`);
    return response.data;
  }

  async addProductImages(imageData) {
    const response = await apiClient.patch(
      `${this.basePath}/add-images`,
      imageData,
      { timeout: 30000 },
    );
    return response.data;
  }
}

export default new ProductApi();
