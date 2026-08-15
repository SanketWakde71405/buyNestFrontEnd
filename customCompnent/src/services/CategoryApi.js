import apiClient from "./ApiClient";

class CategoryApi {
  constructor() {
    this.basePath = "/api/v1/categories";
  }

  async getParentCategories() {
    const response = await apiClient.get(`${this.basePath}/parent-categories`);
    return response.data;
  }

  async getCategoriesForStore(){
    const response= await apiClient.get(`${this.basePath}/store`);
    return response.data;
  }

  async getCategoryById(categoryId){
    const response = await apiClient.get(`${this.basePath}/${categoryId}`);
    return response.data;
  }

  async getSubCategories(parentCategoryName){
    const response = await apiClient.get(
      `${this.basePath}/sub-categories/${parentCategoryName}`
    );
    return response.data;
  }

}

export default new CategoryApi();
