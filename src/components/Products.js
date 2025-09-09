import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
<<<<<<< ours
import React, { useEffect, useState, useRef } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
=======
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
>>>>>>> theirs
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
<<<<<<< ours
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  // products data and UI state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // initial load
  const [searching, setSearching] = useState(false); // for search spinner
  const [searchText, setSearchText] = useState("");

  // ref to keep debounce timer across renders
  const debounceRef = useRef(null);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
=======
 * @property {string} productId - Unique ID for the product
 */

const Products = () => {

>>>>>>> theirs
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
<<<<<<< ours
    try {
      setLoading(true);
      const url = `${config.endpoint}/products`;
      const res = await axios.get(url);
      // backend returns array of products on success
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        // keep empty if shape is unexpected
        setProducts([]);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Check the backend.";
      enqueueSnackbar(message, { variant: "error" });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
=======
  };

>>>>>>> theirs
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
<<<<<<< ours
   const performSearch = async (text) => {
    // if empty search text - load all products
    if (!text) {
      setSearching(true);
      try {
        await performAPICall();
      } finally {
        setSearching(false);
      }
      return;
    }

    try {
      setSearching(true);
      // Build the full URL so tests that look for exact request URLs succeed
      const url = `${config.endpoint}/products/search?value=${encodeURIComponent(text)}`;
      const res = await axios.get(url);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Check the backend.";
      enqueueSnackbar(message, { variant: "error" });
      setProducts([]);
    } finally {
      setSearching(false);
    }
  };


  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
=======
  const performSearch = async (text) => {
  };

>>>>>>> theirs
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
<<<<<<< ours
   const debounceSearch = (event, debounceTimeoutParam) => {
    // update the visible input value immediately
    const value = event.target.value;
    setSearchText(value);

    // If caller passed a debounce timeout id (tests do this), clear it
    if (debounceTimeoutParam) {
      clearTimeout(debounceTimeoutParam);
    }

    // Also clear our internal ref timer if present
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // set a new timer; on expiry, run search
    const timeoutId = setTimeout(() => {
      performSearch(value.trim());
      debounceRef.current = null;
    }, 500); // 500ms debounce delay

    // store local ref and RETURN the timeout id (tests expect this)
    debounceRef.current = timeoutId;
    return timeoutId;
  };


  // load products on mount
  useEffect(() => {
    performAPICall();
    // clear debounce on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
=======
  const debounceSearch = (event, debounceTimeout) => {
  };


  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
  };

>>>>>>> theirs

  return (
    <div>
      <Header>

      </Header>

<<<<<<< ours
       <Grid container>
         <Grid item className="product-grid">
           <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
           </Box>
         </Grid>
       </Grid>

      {/* Search input */}
      <Box style={{ maxWidth: 1200, margin: "1rem auto", padding: "0 1rem" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search for items/categories"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="primary" />
              </InputAdornment>
            ),
            endAdornment: searching ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
            "data-testid": "search-input"
          }}
          value={searchText}
          onChange={debounceSearch}
        />
      </Box>

      <Box style={{ maxWidth: 1200, margin: "1rem auto", padding: "0 1rem" }}>
        {loading ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" style={{ minHeight: 200 }}>
            <CircularProgress />
              <Typography style={{ marginTop: 12 }} variant="body1">
                Loading Products
              </Typography>
            </Box>
        ) : (
          <>
            {!loading && products.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                style={{ padding: "3rem 1rem" }}
                data-testid="no-products"
              >
                <SentimentDissatisfied style={{ fontSize: 48, color: "#6b7280" }} />
                <Typography variant="h6" style={{ marginTop: 12, color: "#374151" }}>
                  No products found
                </Typography>
                <Typography variant="body2" style={{ color: "#6b7280", marginTop: 6 }}>
                  Try a different search term or check back later.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2} data-testid="products-grid" style={{ padding: "0 8px" }}>
                {products.map((p) => {
                  const productObj = {
                    name: p.name,
                    category: p.category,
                    cost: p.cost,
                    rating: p.rating,
                    image: p.image,
                    _id: p._id,
                  };
                  return (
                    <Grid item xs={6} sm={6} md={3} key={p._id} data-testid={`product-grid-item-${p._id}`}>
                      <ProductCard product={productObj} />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}
      </Box>

=======
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
        {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
>>>>>>> theirs
      <Footer />
    </div>
  );
};

export default Products;
