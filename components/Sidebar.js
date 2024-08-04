"use client";

import { useState } from "react";
import { navLinks } from "@/constants"; // Ensure this import points to your constants file
import {
  SignedIn,
  SignedOut,
  UserButton,
  RedirectToSignIn,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, IconButton, Drawer } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MenuIcon from "@mui/icons-material/Menu";

const Sidebar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div className="flex w-full h-full flex-col gap-4 dark:bg-gray-800">
      <Link href="/" className="sidebar-logo">
        <Image
          src="/assets/logo.webp"
          alt="logo"
          width={120}
          height={80}
          className="m-auto"
        />
      </Link>

      <nav className="sidebar-nav">
        <SignedIn>
          <ul className="sidebar-nav_elements">
            {navLinks.slice(0, 3).map((link, index) => {
              const isActive = link.route === pathname;
              const icons = [
                <HomeIcon key="pantry" />,
                <AddCircleIcon key="add-item" />,
                <RestaurantMenuIcon key="recipes" />,
              ];

              return (
                <li
                  key={link.route}
                  className={`sidebar-nav_element group ${
                    isActive ? "bg-purple-700 text-white" : "text-gray-300"
                  }`}
                >
                  <Link className="sidebar-link" href={link.route}>
                    {icons[index]}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <ul className="sidebar-nav_elements">
            {navLinks.slice(3).map((link) => {
              const isActive = link.route === pathname;

              return (
                <li
                  key={link.route}
                  className={`sidebar-nav_element group ${
                    isActive ? "bg-purple-700 text-white" : "text-gray-300"
                  }`}
                >
                  <Link className="sidebar-link" href={link.route}>
                    <Image
                      src={link.icon}
                      alt="logo"
                      width={24}
                      height={24}
                      className={`${isActive && `brightness-200`}`}
                    />
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="flex-center cursor-pointer gap-2 p-4 text-white">
              <UserButton afterSignOutUrl="/sign-in" showName />
            </li>
          </ul>
        </SignedIn>

        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </nav>
    </div>
  );

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ display: { lg: "none" } }}
        className="pl-5 w-max h-max dark:text-white"
      >
        <MenuIcon />
      </IconButton>
      <aside className="hidden lg:flex sidebar h-screen w-72 bg-gray-800 p-5 shadow-md shadow-purple-200/50">
        {drawer}
      </aside>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: "240px" },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;
