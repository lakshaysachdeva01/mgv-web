const { API_BASE_URL } = require('../config/config');
const { getWebsiteID, fetchData } = require('../utils/helper');


exports.getgallery = async (req, res) => {  
    const websiteID = await getWebsiteID(); 
    let data = await fetchData(`${API_BASE_URL}/website/gallery/get-all-galleries/${websiteID}`);

    return Array.isArray(data) ? data.reverse() : data || null;
};

exports.getgalleryalbum = async (title) => {  
    const websiteID = await getWebsiteID(); 
    const data = await fetchData(`${API_BASE_URL}/website/gallery/get-all-galleries/${websiteID}`);
    
    // Filter the galleries by the title
    const filteredAlbums = data.filter(album => album.title.toLowerCase() === title.toLowerCase());

    // Return the filtered albums as an array (or empty array if no match)
    return filteredAlbums.length > 0 ? filteredAlbums : [];
};

exports.getLatestGalleryImages = async () => {
    try {
        const websiteID = await getWebsiteID();
        const response = await fetch(`${API_BASE_URL}/website/gallery/get-all-galleries/${websiteID}`);

        if (!response.ok) {
            console.error(`API request failed with status ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.data)) {
            console.error("Invalid API response structure", data);
            return [];
        }

        const latestImages = data.data.flatMap(album => {
            if (
                album.mediaDetails &&
                album.mediaDetails.images &&
                Array.isArray(album.mediaDetails.images) &&
                album.mediaDetails.images.length > 0
            ) {
                return album.mediaDetails.images.map(image => ({
                    url: `https://technolitics-s3-bucket.s3.ap-south-1.amazonaws.com/websitebuilder-s3-bucket/${image}`,
                    title: album.title
                }));
            }
            return [];
        });

        return latestImages.slice(-4).reverse(); // Get the latest 5 images
    } catch (error) {
        console.error("Error fetching latest gallery images:", error);
        return [];
    }
};
