import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../../utils/api_products";
import { useSnackbar } from "notistack";
import { addToCart } from "../../utils/api_cart";
import { useCookies } from "react-cookie";
import { Inventory2 } from "@mui/icons-material";

export default function GridList(props) {
  const [cookies, setCookie] = useCookies(["currentUser"]);
  const { currentUser = {} } = cookies;
  const { role, token } = currentUser;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const {
    cards = [],
    categories = [],
    category = "all",
    setCategory,
    // sort,
    // setSort,
    // page,
    setPage,
  } = props;

  const addToCartMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      // display success message
      enqueueSnackbar("Product has been added to cart successfully.", {
        variant: "success",
      });
      // reset the cart data
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
    onError: (error) => {
      // display error message
      enqueueSnackbar(error.response.data.message, {
        variant: "error",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // display success message
      enqueueSnackbar("Product is deleted", {
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      // display error message
      enqueueSnackbar(error.response.data.message, {
        variant: "error",
      });
    },
  });

  return (
    <>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Box sx={{ margin: "8px" }}>
          <Typography variant="h5" sx={{ marginBottom: "15px" }}>
            Products
          </Typography>
          <FormControl style={{ width: "300px" }}>
            <InputLabel id="product-label">All Products</InputLabel>
            <Select
              labelId="product-label"
              id="product-select"
              label="Name"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => {
                return (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        {role && role === "admin" ? (
          <Box sx={{ margin: "8px" }}>
            <Button
              variant="contained"
              size="large"
              color="success"
              onClick={() => {
                navigate("/add");
              }}
            >
              Add New
            </Button>
          </Box>
        ) : null}
      </Box>
      <Container>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {cards.map((card) => (
            <Grid item xs={4} key={card._id}>
              <Card>
                <CardContent>
                  <img
                    src={
                      "http://localhost:5000/" +
                      (card.image && card.image !== ""
                        ? card.image
                        : "uploads/default_image.png")
                    }
                    alt="something"
                    width="100%"
                  />
                  <Typography
                    variant="h6"
                    sx={{ marginTop: "8px", marginBottom: "8px" }}
                  >
                    {card.name}
                  </Typography>
                  <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    sx={{ marginTop: "8px", marginBottom: "8px" }}
                  >
                    <Chip
                      avatar={<Avatar>$</Avatar>}
                      label={card.price}
                      color="success"
                    />
                    <Chip
                      icon={<Inventory2 />}
                      label={
                        card.category && card.category.name
                          ? card.category.name
                          : ""
                      }
                      color="warning"
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ marginTop: "8px", marginBottom: "8px" }}
                    onClick={() => {
                      // 0, false, undefined, null
                      if (currentUser && currentUser.email) {
                        addToCartMutation.mutate(card);
                      } else {
                        enqueueSnackbar("Please Login First");
                      }
                    }}
                  >
                    Add To Cart
                  </Button>
                  {role && role === "admin" ? (
                    <Box
                      display={"flex"}
                      justifyContent={"space-between"}
                      sx={{ marginTop: "8px", marginBottom: "8px" }}
                    >
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={{ width: "100px" }}
                        onClick={() => {
                          navigate("/products/" + card._id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ width: "100px" }}
                        onClick={() => {
                          const confirm = window.confirm(
                            "Are you sure you want to delete this product?"
                          );
                          if (confirm) {
                            deleteProductMutation.mutate({
                              _id: card._id,
                              token: token,
                            });
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {cards.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" sx={{ padding: "10px 0" }}>
                No items found.
              </Typography>
            </Grid>
          ) : null}
        </Grid>
      </Container>
    </>
  );
}
