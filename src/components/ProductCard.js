import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

/**
 * ProductCard
 * Props:
 *  - product: { name, category, cost, rating, image, _id }
 *  - handleAddToCart: function (optional)
 */
const ProductCard = ({ product = {}, handleAddToCart = () => {} }) => {
  const { name = "Product", cost = 0, rating = 0, image = "", _id = "" } = product;

  return (
    <Card
      className="card"
      data-testid={`product-card-${_id}`}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Image */}
      <CardMedia
        component="img"
        image={image}
        alt={name}
        className="card-media"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
        }}
        data-testid={`product-image-${_id}`}
        style={{ objectFit: "contain", maxHeight: 180 }}
      />

      {/* Content */}
      <CardContent style={{ flexGrow: 1 }}>
        <Typography
          gutterBottom
          variant="subtitle1"
          component="div"
          data-testid={`product-name-${_id}`}
        >
          {name}
        </Typography>

        <Typography
          variant="body1"
          color="textPrimary"
          data-testid={`product-cost-${_id}`}
          style={{ fontWeight: 700 }}
        >
          ${cost}
        </Typography>

        <div style={{ marginTop: 8 }}>
          <Rating
            name={`rating-${_id}`}
            value={Math.round(rating)}
            precision={1}
            readOnly
            data-testid={`product-rating-${_id}`}
          />
        </div>
      </CardContent>

      {/* Actions */}
      <CardActions style={{ padding: "12px" }}>
        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<AddShoppingCartOutlined />}
          onClick={() => handleAddToCart(product)}
          data-testid={`add-to-cart-${_id}`}
          style={{ backgroundColor: "#2ea44f", fontWeight: 600 }}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
