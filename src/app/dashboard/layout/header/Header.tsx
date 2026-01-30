"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,
  Button,
  Typography,
  Grid,
  Link,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  ListItemIcon,
} from "@mui/material";
import PropTypes from "prop-types";
import Image from "next/image";
import { usePathname } from "next/navigation";
// components
import Profile from "./Profile";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const DropdownMenu = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  right: 0,
  backgroundColor: theme.palette.background.paper,
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  minWidth: "200px",
  marginTop: "8px",
  opacity: 0,
  transform: "translateY(-10px)",
  visibility: "hidden",
  transition: "all 0.2s ease-in-out",
  "&.open": {
    opacity: 1,
    transform: "translateY(0)",
    visibility: "visible",
  },
  "& .MuiListItem-root": {
    padding: "8px 12px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(11, 18, 213, 0.04)",
    },
  },
  "& .MuiListItemIcon-root": {
    minWidth: "32px",
  },
}));

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [companyLogo, setCompanyLogo] = useState("/images/logos/logo.svg");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    try {
      const userProfileStr = localStorage.getItem("userProfile");
      if (userProfileStr) {
        const userProfile = JSON.parse(userProfileStr);
        if (userProfile.companyInfo?.company_logo) {
          setCompanyLogo(userProfile.companyInfo.company_logo);
        }
        const personalInfo = userProfile.personalInfo;
        if (personalInfo?.first_name && personalInfo?.last_name) {
          setUserName(`${personalInfo.first_name} ${personalInfo.last_name.charAt(0)}.`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClose = () => {
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    // Add your logout logic here
    if (typeof window !== "undefined") {
      localStorage.removeItem("elevate_hr");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("jwt");
      localStorage.removeItem("calendly_access_token");
      localStorage.removeItem("calendly_refresh_token");
      localStorage.removeItem("calendly_state");
    }
    router.push("/");
    handleClose();
  };

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));

  const ToolbarStyled = styled(Stack)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
    display: "flex",
    justifyContent: "space-between",
    padding: "0 20px",
    maxWidth: "1440px",
    margin: "auto",
  }));

  const ProfileButtonStyled = styled(Button)(({ theme }) => ({
    width: "100%",
    backgroundColor: "rgba(11, 18, 213, 0.12)",
    color: theme.palette.grey[600],
    borderRadius: "50px",
    border: `1px solid rgba(11, 18, 213, 0.40)`,
    display: "flex",
    gap: "10px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "rgba(11, 18, 213, 0.18)",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(11, 18, 213, 0.1)",
    },
  }));

  const LinkStyled = styled(Link)(({ theme }) => ({
    color: "rgba(17, 17, 17, 0.42)",
    fontWeight: theme.typography.fontWeightMedium,
    textDecoration: "none",
    transition: "color 0.2s ease-in-out",
    "&:hover": {
      color: `rgba(11, 18, 213, 0.5)`,
    },
    "&.active": {
      color: theme.palette.primary.main,
    },
  }));

  const BottomNav = styled(Paper)(({ theme }) => ({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar,
    display: "block",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
    "& .MuiBottomNavigation-root": {
      backgroundColor: theme.palette.background.paper,
    },
    "& .MuiBottomNavigationAction-root": {
      color: "rgba(17, 17, 17, 0.42)",
      "& .MuiBottomNavigationAction-label": {
        fontSize: "0.75rem",
        opacity: 0.7,
      },
      "&.Mui-selected": {
        color: theme.palette.primary.main,
        "& .MuiBottomNavigationAction-label": {
          opacity: 1,
        },
      },
    },
  }));

  const links = [
    { href: "/dashboard", title: "Dashboard", icon: <DashboardRoundedIcon /> },
    { href: "/dashboard/assessments", title: "Assessments", icon: <DescriptionRoundedIcon /> },
    { href: "/dashboard/applications", title: "Applications", icon: <DescriptionRoundedIcon /> },
    { href: "/dashboard/job-listings", title: "Job Listings", icon: <WorkHistoryRoundedIcon /> },
  ];

  return (
    <>
      <AppBarStyled position="sticky" color="default">
        <ToolbarStyled direction="row" alignItems="center" justifyContent="space-between">
          <Box
            sx={{ cursor: "pointer", display: "flex", alignItems: "center", width: "max-content", height: "56px" }}
            onClick={() => router.push("/dashboard")}
          >
            <Image
              src={companyLogo}
              alt="elevatehr"
              width={120}
              height={56}
              style={{ cursor: "pointer", width: "auto", height: "60px" }}
            />
          </Box>

          <Stack direction="row" width="max-content" gap={4} sx={{ display: { xs: "none", sm: "flex" } }}>
            {links.map((link) => (
              <LinkStyled key={link.title} href={link.href} className={pathname === link.href ? "active" : ""}>
                {link.title}
              </LinkStyled>
            ))}
          </Stack>

          <Stack spacing={1} direction="row" alignItems="center">
            <Box sx={{ display: { xs: "none", sm: "block" }, position: "relative" }}>
              <ProfileButtonStyled onClick={handleClick}>
                <Avatar
                  src="/images/profile/user-1.jpg"
                  alt="image"
                  sx={{
                    width: 28,
                    height: 28,
                  }}
                />
                <Typography>{userName}</Typography>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 16.8C11.3 16.8 10.6 16.53 10.07 16L3.55002 9.48C3.26002 9.19 3.26002 8.71 3.55002 8.42C3.84002 8.13 4.32002 8.13 4.61002 8.42L11.13 14.94C11.61 15.42 12.39 15.42 12.87 14.94L19.39 8.42C19.68 8.13 20.16 8.13 20.45 8.42C20.74 8.71 20.74 9.19 20.45 9.48L13.93 16C13.4 16.53 12.7 16.8 12 16.8Z"
                    fill="rgba(17, 17, 17, 0.68)"
                  />
                </svg>
              </ProfileButtonStyled>
              <DropdownMenu className={isDropdownOpen ? "open" : ""}>
                <ListItem
                  onClick={() => {
                    router.push("/dashboard/profile");
                    handleClose();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: "32px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 12.75C8.83 12.75 6.25 10.17 6.25 7C6.25 3.83 8.83 1.25 12 1.25C15.17 1.25 17.75 3.83 17.75 7C17.75 10.17 15.17 12.75 12 12.75ZM12 2.75C9.66 2.75 7.75 4.66 7.75 7C7.75 9.34 9.66 11.25 12 11.25C14.34 11.25 16.25 9.34 16.25 7C16.25 4.66 14.34 2.75 12 2.75Z"
                        fill="#292D32"
                      />
                      <path
                        d="M20.5901 22.75C20.1801 22.75 19.8401 22.41 19.8401 22C19.8401 18.55 16.3202 15.75 12.0002 15.75C7.68015 15.75 4.16016 18.55 4.16016 22C4.16016 22.41 3.82016 22.75 3.41016 22.75C3.00016 22.75 2.66016 22.41 2.66016 22C2.66016 17.73 6.85015 14.25 12.0002 14.25C17.1502 14.25 21.3401 17.73 21.3401 22C21.3401 22.41 21.0001 22.75 20.5901 22.75Z"
                        fill="#292D32"
                      />
                    </svg>
                  </ListItemIcon>
                  <ListItemText sx={{ color: "rgba(17, 17, 17, 0.68)", fontSize: "16px", fontWeight: 500 }}>
                    View Profile
                  </ListItemText>
                </ListItem>
                <Divider />
                <ListItem onClick={handleLogout}>
                  <ListItemIcon sx={{ minWidth: "32px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15.24 22.27H15.11C10.67 22.27 8.53002 20.52 8.16002 16.6C8.12002 16.19 8.42002 15.82 8.84002 15.78C9.24002 15.74 9.62002 16.05 9.66002 16.46C9.95002 19.6 11.43 20.77 15.12 20.77H15.25C19.32 20.77 20.76 19.33 20.76 15.26V8.74001C20.76 4.67001 19.32 3.23001 15.25 3.23001H15.12C11.41 3.23001 9.93002 4.42001 9.66002 7.62001C9.61002 8.03001 9.26002 8.34001 8.84002 8.30001C8.42002 8.27001 8.12001 7.90001 8.15001 7.49001C8.49001 3.51001 10.64 1.73001 15.11 1.73001H15.24C20.15 1.73001 22.25 3.83001 22.25 8.74001V15.26C22.25 20.17 20.15 22.27 15.24 22.27Z"
                        fill="rgba(17, 17, 17, 0.68)"
                      />
                      <path
                        d="M15.0001 12.75H3.62012C3.21012 12.75 2.87012 12.41 2.87012 12C2.87012 11.59 3.21012 11.25 3.62012 11.25H15.0001C15.4101 11.25 15.7501 11.59 15.7501 12C15.7501 12.41 15.4101 12.75 15.0001 12.75Z"
                        fill="rgba(17, 17, 17, 0.68)"
                      />
                      <path
                        d="M5.84994 16.1C5.65994 16.1 5.46994 16.03 5.31994 15.88L1.96994 12.53C1.67994 12.24 1.67994 11.76 1.96994 11.47L5.31994 8.12C5.60994 7.83 6.08994 7.83 6.37994 8.12C6.66994 8.41 6.66994 8.89 6.37994 9.18L3.55994 12L6.37994 14.82C6.66994 15.11 6.66994 15.59 6.37994 15.88C6.23994 16.03 6.03994 16.1 5.84994 16.1Z"
                        fill="rgba(17, 17, 17, 0.68)"
                      />
                    </svg>
                  </ListItemIcon>
                  <ListItemText sx={{ color: "rgba(17, 17, 17, 0.68)", fontSize: "16px", fontWeight: 500 }}>
                    Logout
                  </ListItemText>
                </ListItem>
              </DropdownMenu>
            </Box>
            <Avatar
              src="/images/profile/user-1.jpg"
              alt="image"
              sx={{
                width: 32,
                height: 32,
                display: { xs: "block", sm: "none" },
                cursor: "pointer",
              }}
              onClick={handleClick}
            />
          </Stack>
        </ToolbarStyled>
      </AppBarStyled>

      <BottomNav elevation={3}>
        <BottomNavigation
          showLabels
          value={pathname}
          onChange={(event, newValue) => {
            router.push(newValue);
          }}
        >
          {links.map((link) => (
            <BottomNavigationAction key={link.title} label={link.title} value={link.href} icon={link.icon} />
          ))}
        </BottomNavigation>
      </BottomNav>
    </>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
