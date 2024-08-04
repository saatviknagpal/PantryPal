"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
} from "@mui/material";
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
      setRecipe(formatRecipe(data.recipe));
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRecipe = (recipeText) => {
    const formattedText = recipeText.split("\n").map((line, index) => {
      if (line.trim().startsWith("*") && line.trim().endsWith("*")) {
        const content = line.trim().slice(1, -1); // Remove the enclosing stars
        return (
          <Typography key={index} component="div" variant="body1" gutterBottom>
            <strong>{content}</strong>
          </Typography>
        );
      }
      return (
        <Typography key={index} component="div" variant="body1" gutterBottom>
          {line}
        </Typography>
      );
    });
    return formattedText;
  };

  return (
    <div className="flex w-full">
      <Box
        width={{ xs: "100vw", lg: "calc(100vw - 300px)" }}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        gap={4}
        padding={8}
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
            {loading ? <CircularProgress size={24} /> : "Generate Recipe"}
          </Button>
        </Stack>
        {recipe && (
          <Card mt={4} p={2} border="1px solid #ccc" borderRadius="4px">
            <CardHeader title="Generated Recipe" />
            <CardContent>{recipe}</CardContent>
          </Card>
        )}
      </Box>
    </div>
  );
}
