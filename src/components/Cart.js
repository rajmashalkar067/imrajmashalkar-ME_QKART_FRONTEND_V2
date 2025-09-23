import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

/**
 * Returns the complete data on all products in cartData by searching in productsData
 */
export const generateCartItemsFrom = (cartData = [], productsData = []) => {
  return cartData.map((entry) => {
    const product = productsData.find((p) => p._id === entry.productId);
    if (!product) return null;
    return {
      ...product,
      productId: entry.productId,
      qty: entry.qty,
    };
  }).filter(Boolean);
};

/**
 * Get the total value of all products added to the cart
 */
export const getTotalCartValue = (items = []) => {
  return items.reduce((total, item) => total + item.cost * item.qty, 0);
};

/**
 * Quantity control
 */
const ItemQuantity = ({ value, handleAdd, handleDelete }) => (
  <Stack direction="row" alignItems="center">
    <IconButton size="small" color="primary" onClick={handleDelete}>
      <RemoveOutlined data-testid="RemoveOutlinedIcon" />
    </IconButton>
    <Box padding="0.5rem" data-testid="item-qty">
      {value}
    </Box>
    <IconButton size="small" color="primary" onClick={handleAdd}>
      <AddOutlined data-testid="AddOutlinedIcon" />
    </IconButton>
  </Stack>
);

/**
 * Cart component
 */
const Cart = ({ products = [], items = [], handleQuantity }) => {
  const history = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <Box className="cart">
      {items.map((item) => (
        <Box
          key={item.productId}
          display="flex"
          alignItems="flex-start"
          padding="1rem"
        >
          <Box className="image-container">
            <img
              src={item.image}
              alt={item.name}
              width="100%"
              height="100%"
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="6rem"
            paddingX="1rem"
            flex={1}
          >
            <div>{item.name}</div>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <ItemQuantity
                value={item.qty}
                handleAdd={() => handleQuantity(item.productId, item.qty + 1)}
                handleDelete={() => handleQuantity(item.productId, item.qty - 1)}
              />
              <Box padding="0.5rem" fontWeight="700">
                ${item.cost}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}

      {/* Order total */}
      <Box
        padding="1rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box color="#3C3C3C">Order total</Box>
        <Box
          color="#3C3C3C"
          fontWeight="700"
          fontSize="1.5rem"
          data-testid="cart-total"
        >
          ${getTotalCartValue(items)}
        </Box>
      </Box>

      {/* Checkout button */}
      <Box display="flex" justifyContent="flex-end" className="cart-footer" padding="1rem">
        <Button
          color="primary"
          variant="contained"
          startIcon={<ShoppingCart />}
          className="checkout-btn"
          onClick={() => history.push("/checkout")}
        >
          Checkout
        </Button>
      </Box>
    </Box>
  );
};

export default Cart;
