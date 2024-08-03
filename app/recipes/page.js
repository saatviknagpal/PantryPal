"use client";

import { useState, useEffect } from "react";
import { Box, Stack, Typography, Button, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Sidebar from "@/components/Sidebar";
import { firestore } from "@/firebase";
import { collection, getDocs, query } from "firebase/firestore";

export default function Recipes() {
  const [pantryItems, setPantryItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPantryItems = async () => {
      const snapshot = query(collection(firestore, "inventory"));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setPantryItems(inventoryList);
    };

    fetchPantryItems();
  }, []);

  const generateRecipe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: selectedIngredients }),
      });
      const data = await response.json();
      setRecipe(data.recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <Box
        width="75vw"
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"column"}
        alignItems={"center"}
        gap={2}
        padding={4}
      >
        <Typography variant="h4" gutterBottom>
          Generate Recipe
        </Typography>
        <Stack width="100%" spacing={2}>
          <Autocomplete
            multiple
            options={pantryItems}
            getOptionLabel={(option) => option.name}
            filterSelectedOptions
            onChange={(event, value) =>
              setSelectedIngredients(value.map((item) => item.name))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Ingredients"
                placeholder="Ingredients"
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={generateRecipe}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Recipe"}
          </Button>
        </Stack>
        {recipe && (
          <Box mt={4} p={2} border="1px solid #ccc" borderRadius="4px">
            <Typography variant="h6">Generated Recipe</Typography>
            <Typography>{recipe}</Typography>
          </Box>
        )}
      </Box>
    </div>
  );
}
