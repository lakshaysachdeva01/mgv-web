const { API_BASE_URL } = require('../config/config');
const { getWebsiteID, fetchData } = require('../utils/helper');

exports.getBlog = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
   
     const data = await fetchData(`${API_BASE_URL}/website/post/get-all-posts/${websiteID}`);
     if (data && data.length > 0) {
        // Add formatted postDate to each blog item
        data.forEach(blog => {
            if (blog.createdAt) {
                blog.postDate = new Date(blog.createdAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                });
            } else {
                blog.postDate = "Date unavailable";
            }
        });
    }
     return data || null
};


exports.getBlogfull = async(slug) => {  
    const websiteID = await getWebsiteID(); 
     const data = await fetchData(`${API_BASE_URL}/website/post/get-post-by-slug/${websiteID}?slug=${slug}`);

     if (data && data.createdAt) {
        // Format the createdAt date as postDate
        data.postDate = new Date(data.createdAt).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    } else {
        data.postDate = "Date unavailable";
    }
     return data || null
};



exports.getlatestblogs = async (slug) => {  
    const websiteID = await getWebsiteID();
    const data = await fetchData(`${API_BASE_URL}/website/post/get-all-posts/${websiteID}`);

    if (!data || data.length === 0) {
        return []; // Return an empty array if no data is found
    }

    // Filter blogs with category 'BLOG' and exclude the one matching the provided slug
    const filteredBlogs = data.filter(blog => blog.category === "BLOG" && blog.seoDetails.slug !== slug);

    // Add formatted postDate to each blog item
    filteredBlogs.forEach(blog => {
        if (blog.createdAt) {
            try {
                blog.postDate = new Date(blog.createdAt).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                });
            } catch (error) {
                console.error(`Error formatting date for blog with ID ${blog._id}:`, error);
                blog.postDate = "Invalid date format";
            }
        } else {
            blog.postDate = "Date unavailable";
        }
    });

    return filteredBlogs;
};
