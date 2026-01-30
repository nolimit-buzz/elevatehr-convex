"use client";
import Link from "next/link";
import { Box, Stack, Typography, Container, styled, Chip } from "@mui/material";
import PageContainer from "@/app/dashboard/components/container/PageContainer";
import AuthLogin from "@/app/dashboard/components/auth/AuthLogin";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

const Login = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <PageContainer
      title="Login"
      description="This is the login page"
      customStyle={{
        padding: 0,
        [theme.breakpoints.up("md")]: {
          padding: 2,
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "white",
        }}
      >
        {/* Left Section with Background Image */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            boxSizing: "border-box",
            margin: { md: "40px", xl: "80px" },
            marginRight: { md: "0px", lg: "0px", xl: "0px" },
            position: "relative",
            backgroundColor: "white",
            flex: 1,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: "secondary.light",
              borderRadius: "20px",
              backgroundImage: "url(/images/backgrounds/login-bg.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              animation: "wave 6s ease-in-out infinite, colorShift 8s ease-in-out infinite",
              "@keyframes wave": {
                "0%, 100%": {
                  backgroundPosition: "-2% -2%",
                },
                "50%": {
                  backgroundPosition: "12% 12%",
                },
              },
              "@keyframes colorShift": {
                "0%, 100%": {
                  backgroundColor: "secondary.light",
                },
                "50%": {
                  backgroundColor: "rgba(219, 221, 240, 0.8)",
                },
              },
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
            <Stack
              spacing={4}
              alignItems="center"
              justifyContent="space-evenly"
              sx={{ position: "absolute", width: "100%", height: "100%", display: "flex" }}
            >
              {/* Logo */}
              <Image src="/images/logos/logo.svg" alt="Company Logo" width={103} height={22} />

              {/* Center Image */}
              <Box
                sx={{
                  [theme.breakpoints.down("lg")]: {
                    width: "340px",
                  },
                  [theme.breakpoints.up("lg")]: {
                    width: "548px",
                  },
                  height: "auto",
                  animation: "bounce 3s ease-in-out infinite",
                  "@keyframes bounce": {
                    "0%, 100%": {
                      transform: "translateY(0)",
                    },
                    "50%": {
                      transform: "translateY(-5px)",
                    },
                  },
                }}
              >
                <Image
                  src="/images/login-left.svg"
                  alt="Login Illustration"
                  width={548}
                  height={436}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Box>
              {/* Description Text */}
              <Typography
                sx={{
                  color: "rgba(17, 17, 17, 0.84)",
                  textAlign: "center",
                  fontSize: { xs: "24px", md: "32px" },
                  fontStyle: "normal",
                  fontWeight: 600,
                  lineHeight: "120%",
                  px: { xs: 2, md: 0 },
                }}
              >
                Effortless hiring processes <br /> and discovering top talents easily.
              </Typography>
            </Stack>
          </Box>
        </Box>

        {/* Right Section */}
        <Stack
          justifyContent="center"
          sx={{
            flex: 1,
            minHeight: { xs: "100vh", md: "auto" },
            px: { xs: 2, sm: 4, md: 6 },
            backgroundColor: "white",
            position: "relative",
            [theme.breakpoints.down("md")]: {
              backgroundImage: "url(/images/backgrounds/login-bg.svg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: "secondary.light",
            },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              height: "200px",
              backgroundImage: "url(/images/login-left.svg)",
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              zIndex: 3,
              display: { xs: "block", md: "none" },
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: 600,
              margin: "0 auto",
              backgroundColor: "white",
              borderRadius: "20px",
              px: { xs: 0.5, sm: 3, md: 4 },
              py: { xs: 1, sm: 6, md: 8 },
            }}
          >
            <Stack spacing={1} mb={3}>
              <Typography
                variant="h1"
                align="center"
                color="grey.100"
                sx={{
                  fontSize: { xs: "20px", sm: "32px", md: "40px" },
                  mb: { xs: 0.5, sm: 2 },
                }}
              >
                Login to your Account
              </Typography>
              <Typography
                variant="subtitle1"
                textAlign="center"
                color="grey.100"
                mb={{ xs: 1, md: "48px" }}
                sx={{
                  fontSize: { xs: "12px", sm: "16px" },
                }}
              >
                Enter your login details
              </Typography>
            </Stack>
            <AuthLogin
              subtitle={
                <Stack direction="row" spacing={0.5} justifyContent="center" mt={1}>
                  <Typography
                    color="06C680"
                    variant="h6"
                    fontWeight={500}
                    sx={{
                      fontSize: { xs: "12px", sm: "16px" },
                    }}
                  >
                    Don&apos;t have an account?
                  </Typography>
                  <Typography
                    component={Link}
                    href="/authentication/register"
                    color="primary"
                    variant="h6"
                    fontWeight={500}
                    sx={{
                      fontSize: { xs: "12px", sm: "16px" },
                    }}
                  >
                    Create an account
                  </Typography>
                </Stack>
              }
              onSuccess={(response) => void router.push("/dashboard")}
            />
          </Box>
        </Stack>
      </Stack>
    </PageContainer>
  );
};

export default Login;
