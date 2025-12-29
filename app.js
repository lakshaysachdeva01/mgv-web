require('dotenv').config();  // Load environment variables from .env file
const { API_BASE_URL , WEBSITE_ID_KEY, S3_BASE_URL} = require('./config/config');
const { getWebsiteID } = require('./utils/helper');
const { getHomeDesktopBanner ,gettestimonial ,getAdBanner,getHomepopupBanner ,getclientle  } = require('./controller/homecontroller');
const { getBlog ,getBlogfull, getlatestblogs} = require('./controller/blogcontroller');
const { getgallery,getLatestGalleryImages} = require('./controller/gallerycontroller');
const { CONTACT_ENQUIRY_DYNAMIC_FIELDS_KEYS ,JOB_ENQUIRY_DYNAMIC_FIELDS_KEYS , BOOKING_ENQUIRY_DYNAMIC_FIELDS_KEYS} = require('./config/config');
const { getProducts, getProductDetails ,getCategories ,getjobs ,getjobdetails , getotherjobs, getSubcategoriesByCategory, getProductsByCategory } = require('./controller/productcontroller');
const express = require('express');
const path = require('path');
const app = express();
const port = 8284;
const metaLogoPath = "/assets/images/logo/MGV-meta-image.png";
// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Define the views directory

// Serve static files (like CSS, images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
    try {
        const categories = await getCategories();
        res.locals.categories = categories;
        next();
    } catch (error) {
        console.error('❌ Middleware - Error fetching categories:', error);
        res.locals.categories = [];
        next();
    }
});

app.get('/', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const websiteID = await getWebsiteID(); 
    const banners = await getHomeDesktopBanner();
    const testimonial = await gettestimonial();
    const blogs = await getBlog();
    const gallery= await getgallery();
    const clients = await getclientle();
    const popupbanners = await getHomepopupBanner();
   const latestImages = await getLatestGalleryImages();
   const seoDetails = {
    title: "Magic Global Ventures  | Oil, Gas & Building Materials Supplier UAE",
    metaDescription: "Leading industrial and construction solutions provider in UAE & India. Supplying oil & gas equipment, building materials, electricals, and more.",
    ogdescription:"Magic Global Ventures FZ-LLC, based in Dubai and Raipur (India), delivers world-class industrial, oil & gas, and building material solutions across UAE, Oman, Iraq, Saudi Arabia, Qatar, and Yemen. Trusted for quality, engineering expertise, and strong supplier connections worldwide.",
    metaImage: `${baseUrl}/${metaLogoPath}`,
    keywords: "Magic Global Ventures, MGV Dubai, mgvdubai.com, Magic Global Ventures FZ LLC, industrial suppliers Dubai, oil and gas equipment UAE, building materials supplier UAE, process equipment UAE, rotating equipment supplier, electrical equipment Dubai, instrumentation supplier UAE, pipes fittings valves supplier, drilling equipment Dubai, cement and concrete UAE, steel reinforcement supplier, construction materials Dubai, PPE tools and safety UAE, industrial supply Ras Al Khaimah, Magic Global Ventures India office, Raipur industrial supplier.",
    canonical: `${baseUrl}`,
};

   
   
    res.render('index', {body: "",baseUrl,latestImages, websiteID,popupbanners,testimonial,blogs,gallery,clients, API_BASE_URL,WEBSITE_ID_KEY,websiteID, CONTACT_ENQUIRY_DYNAMIC_FIELDS_KEYS, seoDetails,banners, isHomePage: true, activePage: 'home'});
});


app.get('/about', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const testimonial = await gettestimonial();
    const blogs = await getBlog();
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/about`,
    };
    
   
    res.render('about', {body: "",baseUrl,blogs,testimonial, seoDetails, activePage: 'about'});
});


app.get('/products', async (req, res) => {
    try {
        const baseUrl = req.protocol + '://' + req.get('Host');
        const categories = res.locals.categories || [];
        const websiteID = await getWebsiteID();
        const selectedCategoryId = req.query.category || null;
        
        // If category is selected, filter products server-side to avoid flash of all products
        let products;
        if (selectedCategoryId) {
            products = await getProductsByCategory(selectedCategoryId);
        } else {
            // Load all products only when no category filter is applied
            products = await getProducts();
        }
        
        // Get category name if category is selected
        let categoryName = null;
        if (selectedCategoryId && categories.length > 0) {
            const selectedCategory = categories.find(cat => cat._id === selectedCategoryId);
            categoryName = selectedCategory ? selectedCategory.name : null;
        }
        
        const seoDetails = {
            title: categoryName ? `${categoryName} Products` : "Our Products ",
            metaDescription: "",
            metaImage: `${baseUrl}/${metaLogoPath}`,
            keywords: "",
            canonical: `${baseUrl}/products${selectedCategoryId ? `?category=${selectedCategoryId}` : ''}`,
        };

        res.render('products', { 
            body: "", 
            products, 
            baseUrl, 
            seoDetails, 
            S3_BASE_URL, 
            API_BASE_URL,
            WEBSITE_ID_KEY,
            websiteID,
            categoryName,
            categories,
            selectedCategoryId,
            activePage: 'products'
        });
    } catch (error) {
        console.error('Error loading products page:', error);
        const baseUrl = req.protocol + '://' + req.get('Host');
        const websiteID = await getWebsiteID();
        const selectedCategoryId = req.query.category || null;
        const seoDetails = {
            title: "Our Products - ",
            metaDescription: "",
            metaImage: `${baseUrl}/${metaLogoPath}`,
            keywords: "",
            canonical: `${baseUrl}/products`,
        };
        
        // Render page with empty products array
        res.render('products', { 
            body: "", 
            products: [], 
            baseUrl, 
            seoDetails,  
            S3_BASE_URL,
            API_BASE_URL,
            WEBSITE_ID_KEY,
            websiteID,
            categoryName: null,
            categories: res.locals.categories || [],
            selectedCategoryId,
            activePage: 'products'
        });
    }
});

app.get('/product/:slug', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const { slug } = req.params;
    const productDetails = await getProductDetails(slug);
    const websiteID = await getWebsiteID();
    
    if (!productDetails) {
        return res.redirect('/products');
    }

    const seoDetails = {
        title: productDetails.title || "Product Details",
        metaDescription: productDetails.description ? productDetails.description.replace(/<[^>]*>/g, '').substring(0, 160) : "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: productDetails.keywords || "",
        canonical: `${baseUrl}/product/${slug}`,
    };

    res.render('details', {
        body: "",
        baseUrl,
        product: productDetails,
        seoDetails,
        S3_BASE_URL,
        API_BASE_URL,
        WEBSITE_ID_KEY,
        websiteID,
        activePage: 'products'
    });
});


app.get('/career', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const jobs = await getjobs();
    const seoDetails = {
        title: "Job Opportunities - ",
        metaDescription: "Explore exciting career opportunities at . Join our team of professionals in the steel manufacturing industry.",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "jobs, careers, employment, steel industry jobs",
        canonical: `${baseUrl}/jobs`,
    };
    
    res.render('career', { body: "", baseUrl, seoDetails, jobs, activePage: 'career' });
});

app.get('/job/:slug', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const { slug } = req.params;
    const websiteID = await getWebsiteID();
    const job = await getjobdetails(slug);
    const otherJobs = await getotherjobs(slug);
    const seoDetails = {
        title: job?.seoDetails?.title || "Job Details - Magic Global Ventures",
        metaDescription: job?.seoDetails?.metaDescription || job?.description?.replace(/<[^>]*>/g, '').substring(0, 160) || "View job details and apply for this position at Magic Global Ventures",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: job?.seoDetails?.tags?.join(', ') || "job, career, employment",
        canonical: `${baseUrl}/job/${slug}`,
    };
    
    res.render('jobdetail', {
        body: "", 
        baseUrl, 
        seoDetails, 
        job, 
        otherJobs,
        websiteID,
        API_BASE_URL,
        WEBSITE_ID_KEY,
        JOB_ENQUIRY_DYNAMIC_FIELDS_KEYS
    });
});

app.get('/post/:slug', async (req, res) => {

    const baseUrl = req.protocol + '://' + req.get('Host');
    const { slug } = req.params; // Extract slug from params
        
        console.log(`Fetching blog for slug: ${slug}`);
        
    const blogDetails = await getBlogfull(slug);
        
        if (!blogDetails) {
            console.log(`No blog found for slug: ${slug}`);
            return res.status(404).render('404', {
                body: "",
                baseUrl,
                seoDetails: {
                    title: "Blog Not Found",
                    metaDescription: "The requested blog post was not found.",
                    metaImage: `${baseUrl}/${metaLogoPath}`,
                    keywords: "",
                    canonical: `${baseUrl}/blog/${slug}`,
                }
            });
        }
        
        console.log(`Blog found: ${blogDetails.title || 'No title'}`);
        
    const testimonial = await gettestimonial();
    const websiteID = await getWebsiteID(); 
   
    const adbanner = await getAdBanner();
    const blogs = await getBlog();
    const latestblog = await getlatestblogs(slug);
        
    // Helper function to extract first N words from description
    const truncateToWords = (text, wordCount) => {
        if (!text) return '';
        // Strip HTML tags first
        const plainText = text.replace(/<[^>]*>/g, '');
        const words = plainText.split(/\s+/).filter(word => word.length > 0);
        return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
    };

    // Get blog banner image
    const getBlogBannerImage = (blog) => {
        if (blog?.banner?.image) {
            return S3_BASE_URL + blog.banner.image;
        }
        return null;
    };
  
    const seoDetails = {
            title: blogDetails?.seoDetails?.title || blogDetails.title || "Blog Post",
            metaDescription: blogDetails?.seoDetails?.metaDescription || truncateToWords(blogDetails?.description, 60) || "Read our latest blog post",
            metaImage: getBlogBannerImage(blogDetails) || `${baseUrl}/${metaLogoPath}`,
            keywords: Array.isArray(blogDetails?.seoDetails?.tags) ? blogDetails.seoDetails.tags.join(', ') : (blogDetails.keywords || ""),
            canonical: `${baseUrl}/blog/${slug}`,
    };

    res.render('blogpost', {
        body: "",
       baseUrl,
       blogDetails,
        seoDetails,
        adbanner,
        latestblog,
        blogs,
       testimonial,websiteID,API_BASE_URL,WEBSITE_ID_KEY, BOOKING_ENQUIRY_DYNAMIC_FIELDS_KEYS,
       activePage: 'posts'
        });
   
});


app.get('/gallery', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const gallery = await getgallery();
    
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/gallery`,
    };

    res.render('gallery', { body: "", gallery, seoDetails });
});
app.get('/gallery/:filter', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const { filter } = req.params;
    const gallery = await getgallery();

    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/gallery/${filter}`,
    };

    res.render('gallery', { body: "", gallery, seoDetails });
});


app.get('/contact', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const websiteID = await getWebsiteID(); 
    
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/contact`,
    };

    res.render('contact', { body: "", websiteID, API_BASE_URL, WEBSITE_ID_KEY, CONTACT_ENQUIRY_DYNAMIC_FIELDS_KEYS, seoDetails });
});



app.get('/posts', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
  
    const blogs = await getBlog();
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/blogs`,
    };

    res.render('blogs', { body: "", blogs, baseUrl, seoDetails, activePage: 'blogs' });
});


app.get('/thankyou', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: "",
    } 
    res.render('thankyou', {body: "",seoDetails});
});





app.get('/blog/:slug', async (req, res) => {

    const baseUrl = req.protocol + '://' + req.get('Host');
    const { slug } = req.params; // Extract slug from params
        
        console.log(`Fetching blog for slug: ${slug}`);
        
    const blogDetails = await getBlogfull(slug);
        
        if (!blogDetails) {
            console.log(`No blog found for slug: ${slug}`);
            return res.status(404).render('404', {
                body: "",
                baseUrl,
                seoDetails: {
                    title: "Blog Not Found",
                    metaDescription: "The requested blog post was not found.",
                    metaImage: `${baseUrl}/${metaLogoPath}`,
                    keywords: "",
                    canonical: `${baseUrl}/blog/${slug}`,
                }
            });
        }
        
        console.log(`Blog found: ${blogDetails.title || 'No title'}`);
        
    const testimonial = await gettestimonial();
    const websiteID = await getWebsiteID(); 
   
    const adbanner = await getAdBanner();
    const blogs = await getBlog();
    const latestblog = await getlatestblogs(slug);
        
    // Helper function to extract first N words from description
    const truncateToWords = (text, wordCount) => {
        if (!text) return '';
        // Strip HTML tags first
        const plainText = text.replace(/<[^>]*>/g, '');
        const words = plainText.split(/\s+/).filter(word => word.length > 0);
        return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
    };

    // Get blog banner image
    const getBlogBannerImage = (blog) => {
        if (blog?.banner?.image) {
            return S3_BASE_URL + blog.banner.image;
        }
        return null;
    };
  
    const seoDetails = {
            title: blogDetails?.seoDetails?.title || blogDetails.title || "Blog Post",
            metaDescription: blogDetails?.seoDetails?.metaDescription || truncateToWords(blogDetails?.description, 60) || "Read our latest blog post",
            metaImage: getBlogBannerImage(blogDetails) || `${baseUrl}/${metaLogoPath}`,
            keywords: Array.isArray(blogDetails?.seoDetails?.tags) ? blogDetails.seoDetails.tags.join(', ') : (blogDetails.keywords || ""),
            canonical: `${baseUrl}/blog/${slug}`,
    };

    res.render('blogpost', {
        body: "",
       baseUrl,
       blogDetails,
        seoDetails,
        adbanner,
        latestblog,
        blogs,
       testimonial,websiteID,API_BASE_URL,WEBSITE_ID_KEY, BOOKING_ENQUIRY_DYNAMIC_FIELDS_KEYS,
       activePage: 'posts'
        });
   
});


app.get('/product/:slug', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const { slug } = req.params;
    const productDetails = await getProductDetails(slug);
    const websiteID = await getWebsiteID();
    
    if (!productDetails) {
        return res.redirect('/products');
    }

    // Helper function to extract first N words from description
    const truncateToWords = (text, wordCount) => {
        if (!text) return '';
        // Strip HTML tags first
        const plainText = text.replace(/<[^>]*>/g, '');
        const words = plainText.split(/\s+/).filter(word => word.length > 0);
        return words.slice(0, wordCount).join(' ') + (words.length > wordCount ? '...' : '');
    };

    // Get first product image for meta image
    const getFirstProductImage = (product) => {
        if (product?.arrays?.arrayOne && Array.isArray(product.arrays.arrayOne) && product.arrays.arrayOne.length > 0) {
            return S3_BASE_URL + product.arrays.arrayOne[0];
        }
        return null;
    };

    const seoDetails = {
        title: productDetails?.seoDetails?.title || productDetails.title || "Product Details",
        metaDescription: productDetails?.seoDetails?.metaDescription || truncateToWords(productDetails?.description, 60) || "",
        metaImage: getFirstProductImage(productDetails) || `${baseUrl}/${metaLogoPath}`,
        keywords: Array.isArray(productDetails?.tags) ? productDetails.tags.join(', ') : (productDetails.keywords || ""),
        canonical: `${baseUrl}/product/${slug}`,
    };

    res.render('details', {
        body: "",
        baseUrl,
        product: productDetails,
        seoDetails,
        S3_BASE_URL,
        API_BASE_URL,
        WEBSITE_ID_KEY,
        websiteID,
        activePage: 'products'
    });
});

app.use(async (req, res, next) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`, // Replace with correct path if needed
        keywords: "",
        canonical: baseUrl + req.originalUrl, // You can use the original URL for canonical
    };
    

    res.status(404).render('404', { seoDetails });
});




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });