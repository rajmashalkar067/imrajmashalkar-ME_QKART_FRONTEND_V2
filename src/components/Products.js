import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Box as MuiBox,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState, useRef } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import "./Products.css";
import Cart, { generateCartItemsFrom } from "./Cart";

// ---------- Products Component ----------
const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  // products and cart state
  const [products, setProducts] = useState([]);
  const [cartData, setCartData] = useState([]); // raw cart from API
  const [items, setItems] = useState([]); // enriched cart with product info

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState("");

  const debounceRef = useRef(null);

  // ------------ API: Fetch Products ------------
  const performAPICall = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.endpoint}/products`);
      setProducts(Array.isArray(res.data) ? res.data : res.data?.products || []);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not fetch products";
      enqueueSnackbar(msg, { variant: "error" });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------ API: Fetch Cart (only if logged in) ------------
  const fetchCart = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await axios.get(`${config.endpoint}/cart`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCartData(res.data || []);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Could not fetch cart";
      enqueueSnackbar(msg, { variant: "error" });
      setCartData([]);
    }
  };

  // ------------ API: Update Cart Qty ------------
  const handleQuantity = async (productId, qty) => {
    if (qty < 0) return;

    // ✅ Check for duplicate "Add to Cart" (when qty=1 and item already exists)
    const existingItem = cartData.find((item) => item.productId === productId);
    if (existingItem && existingItem.qty > 0 && qty === 1) {
      enqueueSnackbar("Item already in cart", {
        variant: "warning",
        anchorOrigin: { vertical: "top", horizontal: "center" },
      });
      return;
    }

    try {
      const res = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setCartData(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Could not update cart. Please try again";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  // ------------ Search ------------
  const performSearch = async (text) => {
    if (!text) {
      await performAPICall();
      return;
    }
    try {
      setSearching(true);
      const res = await axios.get(
        `${config.endpoint}/products/search?value=${encodeURIComponent(text)}`
      );
      setProducts(Array.isArray(res.data) ? res.data : res.data?.products || []);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Search failed. Please try again.";
      enqueueSnackbar(msg, { variant: "error" });
      setProducts([]);
    } finally {
      setSearching(false);
    }
  };

  const debounceSearch = (event, debounceTimeoutParam) => {
    const value = event.target.value;
    setSearchText(value);

    if (debounceTimeoutParam) clearTimeout(debounceTimeoutParam);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const timeoutId = setTimeout(() => {
      performSearch(value.trim());
      debounceRef.current = null;
    }, 500);
    debounceRef.current = timeoutId;
    return timeoutId;
  };

  // ------------ Effects ------------
  useEffect(() => {
    performAPICall();
    if (localStorage.getItem("token")) fetchCart();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // derive enriched items whenever cartData or products changes
  useEffect(() => {
    if (products.length && cartData.length) {
      setItems(generateCartItemsFrom(cartData, products));
    } else {
      setItems([]);
    }
  }, [products, cartData]);

  // ------------ Render ------------
  return (
    <div>
      <Header />
      {/* Desktop search */}
      <Box className="search-wrapper-desktop" sx={{ display: { xs: "none", md: "block" } }}>
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
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
              "data-testid": "search-input",
            }}
            value={searchText}
            onChange={debounceSearch}
            className="products-search-field"
          />
        </Box>
      </Box>

      {/* Hero */}
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

      {/* Mobile search */}
      <Box sx={{ display: { xs: "block", md: "none" }, maxWidth: 1200, mx: "auto", mt: 2, px: 2 }}>
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
            "data-testid": "search-input",
          }}
          value={searchText}
          onChange={debounceSearch}
          className="products-search-field"
        />
      </Box>

      {/* Products + Cart */}
      <Box className="products-page-wrapper">
        {loading ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            style={{ minHeight: 200 }}
          >
            <CircularProgress />
            <Typography style={{ marginTop: 12 }} variant="body1">
              Loading Products
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={localStorage.getItem("token") ? 9 : 12}>
              {products.length === 0 ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  style={{ padding: "3rem 1rem" }}
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
                <Grid container spacing={2}>
                  {products.map((p) => (
                    <Grid item xs={6} sm={6} md={3} key={p._id}>
                      <Box sx={{ width: "100%" }}>
                        <ProductCard product={p} handleAddToCart={() => handleQuantity(p._id, 1)} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Cart */}
            {localStorage.getItem("token") ? (
              <Grid item xs={12} md={3}>
                <Box
                  style={{
                    backgroundColor: "#E9F5E1",
                    minHeight: 200,
                    borderRadius: 4,
                    padding: 12,
                  }}
                >
                  <Cart products={products} items={items} handleQuantity={handleQuantity} />
                </Box>
              </Grid>
            ) : null}
          </Grid>
        )}
      </Box>

      <Footer />
    </div>
  );
};

export default Products;
