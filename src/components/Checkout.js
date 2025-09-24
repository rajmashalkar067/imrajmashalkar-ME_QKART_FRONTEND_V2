import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Box as MuiBox,
  Box,
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

/**
 * @typedef {Object} Product - Data on product available to buy
 * @property {string} name
 * @property {string} category
 * @property {number} cost
 * @property {number} rating
 * @property {string} image
 * @property {string} _id
 */

/**
 * @typedef {Object} CartItem
 * @property {string} name
 * @property {string} qty
 * @property {string} category
 * @property {number} cost
 * @property {number} rating
 * @property {string} image
 * @property {string} productId
 */

/**
 * @typedef {Object} Address
 * @property {string} _id
 * @property {string} address
 */

/**
 * @typedef {Object} Addresses
 * @property {Array.<Address>} all
 * @property {string} selected
 */

/**
 * @typedef {Object} NewAddress
 * @property { Boolean } isAddingNewAddress
 * @property { String} value
 */

/**
 * Add new address UI
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column" my="1rem">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e) =>
          handleNewAddress({
            ...newAddress,
            value: e.target.value,
          })
        }
        data-testid="add-new-address"
      />
      <Stack direction="row" my="1rem" spacing={2}>
        <Button
          variant="contained"
          onClick={() => addAddress(token, newAddress)}
          disabled={!newAddress.value.trim()}
          data-testid="add-address-button"
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() =>
            handleNewAddress({
              isAddingNewAddress: false,
              value: "",
            })
          }
          data-testid="cancel-address-button"
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
        return null;
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (tokenParam) => {
    if (!tokenParam) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${tokenParam}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   *
   * API Endpoint - "GET /user/addresses"
   */
  const getAddresses = async (tokenParam) => {
    if (!tokenParam) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${tokenParam}`,
        },
      });

      setAddresses((prev) => ({ ...prev, all: response.data }));
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Handler function to add a new address and display the latest list of addresses
   *
   * Implemented:
   * - POST /user/addresses with { address: <value> }
   * - On success setAddresses using response.data (updated addresses array)
   * - Reset newAddress to hide the Add view
   */
  const addAddress = async (tokenParam, newAddressObj) => {
    if (!tokenParam) {
      enqueueSnackbar("You must be logged in to add an address", {
        variant: "warning",
      });
      return null;
    }
    if (!newAddressObj || !newAddressObj.value || !newAddressObj.value.trim()) {
      enqueueSnackbar("Please enter a valid address", { variant: "warning" });
      return null;
    }

    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddressObj.value },
        {
          headers: {
            Authorization: `Bearer ${tokenParam}`,
          },
        }
      );

      // response.data expected to be updated addresses array
      setAddresses((prev) => ({ ...prev, all: response.data }));
      // reset newAddress state and hide add view
      setNewAddress({ isAddingNewAddress: false, value: "" });
      enqueueSnackbar("Address added successfully", { variant: "success" });
      return response.data;
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  /**
   * Handler function to delete an address from the backend and display the latest list of addresses
   *
   * Implemented:
   * - DELETE /user/addresses/:addressId
   * - On success setAddresses using response.data (updated addresses array)
   */
  const deleteAddress = async (tokenParam, addressId) => {
    if (!tokenParam) {
      enqueueSnackbar("You must be logged in to delete an address", {
        variant: "warning",
      });
      return null;
    }

    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressId}`,
        {
          headers: {
            Authorization: `Bearer ${tokenParam}`,
          },
        }
      );

      // response.data expected to be updated addresses array
      setAddresses((prev) => {
        const newAll = response.data || [];
        // if the deleted address was selected, clear selection
        const selected = prev.selected === addressId ? "" : prev.selected;
        return { all: newAll, selected };
      });
      enqueueSnackbar("Address deleted successfully", { variant: "success" });
      return response.data;
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  /**
   * Return if the request validation passed. If it fails, display appropriate warning message.
   */
  const validateRequest = (itemsParam, addressesParam) => {
    // 1. Not enough balance
    const total = getTotalCartValue(itemsParam || []);
    const wallet = parseInt(localStorage.getItem("balance") || "0", 10);
    if (total > wallet) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        { variant: "warning" }
      );
      return false;
    }

    // 2. No addresses added
    if (!addressesParam || !addressesParam.all || addressesParam.all.length === 0) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }

    // 3. No address selected
    if (!addressesParam.selected) {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  /**
   * Handler function to perform checkout operation for items added to the cart for the selected address
   *
   * On success:
   *  - update localStorage balance to reflect spent amount
   *  - show success snackbar with exact text "Order placed successfully"
   *  - redirect to /thanks
   */
  const performCheckout = async (tokenParam, itemsParam, addressesParam) => {
    if (!tokenParam) {
      enqueueSnackbar("You must be logged in to place an order", { variant: "warning" });
      return false;
    }

    if (!validateRequest(itemsParam, addressesParam)) return false;

    try {
      const response = await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: addressesParam.selected },
        {
          headers: {
            Authorization: `Bearer ${tokenParam}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // Update user's balance in localStorage (subtract total)
        const total = getTotalCartValue(itemsParam || []);
        const currentBalance = parseInt(localStorage.getItem("balance") || "0", 10);
        const newBalance = currentBalance - total;
        localStorage.setItem("balance", String(newBalance));

        // Show success message (exact text required by tests)
        enqueueSnackbar("Order placed successfully", { variant: "success" });

        // Redirect to thanks page
        history.push("/thanks");
        return true;
      } else {
        const msg = response.data?.message || "Could not place order. Please try again.";
        enqueueSnackbar(msg, { variant: "error" });
        return false;
      }
    } catch (e) {
      const msg =
        e.response?.data?.message || "Could not place order. Please try again.";
      enqueueSnackbar(msg, { variant: "error" });
      return false;
    }
  };

  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }

      // fetch addresses if logged in
      if (token) {
        await getAddresses(token);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh" p={2}>
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box my="1rem">
              {addresses.all && addresses.all.length > 0 ? (
                addresses.all.map((addr) => {
                  const selected = addresses.selected === addr._id;
                  return (
                    <Box
                      key={addr._id}
                      className={`address-item ${selected ? "selected" : "not-selected"}`}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      my={1}
                      p={2}
                    >
                      <Box
                        onClick={() =>
                          setAddresses((prev) => ({ ...prev, selected: addr._id }))
                        }
                        sx={{ cursor: "pointer", flex: 1 }}
                        data-testid={`address-${addr._id}`}
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {addr.address}
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant={selected ? "contained" : "outlined"}
                          onClick={() =>
                            setAddresses((prev) => ({ ...prev, selected: addr._id }))
                          }
                          data-testid={`select-address-${addr._id}`}
                        >
                          {selected ? "Selected" : "Select"}
                        </Button>
                        <Button
                          startIcon={<Delete />}
                          color="error"
                          variant="text"
                          onClick={() => deleteAddress(token, addr._id)}
                          data-testid={`delete-address-${addr._id}`}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  );
                })
              ) : (
                <Typography my="1rem" data-testid="no-address">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              )}
            </Box>

            {/* Add new address UI */}
            {!newAddress.isAddingNewAddress ? (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
                data-testid="add-new-btn"
              >
                Add new address
              </Button>
            ) : (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            )}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={() => performCheckout(token, items, addresses)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly products={products} items={items} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
