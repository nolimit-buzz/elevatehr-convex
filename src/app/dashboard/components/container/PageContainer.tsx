// import { Helmet } from 'react-helmet';
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Box, SxProps, Theme } from "@mui/material";

type Props = {
  description?: string;
  customStyle?: SxProps<Theme>;
  children: JSX.Element | JSX.Element[];
  title?: string;
};

const PageContainer = ({ title, description, children, customStyle }: Props) => (
  <HelmetProvider>
    <Box sx={{ maxWidth: "1440px", margin: "auto", padding: "20px", width: "100%", ...(customStyle as object) }}>
      <Box sx={{ margin: "20px", position: "relative" }}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Helmet>
        {children}
      </Box>
    </Box>
  </HelmetProvider>
);

export default PageContainer;
