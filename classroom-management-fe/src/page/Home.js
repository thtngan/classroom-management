import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {useUserStore} from "../context/UserStoreProvider";

export default function Home() {
  const { isAuthenticated } = useUserStore();

  return (
    <>
      <CssBaseline />
        <main>
          <Box
            sx={{
              bgcolor: 'background.paper',
              pt: 8,
              pb: 6,
            }}
          >
            <Container maxWidth="sm">
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="text.primary"
                gutterBottom
              >
                HAQ Classroom
              </Typography>
              <Typography variant="h5" align="center" color="text.secondary" paragraph>
                HAQ Classroom helps educators create engaging learning experiences they can
                personalize, manage, and measure.
              </Typography>
              {!isAuthenticated()  && (
                  <Stack
                    sx={{ pt: 4 }}
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                  >
                    <Button href="/login" variant="contained">Start now</Button>
                  </Stack>
                )
              }

            </Container>
          </Box>
        </main>


    </>
  );
}