// const { API_BASE_URL } = require('../config/config');
// const { getWebsiteID, fetchData } = require('../utils/helper');

// exports.getlocation = async(req, res) => {  
//     const websiteID = await getWebsiteID(); 
//      const data = await fetchData(`${API_BASE_URL}/website/branch-management/get-all-branches/${websiteID}`);
//      return data || null
     
// };

// exports.getfilteredlocation = async (name) => {  
//     const websiteID = await getWebsiteID(); 
//     const data = await fetchData(`${API_BASE_URL}/website/branch-management/get-all-branches/${websiteID}`);
    
//     if (Array.isArray(data)) {
//         const filteredData = data.find(location => location.basicDetails.name === name);
//         return filteredData || null; // Return the matched location or null if not found
//     }
   
//     return null;
// };
