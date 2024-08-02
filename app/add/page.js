"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { firestore, storage } from "@/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Sidebar from "@/components/Sidebar";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function AddItem() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState();
  const [itemImage, setItemImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
    }
  };

  const removeImage = () => {
    setItemImage(null);
  };

  const generateImageWithGeminiAI = async (name) => {
    setLoading(true);
    const imageUrl = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://via.placeholder.com/150?text=${name}`);
      }, 2000);
    });
    setItemImage(imageUrl);
    setLoading(false);
  };

  const uploadImageToFirestore = async (file) => {
    const storageRef = ref(storage, `inventory/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const addItem = async () => {
    if (!itemName || !itemQuantity || !itemImage) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    let imageUrl = itemImage;

    if (itemImage instanceof File) {
      imageUrl = await uploadImageToFirestore(itemImage);
    }

    const docRef = doc(collection(firestore, "inventory"), itemName);
    await setDoc(docRef, { quantity: Number(itemQuantity), image: imageUrl });
    router.push("/");
  };

  return (
    <div className="flex">
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
          Add New Item
        </Typography>
        <Stack width="100%" spacing={2}>
          {itemImage ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              {typeof itemImage === "string" ? (
                <img
                  src={itemImage}
                  alt="Generated Item"
                  style={{ maxHeight: "200px" }}
                />
              ) : (
                <img
                  src={URL.createObjectURL(itemImage)}
                  alt="Item Preview"
                  style={{ maxHeight: "200px" }}
                />
              )}
              <Button
                variant="contained"
                component="label"
                color="primary"
                startIcon={<AddPhotoAlternateIcon />}
              >
                Change Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              <IconButton color="secondary" onClick={removeImage}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ) : (
            <Button variant="contained" component="label" color="primary">
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
          )}
          <TextField
            id="item-name"
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            required
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={() => generateImageWithGeminiAI(itemName)}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              "Generate Image with Gemini AI"
            )}
          </Button>
          <TextField
            id="item-quantity"
            label="Quantity"
            type="number"
            variant="outlined"
            fullWidth
            value={itemQuantity}
            required
            onChange={(e) => setItemQuantity(Number(e.target.value))}
          />
          <Button variant="contained" color="primary" onClick={addItem}>
            Submit
          </Button>
        </Stack>
      </Box>
    </div>
  );
}
