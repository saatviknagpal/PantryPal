"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  IconButton,
  InputBase,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CardHeader,
} from "@mui/material";
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { firestore, storage } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import Sidebar from "@/components/Sidebar";
import SearchIcon from "@mui/icons-material/Search";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item, itemQuantity) => {
    const quantityToAdd = Number(itemQuantity);
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(
        docRef,
        { quantity: quantity + quantityToAdd },
        { merge: true }
      );
    } else {
      await setDoc(docRef, { quantity: quantityToAdd });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, image } = docSnap.data();
      if (quantity === 1) {
        if (image) {
          const imageRef = ref(storage, image);
          try {
            await deleteObject(imageRef);
            console.log(`Image deleted: ${image}`);
          } catch (error) {
            console.error(`Error deleting image: ${error}`);
          }
        }
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }
    await updateInventory();
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { image } = docSnap.data();
      if (image) {
        const imageRef = ref(storage, image);
        try {
          await deleteObject(imageRef);
          console.log(`Image deleted: ${image}`);
        } catch (error) {
          console.error(`Error deleting image: ${error}`);
        }
      }
      await deleteDoc(docRef);
    }
    await updateInventory();
  };

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col gap-10">
        <div className="p-10 h-2 font-bold text-3xl flex justify-between w-full">
          <p>Pantry</p>
          <Paper
            component="form"
            sx={{
              p: "20px 20px",
              display: "flex",
              alignItems: "center",
              width: 400,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Items"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputProps={{ "aria-label": "search inventory items" }}
            />
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
        </div>
        <Box
          width="75vw"
          display="flex"
          flexWrap="wrap"
          justifyContent="center"
          gap={10}
        >
          {filteredInventory.map(({ name, quantity, image }) => (
            <Card key={name} className="w-[300px]">
              {image && (
                <CardMedia
                  component="img"
                  width={500}
                  height="200"
                  image={image}
                  alt={name}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {quantity}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => addItem(name, 1)}>
                  <AddIcon />
                </IconButton>
                <IconButton size="small" onClick={() => removeItem(name)}>
                  {quantity === 1 ? <DeleteIcon /> : <RemoveIcon />}
                </IconButton>
                <IconButton
                  className="float-end"
                  size="small"
                  onClick={() => deleteItem(name)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      </div>
    </div>
  );
}
