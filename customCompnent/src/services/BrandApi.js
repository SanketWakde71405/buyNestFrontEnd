import apiClient from "./ApiClient";

class BrandApi{
    constructor(){
        this.basePath = "/api/v1/brands";
    }

    async getBrandForCategories(categoryId){
        const response= await apiClient.get(`${this.basePath}/category/${categoryId}`);
        return response.data;
    }

    async createBrand({name, slug, description, categories}){
        const response = await apiClient.post(`${this.basePath}/add-brand`, {
          name,
          slug,
          description,
          categories,
        });

        return response.data;
    }

    async updateBrandLogo(formData){
        const response = await apiClient.patch(
          `${this.basePath}/update-brand-logo`,
          formData
        );

        return response.data;
    }

}

export default new BrandApi();