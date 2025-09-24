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
 *
 * cartData: [{ productId: string, qty: number }, ...]
 * productsData: [{ _id: string, name, category, cost, rating, image }, ...]
 *
 * returns: [{ ...productData, productId, qty }, ...]
 */
export const generateCartItemsFrom = (cartData = [], productsData = []) => {
  return (cartData || [])
    .map((entry) => {
      const product = (productsData || []).find((p) => p._id === entry.productId);
      if (!product) return null;
      return {
        ...product,
        productId: entry.productId,
        qty: entry.qty,
      };
    })
    .filter(Boolean);
};

/**
 * Get the total value of all products added to the cart
 *
 * items: [{ cost: number, qty: number, ... }, ...]
 */
export const getTotalCartValue = (items = []) => {
  return (items || []).reduce((total, item) => total + (item.cost || 0) * (item.qty || 0), 0);
};

/**
 * Get total number of items (sum of qty) in cart
 *
 * items: [{ qty: number }, ...]
 */
export const getTotalItems = (items = []) => {
  return (items || []).reduce((sum, it) => sum + (it.qty || 0), 0);
};

/**
 * ItemQuantity component
 *
 * - When isReadOnly is true: renders plain text "Qty: X" (no +/- buttons)
 * - Otherwise renders interactive +/- icons that call handleAdd/handleDelete
 *
 * Keep data-testid attributes so tests can find the icons / qty element.
 */
const ItemQuantity = ({ value, handleAdd, handleDelete, isReadOnly = false }) => {
  if (isReadOnly) {
    // Readonly display (used on Checkout page)
    return (
      <Box padding="0.5rem" data-testid="item-qty">
        Qty: {value}
      </Box>
    );
  }

  // Interactive quantity control (used on Products page/cart widget)
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete} data-testid="decrease-qty">
        <RemoveOutlined data-testid="RemoveOutlinedIcon" />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd} data-testid="increase-qty">
        <AddOutlined data-testid="AddOutlinedIcon" />
      </IconButton>
    </Stack>
  );
};

/**
 * Cart component
 *
 * Props:
 *  - products (not required here, but kept for parity)
 *  - items: array of cart items (each item should include productId, name, image, cost, qty)
 *  - handleQuantity: function(productId, newQty) => updates cart; required for interactive mode
 *  - isReadOnly (boolean) - if true, render read-only view (Checkout page) and hide Checkout button
 */
const Cart = ({ products = [], items = [], handleQuantity, isReadOnly = false, readOnly = false }) => {
  // Accept both isReadOnly and readOnly prop names (some stubs may use readOnly)
  const readonlyMode = isReadOnly || readOnly;
  const history = useHistory();

  // Empty cart view
  if (!items || items.length === 0) {
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
      {/* Each cart item */}
      {items.map((item) => (
        <Box key={item.productId} display="flex" alignItems="flex-start" padding="1rem">
          <Box className="image-container" sx={{ minWidth: 100, width: 100, height: 100 }}>
            <img
              src={item.image}
              alt={item.name}
              width="100%"
              height="100%"
              style={{ objectFit: "contain" }}
              data-testid={`product-image-${item.productId}`}
            />
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="6rem"
            paddingX="1rem"
            flex="1"
          >
            <div style={{ fontSize: "0.95rem" }} data-testid={`product-name-${item.productId}`}>
              {item.name}
            </div>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <ItemQuantity
                value={item.qty}
                isReadOnly={readonlyMode}
                handleAdd={() => {
                  if (handleQuantity && !readonlyMode) handleQuantity(item.productId, item.qty + 1);
                }}
                handleDelete={() => {
                  if (handleQuantity && !readonlyMode) handleQuantity(item.productId, item.qty - 1);
                }}
              />

              <Box padding="0.5rem" fontWeight="700" data-testid={`product-cost-${item.productId}`}>
                ${item.cost}
              </Box>
            </Box>
          </Box>
        </Box>
      ))}

      {/* Order total */}
      <Box padding="1rem" display="flex" justifyContent="space-between" alignItems="center">
        <Box color="#3C3C3C" alignSelf="center">
          Order total
        </Box>
        <Box
          color="#3C3C3C"
          fontWeight="700"
          fontSize="1.5rem"
          alignSelf="center"
          data-testid="cart-total"
        >
          ${getTotalCartValue(items)}
        </Box>
      </Box>

      {/* Order Details - Only on Checkout page (readonly mode) */}
      {readonlyMode && (
        <Box className="order-details" padding="1rem" data-testid="order-details">
          <h3>Order Details</h3>
          <Box display="flex" justifyContent="space-between" paddingY="0.5rem">
            <span>Total Items:</span>
            <span>{getTotalItems(items)}</span>
          </Box>
          <Box display="flex" justifyContent="space-between" paddingY="0.5rem">
            <span>Subtotal:</span>
            <span>${getTotalCartValue(items)}</span>
          </Box>
          <Box display="flex" justifyContent="space-between" paddingY="0.5rem">
            <span>Shipping Charges:</span>
            <span>$0</span>
          </Box>
          <Box display="flex" justifyContent="space-between" paddingY="0.5rem" fontWeight="700">
            <span>Grand Total:</span>
            <span>${getTotalCartValue(items)}</span>
          </Box>
        </Box>
      )}

      {/* Checkout button: show only for interactive cart (not on read-only Checkout page) */}
      {!readonlyMode && (
        <Box display="flex" justifyContent="flex-end" className="cart-footer" padding="0 1rem 1rem 1rem">
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
      )}
    </Box>
  );
};

export default Cart;
