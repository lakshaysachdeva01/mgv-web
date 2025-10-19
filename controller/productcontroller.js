const { API_BASE_URL } = require('../config/config');
const { getWebsiteID, fetchData } = require('../utils/helper');

exports.getProducts = async(req, res) => {  
    console.log('📦 getProducts called');
    const websiteID = await getWebsiteID(); 
    console.log('✅ Website ID for products:', websiteID);
    const data = await fetchData(`${API_BASE_URL}/website/product-management/get-all-products/${websiteID}`);
    console.log('✅ Products fetched:', data);
    
    // Reverse the array to show products in reverse order
    if (data && Array.isArray(data)) {
        return data.reverse();
    }
    
    return data || [];
    
};

exports.getProductDetails = async(slug) => {
    console.log('🔍 getProductDetails called with slug:', slug);
    const websiteID = await getWebsiteID(); 
    console.log('✅ Website ID for product details:', websiteID);
    const data = await fetchData(`${API_BASE_URL}/website/product-management/get-product-by-slug/${websiteID}?slug=${slug}`);
    console.log('✅ Product details fetched:', data ? 'Found' : 'Not found');
    return data || null
}


exports.getjobs = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
     const data = await fetchData(`${API_BASE_URL}/website/job-listing/get-all-jobs/${websiteID}`);
     return data || null
};
exports.getjobdetails = async (slug) => {  
    const websiteID = await getWebsiteID(); 
    const data = await fetchData(`${API_BASE_URL}/website/job-listing/get-all-jobs/${websiteID}`);

    if (data && Array.isArray(data)) {
        return data.find(job => job.seoDetails?.slug === slug) || null;
    }

    return null;
};

exports.getotherjobs = async (slug) => {  
    const websiteID = await getWebsiteID(); 
    const data = await fetchData(`${API_BASE_URL}/website/job-listing/get-all-jobs/${websiteID}`);

    if (data && Array.isArray(data)) {
        return data.filter(job => job.seoDetails?.slug !== slug);
    }

    return [];
};

exports.getProductsByCategory = async(categoryId) => {  
    console.log('📦 getProductsByCategory called with categoryId:', categoryId);
    const websiteID = await getWebsiteID(); 
    console.log('✅ Website ID for category products:', websiteID);
    
    const data = await fetchData(`${API_BASE_URL}/website/product-management/get-all-products/${websiteID}?categories=${categoryId}`);
    console.log('✅ Category products fetched:', data);
    
    // Reverse the array to show products in reverse order
    if (data && Array.isArray(data)) {
        return data.reverse();
    }
    
    return data || [];
};

exports.getCategories = async() => {  
    console.log('📦 getCategories called');
    const websiteID = await getWebsiteID(); 
    console.log('✅ Website ID for categories:', websiteID);
    
    try {
        // First try the categories endpoint
        const categoriesData = await fetchData(`${API_BASE_URL}/website/category/get-all-categories/${websiteID}`);
        console.log('✅ Categories endpoint result:', categoriesData);
        
        if (categoriesData && categoriesData.length > 0) {
            console.log('✅ Categories count:', categoriesData.length);
            return categoriesData;
        }
        
        // If categories endpoint doesn't work, extract from products
        console.log('📦 Categories endpoint empty, trying to extract from products...');
        const productsData = await fetchData(`${API_BASE_URL}/website/product-management/get-all-products/${websiteID}`);
        console.log('✅ Products data for categories:', productsData);
        
        if (productsData && productsData.length > 0) {
            // Extract unique categories from products
            const uniqueCategories = [];
            const categoryMap = new Map();
            
            productsData.forEach(product => {
                if (product.category && product.category._id && product.category.name) {
                    if (!categoryMap.has(product.category._id)) {
                        categoryMap.set(product.category._id, product.category);
                        uniqueCategories.push(product.category);
                    }
                }
            });
            
            console.log('✅ Extracted categories from products:', uniqueCategories.length);
            console.log('✅ Categories:', uniqueCategories);
            return uniqueCategories;
        }
        
        return [];
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        return [];
    }
};
