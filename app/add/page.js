"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { firestore, storage } from "@/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Sidebar from "@/components/Sidebar";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { Camera } from "react-camera-pro";

const generateImageWithPollinations = async (itemName) => {
  const encodedItemName = encodeURIComponent(itemName);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedItemName}`;
  return imageUrl;
};

export default function AddItem() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemImage, setItemImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const cameraRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      setImageUrl("");
    }
  };

  const removeImage = () => {
    setItemImage(null);
    setImageUrl("");
  };

  const generateImage = async (itemName) => {
    setLoading(true);
    try {
      const generatedImageUrl = await generateImageWithPollinations(itemName);
      setImageUrl(generatedImageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  const uploadImageToFirestore = async (file) => {
    const storageRef = ref(storage, `inventory/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const addItem = async () => {
    if (!itemName || !itemQuantity || (!itemImage && !imageUrl)) {
      alert("Please fill in all fields and upload or generate an image.");
      return;
    }

    let finalImageUrl = imageUrl;

    if (itemImage) {
      finalImageUrl = await uploadImageToFirestore(itemImage);
    }

    const docRef = doc(collection(firestore, "inventory"), itemName);
    await setDoc(docRef, {
      quantity: Number(itemQuantity),
      image: finalImageUrl,
    });
    router.push("/");
  };

  const handleTakePhoto = () => {
    const imageSrc = cameraRef.current.takePhoto();
    const file = dataURLtoFile(imageSrc, "camera_image.png");
    setItemImage(file);
    setImageUrl("");
    setCameraOpen(false);
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div className="flex h-screen">
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
          {loading && <CircularProgress />}
          {itemImage || imageUrl ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Generated Item"
                  style={{ maxHeight: "200px" }}
                  onLoad={handleImageLoad}
                />
              ) : (
                <img
                  src={URL.createObjectURL(itemImage)}
                  alt="Item Preview"
                  style={{ maxHeight: "200px" }}
                  onLoad={handleImageLoad}
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
            <Box display="flex" gap={2}>
              <Button variant="contained" component="label" color="primary">
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CameraAltIcon />}
                onClick={() => setCameraOpen(true)}
              >
                Take Photo
              </Button>
            </Box>
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
            onClick={() => generateImage(itemName)}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              "Generate Image with AI"
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
      <Dialog open={cameraOpen} onClose={() => setCameraOpen(false)}>
        <DialogTitle>Take Photo</DialogTitle>
        <DialogContent className="w-[500px]">
          <Camera ref={cameraRef} aspectRatio={16 / 9} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCameraOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleTakePhoto} color="primary">
            Take Photo
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
