const { API_BASE_URL, WEBSITE_UID, FETCH_METHODS } = require('../config/config');

exports.getWebsiteID = async () => { 
    const FETCH_WEBSITE_DETAILS_END_POINT = `${API_BASE_URL}/website/auth/get-website-by-uid/${WEBSITE_UID}`;
    const response = await fetch(FETCH_WEBSITE_DETAILS_END_POINT, {
      method: FETCH_METHODS.GET,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  
    const data = await response.json();
    return data?.data?._id || null;
  }


 

  // FETCH DATA
exports.fetchData = async (endpoint) => {
    try {  
      const response = await fetch(endpoint, {
        method: FETCH_METHODS.GET,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data || !data.data) {
        throw new Error('Invalid data received from the API.');
      }
  
      return data.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      // Consider re-throwing the error or returning a specific error object
      // to handle errors more gracefully in the calling function.
      throw error;
    }
  };