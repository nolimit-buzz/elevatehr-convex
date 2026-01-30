"use client";
import Link from "next/link";
import { Box, Stack, Typography, Container, styled, Chip } from "@mui/material";
import PageContainer from "@/app/dashboard/components/container/PageContainer";
import Register from "../auth/Register";
import Image from "next/image";
import { useTheme } from '@mui/material/styles';
import metadata from "@/utils/metadata";
import { motion, Variants } from "framer-motion";

const Banner = styled(Box)(({ theme }) => ({
  width: '100%',
  background: theme.palette.primary.main,
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '28px',
}));

const Pill = styled(Chip)(({ theme }) => ({
  padding: '10px 12px',
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  color: '#fff',
}));

// Animation variants for left section
const leftContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const leftItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const logoVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const illustrationVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.9,
    rotateY: -5
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.3
    }
  }
};

const textVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.6
    }
  }
};

const RegisterPage = () => {
  const theme = useTheme();

  return (
    <PageContainer title="Register" description="This is the register page">
      <Stack 
        direction="row" 
        sx={{ 
          width: '100%',
          minHeight: '100vh',
          backgroundColor: 'white'
        }}
      >
        {/* Left Section with Background Image */}
        <Box 
          sx={{ 
            boxSizing:'border-box',
            margin:'80px',
            position: "relative", 
            backgroundColor: "white", 
            flex: 1 
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: "secondary.light",
              borderRadius: '20px',
              backgroundImage: "url(/images/backgrounds/login-bg.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Background Image */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: 2,
              }}
            />

            {/* Overlay Content */}
            <motion.div
              variants={leftContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <Stack 
                spacing={4} 
                alignItems="center" 
                justifyContent="space-evenly" 
                sx={{ position: "absolute", width: "100%", height: "100%", display: "flex" }}
              >
                {/* Logo */}
                <motion.div variants={logoVariants}>
                  <Image 
                    src="/images/logos/logo.svg" 
                    alt="Company Logo" 
                    width={103} 
                    height={22} 
                    style={{ flexShrink: 0 }}
                  />
                </motion.div>

                {/* Center Image */}
                <motion.div variants={illustrationVariants}>
                  <Image 
                    src="/images/login-left.svg" 
                    alt="Login Illustration" 
                    width={548} 
                    height={436} 
                    style={{ flexShrink: 0 }}
                  />
                </motion.div>

                {/* Description Text */}
                <motion.div variants={textVariants}>
                  <Typography
                    sx={{
                      color: "rgba(17, 17, 17, 0.84)",
                      textAlign: "center",
                      fontSize: "32px",
                      fontStyle: "normal",
                      fontWeight: 600,
                      lineHeight: "120%", // 38.4px
                    }}
                  >
                    Effortless hiring processes <br /> and discovering top talents easily.
                  </Typography>
                </motion.div>
              </Stack>
            </motion.div>
          </Box>
        </Box>

        {/* Right Section */}
        <Stack justifyContent="center" sx={{ flex: 1, minHeight: "100vh", height:"auto", backgroundColor: "white" }}>
          <Box sx={{ p: 4, width: "100%", maxWidth: 600, margin: "0 auto" }}>
            <Register
              title={`Welcome to ${metadata.host}`}
              subtext={
                <Typography variant="subtitle1" textAlign="center" color="grey.100" mb={'48px'}>
                  Create an account for your Organization
                </Typography>
              }
            />
          </Box>
        </Stack>
      </Stack>
    </PageContainer>
  );
};

export default RegisterPage;
